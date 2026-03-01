/**
 * XcodeGraph Boundary Validation
 *
 * Lenient Zod schema that validates the minimal required shape of raw
 * XcodeGraph JSON without being strict about every field. Uses z.looseObject()
 * so unknown fields pass through, allowing forward-compatibility when
 * XcodeGraph adds new fields or enum values.
 *
 * @module services/xcode-graph.validation
 */

import { z } from 'zod';

// ==================== Raw Graph Schema ====================

/**
 * Lenient schema for raw Tuist graph JSON.
 * Validates only the minimal required shape — unknown keys are preserved.
 */
interface RawGraphShape {
  name: string;
  path: string;
  projects: unknown[];
  dependencies: unknown[];
}

export const RawGraphSchema: z.ZodType<RawGraphShape> = z.looseObject({
  name: z.string(),
  path: z.string(),
  projects: z.array(z.unknown()),
  dependencies: z.array(z.unknown()),
});

export type RawGraph = z.infer<typeof RawGraphSchema>;

// ==================== Safe Parse Result ====================

export interface SafeParseGraphResult {
  success: true;
  data: RawGraph;
  warnings: string[];
}

export interface SafeParseGraphFailure {
  success: false;
  data: undefined;
  warnings: string[];
}

export type SafeParseGraphReturn = SafeParseGraphResult | SafeParseGraphFailure;

// ==================== Safe Parse Function ====================

/**
 * Validate raw Tuist graph JSON at the boundary.
 * Returns warnings for unexpected shapes rather than throwing.
 */
export function safeParseGraph(raw: unknown): SafeParseGraphReturn {
  const warnings: string[] = [];

  if (raw === null || raw === undefined || typeof raw !== 'object') {
    return {
      success: false,
      data: undefined,
      warnings: ['Raw graph input is not an object'],
    };
  }

  const result = RawGraphSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return {
      success: false,
      data: undefined,
      warnings: [`Graph validation failed: ${issues.join('; ')}`],
    };
  }

  const data = result.data;

  // Collect warnings for unexpected shapes
  if (data.projects.length === 0) {
    warnings.push('Graph has no projects');
  }

  if (data.projects.length % 2 !== 0) {
    warnings.push(
      'Projects array has odd length — expected flat alternating [path, Project, ...] pairs',
    );
  }

  if (data.dependencies.length > 0 && data.dependencies.length % 2 !== 0) {
    warnings.push(
      'Dependencies array has odd length — expected flat alternating [source, targets[], ...] pairs',
    );
  }

  // Check for unknown top-level fields that might indicate a schema change
  const knownFields = new Set([
    'name',
    'path',
    'workspace',
    'projects',
    'packages',
    'dependencies',
    'dependencyConditions',
  ]);
  const rawObj = raw as Record<string, unknown>;
  for (const key of Object.keys(rawObj)) {
    if (!knownFields.has(key)) {
      warnings.push(`Unknown top-level field: "${key}"`);
    }
  }

  return { success: true, data, warnings };
}

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
/**
 * Lenient schema for raw Tuist graph JSON.
 * Validates only the minimal required shape — unknown keys are preserved.
 */
export declare const RawGraphSchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    projects: z.ZodArray<z.ZodUnknown>;
    dependencies: z.ZodArray<z.ZodUnknown>;
}, z.core.$loose>;
export type RawGraph = z.infer<typeof RawGraphSchema>;
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
/**
 * Validate raw Tuist graph JSON at the boundary.
 * Returns warnings for unexpected shapes rather than throwing.
 */
export declare function safeParseGraph(raw: unknown): SafeParseGraphReturn;

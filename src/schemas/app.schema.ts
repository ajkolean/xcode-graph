/**
 * App Schema - Application state validation
 *
 * Defines schemas for view modes, filter states, and UI configuration.
 * Handles transformation between serializable arrays and runtime Sets.
 *
 * @module schemas/app
 */

import { z } from 'zod';

// ==================== Active Tab ====================

/**
 * Active tab schema - application navigation tabs
 *
 * - overview: Dashboard overview
 * - builds: Build history
 * - test-runs: Test run results
 * - module-cache: Module cache stats
 * - xcode-cache: Xcode cache stats
 * - previews: SwiftUI previews
 * - qa: QA automation
 * - bundles: Bundle analysis
 * - graph: Dependency graph visualization
 */
export const ActiveTabSchema = z.enum([
  'overview',
  'builds',
  'test-runs',
  'module-cache',
  'xcode-cache',
  'previews',
  'qa',
  'bundles',
  'graph',
]);

// ==================== View Mode ====================

/**
 * View mode schema - determines graph visualization mode
 *
 * - full: Show entire graph
 * - focused: Show selected node and direct connections
 * - path: Show path between two nodes
 * - impact: Show downstream dependents
 * - dependents: Show nodes that depend on selection
 * - both: Show both dependencies and dependents
 */
export const ViewModeSchema = z.enum(['full', 'focused', 'path', 'impact', 'dependents', 'both']);

// ==================== Filter State ====================

/**
 * Filter state input schema - serializable format with arrays
 */
export const FilterStateInputSchema = z.object({
  /** Selected node types to show */
  nodeTypes: z.array(z.string()),
  /** Selected platforms to show */
  platforms: z.array(z.string()),
  /** Selected origins to show */
  origins: z.array(z.string()),
  /** Selected projects to show */
  projects: z.array(z.string()),
  /** Selected packages to show */
  packages: z.array(z.string()),
});

/**
 * Filter state schema - transforms arrays to Sets for runtime use
 */
export const FilterStateSchema = FilterStateInputSchema.transform((input) => ({
  nodeTypes: new Set(input.nodeTypes),
  platforms: new Set(input.platforms),
  origins: new Set(input.origins),
  projects: new Set(input.projects),
  packages: new Set(input.packages),
}));

/**
 * Serialize FilterState back to arrays for persistence
 * @param state - Runtime filter state with Sets
 * @returns Serializable filter state with arrays
 */
export function serializeFilterState(state: FilterState): FilterStateInput {
  return {
    nodeTypes: Array.from(state.nodeTypes),
    platforms: Array.from(state.platforms),
    origins: Array.from(state.origins),
    projects: Array.from(state.projects),
    packages: Array.from(state.packages),
  };
}

// ==================== Type Exports ====================

/** Active tab values */
export type ActiveTab = z.infer<typeof ActiveTabSchema>;
/** View mode values */
export type ViewMode = z.infer<typeof ViewModeSchema>;
/** Serializable filter state */
export type FilterStateInput = z.infer<typeof FilterStateInputSchema>;
/** Runtime filter state with Sets */
export type FilterState = z.output<typeof FilterStateSchema>;

/** All active tab values for iteration */
export const ACTIVE_TAB_VALUES = ActiveTabSchema.options;
/** All view mode values for iteration */
export const VIEW_MODE_VALUES = ViewModeSchema.options;
/** Default active tab */
export const DEFAULT_ACTIVE_TAB: ActiveTab = 'graph';

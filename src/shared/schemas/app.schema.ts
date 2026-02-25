/**
 * App Schema - Application state validation
 *
 * Defines schemas for view modes, filter states, and UI configuration.
 * Handles transformation between serializable arrays and runtime Sets.
 *
 * @module schemas/app
 */

import { z } from 'zod';
import type { NodeType, Origin, Platform } from './graph.schema';

// ==================== Native Enums ====================

/**
 * Active tab enum - application navigation tabs
 *
 * - Overview: Dashboard overview
 * - Builds: Build history
 * - TestRuns: Test run results
 * - ModuleCache: Module cache stats
 * - XcodeCache: Xcode cache stats
 * - Previews: SwiftUI previews
 * - Qa: QA automation
 * - Bundles: Bundle analysis
 * - Graph: Dependency graph visualization
 */
export enum ActiveTab {
  Overview = 'overview',
  Builds = 'builds',
  TestRuns = 'test-runs',
  ModuleCache = 'module-cache',
  XcodeCache = 'xcode-cache',
  Previews = 'previews',
  Qa = 'qa',
  Bundles = 'bundles',
  Graph = 'graph',
}

/**
 * View mode enum - determines graph visualization mode
 *
 * - Full: Show entire graph
 * - Focused: Show selected node and its transitive dependencies
 * - Path: Show path between two nodes
 * - Dependents: Show nodes that transitively depend on selection
 * - Both: Show both dependencies and dependents
 */
export enum ViewMode {
  Full = 'full',
  Focused = 'focused',
  Path = 'path',
  Dependents = 'dependents',
  Both = 'both',
}

// ==================== Type Definitions ====================

/** Serializable filter state with arrays */
export interface FilterStateInput {
  /** Selected node types to show */
  nodeTypes: string[];
  /** Selected platforms to show */
  platforms: string[];
  /** Selected origins to show */
  origins: string[];
  /** Selected projects to show */
  projects: string[];
  /** Selected packages to show */
  packages: string[];
}

/** Runtime filter state with Sets for efficient lookup */
export interface FilterState {
  /** Selected node types to show */
  nodeTypes: Set<NodeType>;
  /** Selected platforms to show */
  platforms: Set<Platform>;
  /** Selected origins to show */
  origins: Set<Origin>;
  /** Selected projects to show */
  projects: Set<string>;
  /** Selected packages to show */
  packages: Set<string>;
}

// ==================== Enum Schemas ====================

export const ActiveTabSchema: z.ZodType<ActiveTab> = z.enum(ActiveTab);
export const ViewModeSchema: z.ZodType<ViewMode> = z.enum(ViewMode);

// ==================== Filter State Schemas ====================

/**
 * Filter state input schema - serializable format with arrays
 */
export const FilterStateInputSchema: z.ZodType<FilterStateInput> = z.object({
  nodeTypes: z.array(z.string()),
  platforms: z.array(z.string()),
  origins: z.array(z.string()),
  projects: z.array(z.string()),
  packages: z.array(z.string()),
});

/**
 * Filter state schema - transforms arrays to Sets for runtime use
 */
export const FilterStateSchema: z.ZodPipe<
  z.ZodType<FilterStateInput>,
  z.ZodTransform<FilterState, FilterStateInput>
> = FilterStateInputSchema.transform((input) => ({
  nodeTypes: new Set(input.nodeTypes) as Set<NodeType>,
  platforms: new Set(input.platforms) as Set<Platform>,
  origins: new Set(input.origins) as Set<Origin>,
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

// ==================== Value Arrays ====================

/** All active tab values for iteration */
export const ACTIVE_TAB_VALUES: ActiveTab[] = Object.values(ActiveTab);
/** All view mode values for iteration */
export const VIEW_MODE_VALUES: ViewMode[] = Object.values(ViewMode);
/** Default active tab */
export const DEFAULT_ACTIVE_TAB: ActiveTab = ActiveTab.Graph;

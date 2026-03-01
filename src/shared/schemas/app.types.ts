/**
 * App Types - Application state types
 *
 * Pure TypeScript enums, interfaces, and constants for view modes, filter states,
 * and UI configuration. No Zod dependency — see app.schema.ts for validation schemas.
 *
 * @module schemas/app
 */

import type { NodeType, Origin, Platform } from './graph.types';

/**
 * Active tab enum - application navigation tabs
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
 */
export enum ViewMode {
  Full = 'full',
  Focused = 'focused',
  Path = 'path',
  Dependents = 'dependents',
  Both = 'both',
}

/** Serializable filter state with arrays */
export interface FilterStateInput {
  nodeTypes: string[];
  platforms: string[];
  origins: string[];
  projects: string[];
  packages: string[];
}

/** Runtime filter state with Sets for efficient lookup */
export interface FilterState {
  nodeTypes: Set<NodeType>;
  platforms: Set<Platform>;
  origins: Set<Origin>;
  projects: Set<string>;
  packages: Set<string>;
}

/**
 * Serialize FilterState back to arrays for persistence.
 *
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

/** All active tab values for iteration */
export const ACTIVE_TAB_VALUES: ActiveTab[] = Object.values(ActiveTab);
/** All view mode values for iteration */
export const VIEW_MODE_VALUES: ViewMode[] = Object.values(ViewMode);
/** Default active tab */
export const DEFAULT_ACTIVE_TAB: ActiveTab = ActiveTab.Graph;

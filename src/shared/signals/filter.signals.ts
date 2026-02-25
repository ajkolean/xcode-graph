/**
 * Filter Signals - Graph filtering and search state
 *
 * Manages active filters for node types, platforms, origins,
 * projects, and packages. Also handles search query state.
 *
 * @module signals/filter
 */

import { Signal, signal } from '@lit-labs/signals';
import type { FilterState } from '@shared/schemas/app.schema';
import {
  NODE_TYPE_VALUES,
  type NodeType,
  ORIGIN_VALUES,
  type Origin,
  PLATFORM_VALUES,
  type Platform,
} from '@shared/schemas/graph.schema';

// ==================== Default Values ====================

/** Default filter configuration - show everything */
export const DEFAULT_FILTERS: FilterState = {
  nodeTypes: new Set<NodeType>(NODE_TYPE_VALUES),
  platforms: new Set<Platform>(PLATFORM_VALUES),
  origins: new Set<Origin>(ORIGIN_VALUES),
  projects: new Set<string>(),
  packages: new Set<string>(),
};

// ==================== State Signals ====================

/** Current active filters */
export const filters: Signal.State<FilterState> = signal<FilterState>({ ...DEFAULT_FILTERS });

/** Current search query */
export const searchQuery: Signal.State<string> = signal<string>('');

/** All available projects (for active filter detection) */
export const allProjects: Signal.State<Set<string>> = signal<Set<string>>(new Set());

/** All available packages (for active filter detection) */
export const allPackages: Signal.State<Set<string>> = signal<Set<string>>(new Set());

// ==================== Computed Signals ====================

/**
 * Check if any filters are active (not showing everything)
 * Returns true if any filter is restricting the view
 */
export const hasActiveFilters: Signal.Computed<boolean> = new Signal.Computed(() => {
  const f = filters.get();
  const query = searchQuery.get();
  const projects = allProjects.get();
  const packages = allPackages.get();

  const allTypes = NODE_TYPE_VALUES.length;
  const allPlatforms = PLATFORM_VALUES.length;
  const allOrigins = ORIGIN_VALUES.length;
  const projectCount = projects.size || f.projects.size;
  const packageCount = packages.size || f.packages.size;

  return (
    f.nodeTypes.size < allTypes ||
    f.platforms.size < allPlatforms ||
    f.origins.size < allOrigins ||
    (projectCount > 0 && f.projects.size < projectCount) ||
    (packageCount > 0 && f.packages.size < packageCount) ||
    query !== ''
  );
});

// ==================== Reset Utility ====================

/**
 * Reset all filter signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetFilterSignals(): void {
  filters.set({ ...DEFAULT_FILTERS });
  searchQuery.set('');
  allProjects.set(new Set());
  allPackages.set(new Set());
}

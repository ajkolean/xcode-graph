/**
 * Filter Signals - Graph filtering and search state
 *
 * Manages active filters for node types, platforms, origins,
 * projects, and packages. Also handles search query state.
 *
 * @module signals/filter
 */

import { Signal, signal } from '@lit-labs/signals';
import type { FilterState } from '@shared/schemas/app.types';
import {
  NODE_TYPE_VALUES,
  type NodeType,
  ORIGIN_VALUES,
  type Origin,
  PLATFORM_VALUES,
  type Platform,
} from '@shared/schemas/graph.types';

/**
 * Default filter configuration - show everything
 *
 * @public
 */
export const DEFAULT_FILTERS: FilterState = {
  nodeTypes: new Set<NodeType>(NODE_TYPE_VALUES),
  platforms: new Set<Platform>(PLATFORM_VALUES),
  origins: new Set<Origin>(ORIGIN_VALUES),
  projects: new Set<string>(),
  packages: new Set<string>(),
};

/**
 * Current active filters
 *
 * @public
 */
export const filters: Signal.State<FilterState> = signal<FilterState>({
  ...DEFAULT_FILTERS,
  nodeTypes: new Set(DEFAULT_FILTERS.nodeTypes),
  platforms: new Set(DEFAULT_FILTERS.platforms),
  origins: new Set(DEFAULT_FILTERS.origins),
  projects: new Set(DEFAULT_FILTERS.projects),
  packages: new Set(DEFAULT_FILTERS.packages),
});

/**
 * Current search query
 *
 * @public
 */
export const searchQuery: Signal.State<string> = signal<string>('');

/**
 * All available projects (for active filter detection)
 *
 * @public
 */
export const allProjects: Signal.State<Set<string>> = signal<Set<string>>(new Set());

/**
 * All available packages (for active filter detection)
 *
 * @public
 */
export const allPackages: Signal.State<Set<string>> = signal<Set<string>>(new Set());

/**
 * Check if any filters are active (not showing everything)
 * Returns true if any filter is restricting the view
 *
 * @public
 */
export const hasActiveFilters: Signal.Computed<boolean> = new Signal.Computed(() => {
  const currentFilters = filters.get();
  const query = searchQuery.get();
  const projects = allProjects.get();
  const packages = allPackages.get();

  const allTypes = NODE_TYPE_VALUES.length;
  const allPlatforms = PLATFORM_VALUES.length;
  const allOrigins = ORIGIN_VALUES.length;
  const projectCount = projects.size || currentFilters.projects.size;
  const packageCount = packages.size || currentFilters.packages.size;

  return (
    currentFilters.nodeTypes.size < allTypes ||
    currentFilters.platforms.size < allPlatforms ||
    currentFilters.origins.size < allOrigins ||
    (projectCount > 0 && currentFilters.projects.size < projectCount) ||
    (packageCount > 0 && currentFilters.packages.size < packageCount) ||
    query !== ''
  );
});

/**
 * Reset all filter signals to their initial state.
 * Useful for testing and cleanup.
 *
 * @public
 */
export function resetFilterSignals(): void {
  filters.set({
    ...DEFAULT_FILTERS,
    nodeTypes: new Set(DEFAULT_FILTERS.nodeTypes),
    platforms: new Set(DEFAULT_FILTERS.platforms),
    origins: new Set(DEFAULT_FILTERS.origins),
    projects: new Set(DEFAULT_FILTERS.projects),
    packages: new Set(DEFAULT_FILTERS.packages),
  });
  searchQuery.set('');
  allProjects.set(new Set());
  allPackages.set(new Set());
}

/**
 * Filter Actions - State mutation functions for filter signals
 *
 * Contains all actions for modifying filter and search state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/filter.actions
 */

import type { FilterState } from "@shared/schemas/app.schema";
import {
  allPackages,
  allProjects,
  DEFAULT_FILTERS,
  filters,
  searchQuery,
} from "./filter.signals";

// ==================== Helper Functions ====================

/**
 * Toggle a value in a Set, returning a new Set
 * @param set - The original set
 * @param value - The value to toggle
 * @returns A new Set with the value toggled
 */
function toggleSetValue<T>(set: Set<T>, value: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(value)) {
    newSet.delete(value);
  } else {
    newSet.add(value);
  }
  return newSet;
}

// ==================== Basic Actions ====================

/**
 * Replace all filters
 * @param newFilters - The new filter state
 */
export function setFilters(newFilters: FilterState): void {
  filters.set(newFilters);
}

/**
 * Update search query
 * @param query - The new search query
 */
export function setSearchQuery(query: string): void {
  searchQuery.set(query);
}

// ==================== Toggle Actions ====================

/**
 * Toggle a node type filter on/off
 * @param type - The node type to toggle
 */
export function toggleNodeType(type: string): void {
  const current = filters.get();
  filters.set({
    ...current,
    nodeTypes: toggleSetValue(current.nodeTypes, type),
  });
}

/**
 * Toggle a platform filter on/off
 * @param platform - The platform to toggle
 */
export function togglePlatform(platform: string): void {
  const current = filters.get();
  filters.set({
    ...current,
    platforms: toggleSetValue(current.platforms, platform),
  });
}

/**
 * Toggle an origin filter on/off
 * @param origin - The origin to toggle
 */
export function toggleOrigin(origin: string): void {
  const current = filters.get();
  filters.set({
    ...current,
    origins: toggleSetValue(current.origins, origin),
  });
}

/**
 * Toggle a project filter on/off
 * @param project - The project to toggle
 */
export function toggleProject(project: string): void {
  const current = filters.get();
  filters.set({
    ...current,
    projects: toggleSetValue(current.projects, project),
  });
}

/**
 * Toggle a package filter on/off
 * @param pkg - The package to toggle
 */
export function togglePackage(pkg: string): void {
  const current = filters.get();
  filters.set({
    ...current,
    packages: toggleSetValue(current.packages, pkg),
  });
}

// ==================== Bulk Actions ====================

/**
 * Reset filters to defaults
 * @param defaults - Optional custom defaults (uses DEFAULT_FILTERS if not provided)
 */
export function clearFilters(defaults?: FilterState): void {
  filters.set(defaults ?? { ...DEFAULT_FILTERS });
  searchQuery.set("");
}

/**
 * Initialize filters from available data
 * @param projects - Set of all available projects
 * @param packages - Set of all available packages
 */
export function initializeFromData(
  projects: Set<string>,
  packages: Set<string>,
): void {
  filters.set({
    ...DEFAULT_FILTERS,
    projects: new Set(projects),
    packages: new Set(packages),
  });
  allProjects.set(new Set(projects));
  allPackages.set(new Set(packages));
}

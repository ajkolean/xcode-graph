/**
 * Filter Actions - State mutation functions for filter signals
 *
 * Contains all actions for modifying filter and search state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/filter.actions
 */
import type { FilterState } from '@shared/schemas/app.types';
import type { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
/**
 * Replace all filters
 * @param newFilters - The new filter state
 */
export declare function setFilters(newFilters: FilterState): void;
/**
 * Update search query
 * @param query - The new search query
 */
export declare function setSearchQuery(query: string): void;
/**
 * Toggle a node type filter on/off
 * @param type - The node type to toggle
 */
export declare function toggleNodeType(type: NodeType): void;
/**
 * Toggle a platform filter on/off
 * @param platform - The platform to toggle
 */
export declare function togglePlatform(platform: Platform): void;
/**
 * Toggle an origin filter on/off
 * @param origin - The origin to toggle
 */
export declare function toggleOrigin(origin: Origin): void;
/**
 * Toggle a project filter on/off
 * @param project - The project to toggle
 */
export declare function toggleProject(project: string): void;
/**
 * Toggle a package filter on/off
 * @param pkg - The package to toggle
 */
export declare function togglePackage(pkg: string): void;
/**
 * Reset filters to defaults
 * @param defaults - Optional custom defaults (uses DEFAULT_FILTERS if not provided)
 */
export declare function clearFilters(defaults?: FilterState): void;
/**
 * Initialize filters from available data
 * @param projects - Set of all available projects
 * @param packages - Set of all available packages
 */
export declare function initializeFromData(projects: Set<string>, packages: Set<string>): void;

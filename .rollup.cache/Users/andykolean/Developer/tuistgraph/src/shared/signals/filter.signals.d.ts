/**
 * Filter Signals - Graph filtering and search state
 *
 * Manages active filters for node types, platforms, origins,
 * projects, and packages. Also handles search query state.
 *
 * @module signals/filter
 */
import { Signal } from '@lit-labs/signals';
import type { FilterState } from '@shared/schemas/app.types';
/** Default filter configuration - show everything */
export declare const DEFAULT_FILTERS: FilterState;
/** Current active filters */
export declare const filters: Signal.State<FilterState>;
/** Current search query */
export declare const searchQuery: Signal.State<string>;
/** All available projects (for active filter detection) */
export declare const allProjects: Signal.State<Set<string>>;
/** All available packages (for active filter detection) */
export declare const allPackages: Signal.State<Set<string>>;
/**
 * Check if any filters are active (not showing everything)
 * Returns true if any filter is restricting the view
 */
export declare const hasActiveFilters: Signal.Computed<boolean>;
/**
 * Reset all filter signals to their initial state.
 * Useful for testing and cleanup.
 */
export declare function resetFilterSignals(): void;

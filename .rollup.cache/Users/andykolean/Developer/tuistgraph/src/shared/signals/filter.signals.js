/**
 * Filter Signals - Graph filtering and search state
 *
 * Manages active filters for node types, platforms, origins,
 * projects, and packages. Also handles search query state.
 *
 * @module signals/filter
 */
import { Signal, signal } from '@lit-labs/signals';
import { NODE_TYPE_VALUES, ORIGIN_VALUES, PLATFORM_VALUES, } from '@shared/schemas/graph.types';
// ==================== Default Values ====================
/** Default filter configuration - show everything */
export const DEFAULT_FILTERS = {
    nodeTypes: new Set(NODE_TYPE_VALUES),
    platforms: new Set(PLATFORM_VALUES),
    origins: new Set(ORIGIN_VALUES),
    projects: new Set(),
    packages: new Set(),
};
// ==================== State Signals ====================
/** Current active filters */
export const filters = signal({ ...DEFAULT_FILTERS });
/** Current search query */
export const searchQuery = signal('');
/** All available projects (for active filter detection) */
export const allProjects = signal(new Set());
/** All available packages (for active filter detection) */
export const allPackages = signal(new Set());
// ==================== Computed Signals ====================
/**
 * Check if any filters are active (not showing everything)
 * Returns true if any filter is restricting the view
 */
export const hasActiveFilters = new Signal.Computed(() => {
    const f = filters.get();
    const query = searchQuery.get();
    const projects = allProjects.get();
    const packages = allPackages.get();
    const allTypes = NODE_TYPE_VALUES.length;
    const allPlatforms = PLATFORM_VALUES.length;
    const allOrigins = ORIGIN_VALUES.length;
    const projectCount = projects.size || f.projects.size;
    const packageCount = packages.size || f.packages.size;
    return (f.nodeTypes.size < allTypes ||
        f.platforms.size < allPlatforms ||
        f.origins.size < allOrigins ||
        (projectCount > 0 && f.projects.size < projectCount) ||
        (packageCount > 0 && f.packages.size < packageCount) ||
        query !== '');
});
// ==================== Reset Utility ====================
/**
 * Reset all filter signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetFilterSignals() {
    filters.set({ ...DEFAULT_FILTERS });
    searchQuery.set('');
    allProjects.set(new Set());
    allPackages.set(new Set());
}
//# sourceMappingURL=filter.signals.js.map
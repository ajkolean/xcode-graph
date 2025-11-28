/**
 * Filter Store - Graph filtering and search state
 *
 * Manages active filters for node types, platforms, origins,
 * projects, and packages. Also handles search query state.
 *
 * @module stores/filterStore
 */

import { create } from 'zustand';
import type { FilterState } from '../schemas/app.schema';

/**
 * Filter store state and actions
 */
export interface FilterStore {
  /** Current active filters */
  filters: FilterState;
  /** Current search query */
  searchQuery: string;
  /** All available projects (for active filter detection) */
  allProjects: Set<string>;
  /** All available packages (for active filter detection) */
  allPackages: Set<string>;

  // ==================== Actions ====================
  /** Replace all filters */
  setFilters: (filters: FilterState) => void;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Toggle a node type filter on/off */
  toggleNodeType: (type: string) => void;
  /** Toggle a platform filter on/off */
  togglePlatform: (platform: string) => void;
  /** Toggle an origin filter on/off */
  toggleOrigin: (origin: string) => void;
  /** Toggle a project filter on/off */
  toggleProject: (project: string) => void;
  /** Toggle a package filter on/off */
  togglePackage: (pkg: string) => void;
  /** Reset filters to defaults */
  clearFilters: (defaults: FilterState) => void;
  /** Initialize filters from available data */
  initializeFromData: (projects: Set<string>, packages: Set<string>) => void;
}

/** Default filter configuration - show everything */
const defaultFilters: FilterState = {
  nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
  platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
  origins: new Set(['local', 'external']),
  projects: new Set(),
  packages: new Set(),
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: { ...defaultFilters },
  searchQuery: '',
  allProjects: new Set<string>(),
  allPackages: new Set<string>(),

  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleNodeType: (type) => {
    const { filters } = get();
    const newTypes = new Set(filters.nodeTypes);
    if (newTypes.has(type)) newTypes.delete(type);
    else newTypes.add(type);
    set({ filters: { ...filters, nodeTypes: newTypes } });
  },

  togglePlatform: (platform) => {
    const { filters } = get();
    const newPlatforms = new Set(filters.platforms);
    if (newPlatforms.has(platform)) newPlatforms.delete(platform);
    else newPlatforms.add(platform);
    set({ filters: { ...filters, platforms: newPlatforms } });
  },

  toggleOrigin: (origin) => {
    const { filters } = get();
    const newOrigins = new Set(filters.origins);
    if (newOrigins.has(origin)) newOrigins.delete(origin);
    else newOrigins.add(origin);
    set({ filters: { ...filters, origins: newOrigins } });
  },

  toggleProject: (project) => {
    const { filters } = get();
    const newProjects = new Set(filters.projects);
    if (newProjects.has(project)) newProjects.delete(project);
    else newProjects.add(project);
    set({ filters: { ...filters, projects: newProjects } });
  },

  togglePackage: (pkg) => {
    const { filters } = get();
    const newPackages = new Set(filters.packages);
    if (newPackages.has(pkg)) newPackages.delete(pkg);
    else newPackages.add(pkg);
    set({ filters: { ...filters, packages: newPackages } });
  },

  clearFilters: (defaults) => set({ filters: defaults, searchQuery: '' }),

  initializeFromData: (projects, packages) => {
    set({
      filters: {
        ...defaultFilters,
        projects,
        packages,
      },
      allProjects: new Set(projects),
      allPackages: new Set(packages),
    });
  },
}));

// ==================== Optimized Selectors ====================

/** Get current filters */
export const useFilters = () => useFilterStore((s) => s.filters);
/** Get current search query */
export const useSearchQuery = () => useFilterStore((s) => s.searchQuery);

/** Check if any filters are active (not showing everything) */
export function hasActiveFilters(
  filters: FilterState,
  searchQuery: string,
  allProjects: Set<string>,
  allPackages: Set<string>,
): boolean {
  const allTypes = 7; // Total node types
  const allPlatforms = 5;
  const allOrigins = 2;
  const projectCount = allProjects.size || filters.projects.size;
  const packageCount = allPackages.size || filters.packages.size;

  return (
    filters.nodeTypes.size < allTypes ||
    filters.platforms.size < allPlatforms ||
    filters.origins.size < allOrigins ||
    (projectCount > 0 && filters.projects.size < projectCount) ||
    (packageCount > 0 && filters.packages.size < packageCount) ||
    searchQuery !== ''
  );
}

export const useHasActiveFilters = () =>
  useFilterStore((s) => hasActiveFilters(s.filters, s.searchQuery, s.allProjects, s.allPackages));

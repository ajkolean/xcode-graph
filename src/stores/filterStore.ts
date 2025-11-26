import { create } from 'zustand';
import type { FilterState } from '../schemas/app.schema';

interface FilterStore {
  filters: FilterState;
  searchQuery: string;

  // Actions
  setFilters: (filters: FilterState) => void;
  setSearchQuery: (query: string) => void;
  toggleNodeType: (type: string) => void;
  togglePlatform: (platform: string) => void;
  toggleOrigin: (origin: string) => void;
  toggleProject: (project: string) => void;
  togglePackage: (pkg: string) => void;
  clearFilters: (defaults: FilterState) => void;
  initializeFromData: (projects: Set<string>, packages: Set<string>) => void;
}

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
    });
  },
}));

// Selectors for optimized subscriptions
export const useFilters = () => useFilterStore((s) => s.filters);
export const useSearchQuery = () => useFilterStore((s) => s.searchQuery);

export const useHasActiveFilters = () =>
  useFilterStore((s) => {
    const { filters, searchQuery } = s;
    const allTypes = 7; // Total node types
    const allPlatforms = 5;
    const allOrigins = 2;
    return (
      filters.nodeTypes.size < allTypes ||
      filters.platforms.size < allPlatforms ||
      filters.origins.size < allOrigins ||
      searchQuery !== ''
    );
  });

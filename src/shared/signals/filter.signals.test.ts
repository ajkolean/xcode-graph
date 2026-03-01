/**
 * Filter Signals Tests
 */

import { NODE_TYPE_VALUES, ORIGIN_VALUES, PLATFORM_VALUES } from '@shared/schemas/graph.types';
import { afterEach, describe, expect, it } from 'vitest';
import {
  allPackages,
  allProjects,
  DEFAULT_FILTERS,
  filters,
  hasActiveFilters,
  resetFilterSignals,
  searchQuery,
} from './filter.signals';

describe('filter.signals', () => {
  afterEach(() => {
    resetFilterSignals();
  });

  // ========================================
  // hasActiveFilters computed signal
  // ========================================

  it('should return false when all filters are at defaults', () => {
    expect(hasActiveFilters.get()).to.equal(false);
  });

  it('should return true when nodeTypes filter is restricted', () => {
    const current = filters.get();
    const restricted = new Set(current.nodeTypes);
    restricted.delete(NODE_TYPE_VALUES[0]);
    filters.set({ ...current, nodeTypes: restricted });

    expect(hasActiveFilters.get()).to.equal(true);
  });

  it('should return true when platforms filter is restricted', () => {
    const current = filters.get();
    const restricted = new Set(current.platforms);
    restricted.delete(PLATFORM_VALUES[0]);
    filters.set({ ...current, platforms: restricted });

    expect(hasActiveFilters.get()).to.equal(true);
  });

  it('should return true when origins filter is restricted', () => {
    const current = filters.get();
    const restricted = new Set(current.origins);
    restricted.delete(ORIGIN_VALUES[0]);
    filters.set({ ...current, origins: restricted });

    expect(hasActiveFilters.get()).to.equal(true);
  });

  it('should return true when projects filter is restricted below allProjects', () => {
    allProjects.set(new Set(['ProjectA', 'ProjectB', 'ProjectC']));
    const current = filters.get();
    filters.set({ ...current, projects: new Set(['ProjectA']) });

    expect(hasActiveFilters.get()).to.equal(true);
  });

  it('should return true when packages filter is restricted below allPackages', () => {
    allPackages.set(new Set(['PackageA', 'PackageB']));
    const current = filters.get();
    filters.set({ ...current, packages: new Set(['PackageA']) });

    expect(hasActiveFilters.get()).to.equal(true);
  });

  it('should return true when search query is non-empty', () => {
    searchQuery.set('test query');

    expect(hasActiveFilters.get()).to.equal(true);
  });

  // ========================================
  // resetFilterSignals
  // ========================================

  it('should reset all signals to defaults', () => {
    searchQuery.set('some search');
    allProjects.set(new Set(['A']));
    allPackages.set(new Set(['B']));
    const current = filters.get();
    const restricted = new Set(current.nodeTypes);
    restricted.delete(NODE_TYPE_VALUES[0]);
    filters.set({ ...current, nodeTypes: restricted });

    resetFilterSignals();

    expect(searchQuery.get()).to.equal('');
    expect(allProjects.get().size).to.equal(0);
    expect(allPackages.get().size).to.equal(0);
    expect(filters.get().nodeTypes.size).to.equal(DEFAULT_FILTERS.nodeTypes.size);
    expect(hasActiveFilters.get()).to.equal(false);
  });
});

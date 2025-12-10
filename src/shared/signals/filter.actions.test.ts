/**
 * Filter Actions Tests
 *
 * Comprehensive tests for filter state mutation functions.
 * Tests filter toggles, bulk operations, and initialization.
 */

import type { FilterState } from '@shared/schemas/app.schema';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import {
  clearFilters,
  initializeFromData,
  setFilters,
  setSearchQuery,
  toggleNodeType,
  toggleOrigin,
  togglePackage,
  togglePlatform,
  toggleProject,
} from './filter.actions';
import { allPackages, allProjects, DEFAULT_FILTERS, filters, searchQuery } from './filter.signals';

describe('filter.actions', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([filters, searchQuery, allProjects, allPackages]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  // ==================== Basic Actions ====================

  describe('setFilters', () => {
    it('should replace all filters', () => {
      const newFilters: FilterState = {
        nodeTypes: new Set(['framework']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(['Project1']),
        packages: new Set(['Package1']),
      };

      setFilters(newFilters);

      expect(filters.get()).toEqual(newFilters);
    });

    it('should replace with empty sets', () => {
      const newFilters: FilterState = {
        nodeTypes: new Set(),
        platforms: new Set(),
        origins: new Set(),
        projects: new Set(),
        packages: new Set(),
      };

      setFilters(newFilters);

      const current = filters.get();
      expect(current.nodeTypes.size).toBe(0);
      expect(current.platforms.size).toBe(0);
      expect(current.origins.size).toBe(0);
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      setSearchQuery('test query');

      expect(searchQuery.get()).toBe('test query');
    });

    it('should replace existing search query', () => {
      setSearchQuery('first query');
      setSearchQuery('second query');

      expect(searchQuery.get()).toBe('second query');
    });

    it('should allow empty string', () => {
      setSearchQuery('query');
      setSearchQuery('');

      expect(searchQuery.get()).toBe('');
    });
  });

  // ==================== Toggle Actions ====================

  describe('toggleNodeType', () => {
    it('should add node type when not present', () => {
      // Start with empty node types
      filters.set({ ...DEFAULT_FILTERS, nodeTypes: new Set() });

      toggleNodeType('framework');

      expect(filters.get().nodeTypes.has('framework')).toBe(true);
    });

    it('should remove node type when present', () => {
      // Start with framework included
      filters.set({ ...DEFAULT_FILTERS, nodeTypes: new Set(['framework', 'app']) });

      toggleNodeType('framework');

      expect(filters.get().nodeTypes.has('framework')).toBe(false);
      expect(filters.get().nodeTypes.has('app')).toBe(true);
    });

    it('should not affect other filter categories', () => {
      const initialFilters = filters.get();

      toggleNodeType('framework');

      const updatedFilters = filters.get();
      expect(updatedFilters.platforms).toEqual(initialFilters.platforms);
      expect(updatedFilters.origins).toEqual(initialFilters.origins);
      expect(updatedFilters.projects).toEqual(initialFilters.projects);
      expect(updatedFilters.packages).toEqual(initialFilters.packages);
    });
  });

  describe('togglePlatform', () => {
    it('should add platform when not present', () => {
      filters.set({ ...DEFAULT_FILTERS, platforms: new Set() });

      togglePlatform('iOS');

      expect(filters.get().platforms.has('iOS')).toBe(true);
    });

    it('should remove platform when present', () => {
      filters.set({ ...DEFAULT_FILTERS, platforms: new Set(['iOS', 'macOS']) });

      togglePlatform('iOS');

      expect(filters.get().platforms.has('iOS')).toBe(false);
      expect(filters.get().platforms.has('macOS')).toBe(true);
    });

    it('should not affect other filter categories', () => {
      const initialFilters = filters.get();

      togglePlatform('iOS');

      const updatedFilters = filters.get();
      expect(updatedFilters.nodeTypes).toEqual(initialFilters.nodeTypes);
      expect(updatedFilters.origins).toEqual(initialFilters.origins);
    });
  });

  describe('toggleOrigin', () => {
    it('should add origin when not present', () => {
      filters.set({ ...DEFAULT_FILTERS, origins: new Set() });

      toggleOrigin('local');

      expect(filters.get().origins.has('local')).toBe(true);
    });

    it('should remove origin when present', () => {
      filters.set({ ...DEFAULT_FILTERS, origins: new Set(['local', 'external']) });

      toggleOrigin('local');

      expect(filters.get().origins.has('local')).toBe(false);
      expect(filters.get().origins.has('external')).toBe(true);
    });

    it('should not affect other filter categories', () => {
      const initialFilters = filters.get();

      toggleOrigin('local');

      const updatedFilters = filters.get();
      expect(updatedFilters.nodeTypes).toEqual(initialFilters.nodeTypes);
      expect(updatedFilters.platforms).toEqual(initialFilters.platforms);
    });
  });

  describe('toggleProject', () => {
    it('should add project when not present', () => {
      filters.set({ ...DEFAULT_FILTERS, projects: new Set() });

      toggleProject('Project1');

      expect(filters.get().projects.has('Project1')).toBe(true);
    });

    it('should remove project when present', () => {
      filters.set({ ...DEFAULT_FILTERS, projects: new Set(['Project1', 'Project2']) });

      toggleProject('Project1');

      expect(filters.get().projects.has('Project1')).toBe(false);
      expect(filters.get().projects.has('Project2')).toBe(true);
    });

    it('should handle multiple toggles', () => {
      filters.set({ ...DEFAULT_FILTERS, projects: new Set() });

      toggleProject('Project1');
      expect(filters.get().projects.has('Project1')).toBe(true);

      toggleProject('Project1');
      expect(filters.get().projects.has('Project1')).toBe(false);

      toggleProject('Project1');
      expect(filters.get().projects.has('Project1')).toBe(true);
    });
  });

  describe('togglePackage', () => {
    it('should add package when not present', () => {
      filters.set({ ...DEFAULT_FILTERS, packages: new Set() });

      togglePackage('Package1');

      expect(filters.get().packages.has('Package1')).toBe(true);
    });

    it('should remove package when present', () => {
      filters.set({ ...DEFAULT_FILTERS, packages: new Set(['Package1', 'Package2']) });

      togglePackage('Package1');

      expect(filters.get().packages.has('Package1')).toBe(false);
      expect(filters.get().packages.has('Package2')).toBe(true);
    });

    it('should handle multiple toggles', () => {
      filters.set({ ...DEFAULT_FILTERS, packages: new Set() });

      togglePackage('Package1');
      expect(filters.get().packages.has('Package1')).toBe(true);

      togglePackage('Package1');
      expect(filters.get().packages.has('Package1')).toBe(false);

      togglePackage('Package1');
      expect(filters.get().packages.has('Package1')).toBe(true);
    });
  });

  // ==================== Bulk Actions ====================

  describe('clearFilters', () => {
    it('should reset to default filters', () => {
      // Modify filters
      filters.set({
        nodeTypes: new Set(['framework']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(['Project1']),
        packages: new Set(['Package1']),
      });
      searchQuery.set('test query');

      clearFilters();

      const current = filters.get();
      expect(current.nodeTypes).toEqual(DEFAULT_FILTERS.nodeTypes);
      expect(current.platforms).toEqual(DEFAULT_FILTERS.platforms);
      expect(current.origins).toEqual(DEFAULT_FILTERS.origins);
      expect(searchQuery.get()).toBe('');
    });

    it('should accept custom defaults', () => {
      const customDefaults: FilterState = {
        nodeTypes: new Set(['framework']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(['CustomProject']),
        packages: new Set(['CustomPackage']),
      };

      clearFilters(customDefaults);

      expect(filters.get()).toEqual(customDefaults);
      expect(searchQuery.get()).toBe('');
    });

    it('should clear search query', () => {
      searchQuery.set('test query');

      clearFilters();

      expect(searchQuery.get()).toBe('');
    });
  });

  describe('initializeFromData', () => {
    it('should initialize filters with projects and packages', () => {
      const projects = new Set(['Project1', 'Project2']);
      const packages = new Set(['Package1', 'Package2']);

      initializeFromData(projects, packages);

      const current = filters.get();
      expect(current.projects).toEqual(projects);
      expect(current.packages).toEqual(packages);
    });

    it('should preserve default node types, platforms, and origins', () => {
      const projects = new Set(['Project1']);
      const packages = new Set(['Package1']);

      initializeFromData(projects, packages);

      const current = filters.get();
      expect(current.nodeTypes).toEqual(DEFAULT_FILTERS.nodeTypes);
      expect(current.platforms).toEqual(DEFAULT_FILTERS.platforms);
      expect(current.origins).toEqual(DEFAULT_FILTERS.origins);
    });

    it('should store all projects and packages for reference', () => {
      const projects = new Set(['Project1', 'Project2']);
      const packages = new Set(['Package1', 'Package2', 'Package3']);

      initializeFromData(projects, packages);

      expect(allProjects.get()).toEqual(projects);
      expect(allPackages.get()).toEqual(packages);
    });

    it('should handle empty sets', () => {
      initializeFromData(new Set(), new Set());

      const current = filters.get();
      expect(current.projects.size).toBe(0);
      expect(current.packages.size).toBe(0);
    });

    it('should create new Set instances (immutability)', () => {
      const projects = new Set(['Project1']);
      const packages = new Set(['Package1']);

      initializeFromData(projects, packages);

      // Mutate original sets
      projects.add('Project2');
      packages.add('Package2');

      // Filter state should not change
      expect(filters.get().projects.size).toBe(1);
      expect(filters.get().packages.size).toBe(1);
    });
  });

  // ==================== Integration Tests ====================

  describe('integration scenarios', () => {
    it('should handle multiple filter toggles in sequence', () => {
      filters.set({ ...DEFAULT_FILTERS });

      toggleNodeType('framework');
      toggleNodeType('app');
      togglePlatform('iOS');
      toggleOrigin('local');
      toggleProject('Project1');
      togglePackage('Package1');

      const current = filters.get();
      expect(current.nodeTypes.has('framework')).toBe(false);
      expect(current.nodeTypes.has('app')).toBe(false);
      expect(current.platforms.has('iOS')).toBe(false);
      expect(current.origins.has('local')).toBe(false);
      expect(current.projects.has('Project1')).toBe(true);
      expect(current.packages.has('Package1')).toBe(true);
    });

    it('should handle clear after multiple modifications', () => {
      toggleNodeType('framework');
      togglePlatform('iOS');
      toggleProject('Project1');
      setSearchQuery('test');

      clearFilters();

      const current = filters.get();
      expect(current.nodeTypes).toEqual(DEFAULT_FILTERS.nodeTypes);
      expect(searchQuery.get()).toBe('');
    });

    it('should handle initialization followed by toggles', () => {
      const projects = new Set(['Project1', 'Project2']);
      const packages = new Set(['Package1', 'Package2']);

      initializeFromData(projects, packages);
      toggleProject('Project1');

      const current = filters.get();
      expect(current.projects.has('Project1')).toBe(false);
      expect(current.projects.has('Project2')).toBe(true);
    });

    it('should handle rapid toggle operations', () => {
      const type = 'framework';

      toggleNodeType(type);
      toggleNodeType(type);
      toggleNodeType(type);
      toggleNodeType(type);

      // Should end up in original state (toggled 4 times)
      expect(filters.get().nodeTypes.has(type)).toBe(true);
    });

    it('should maintain immutability across operations', () => {
      const snapshot1 = filters.get();

      toggleNodeType('framework');
      const snapshot2 = filters.get();

      // Different instances
      expect(snapshot1).not.toBe(snapshot2);
      // But snapshot1 should be unchanged
      expect(snapshot1.nodeTypes).toEqual(DEFAULT_FILTERS.nodeTypes);
    });

    it('should handle complex filtering scenario', () => {
      // Initialize with data
      initializeFromData(new Set(['Core', 'UI', 'Network']), new Set(['Alamofire', 'SDWebImage']));

      // Apply some filters
      toggleNodeType('test-unit');
      toggleNodeType('test-ui');
      togglePlatform('visionOS');
      togglePlatform('watchOS');
      toggleProject('Network');
      setSearchQuery('Button');

      const current = filters.get();
      expect(current.nodeTypes.has('test-unit')).toBe(false);
      expect(current.nodeTypes.has('framework')).toBe(true);
      expect(current.platforms.has('iOS')).toBe(true);
      expect(current.platforms.has('visionOS')).toBe(false);
      expect(current.projects.has('Core')).toBe(true);
      expect(current.projects.has('Network')).toBe(false);
      expect(searchQuery.get()).toBe('Button');
    });
  });
});

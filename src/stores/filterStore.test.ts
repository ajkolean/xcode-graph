/**
 * Comprehensive tests for filterStore
 * Target: 80%+ coverage
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { FilterState } from '../schemas/app.schema';
import { useFilterStore } from './filterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useFilterStore.setState({
      filters: {
        nodeTypes: new Set([
          'app',
          'framework',
          'library',
          'test-unit',
          'test-ui',
          'cli',
          'package',
        ]),
        platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
        origins: new Set(['local', 'external']),
        projects: new Set(),
        packages: new Set(),
      },
      searchQuery: '',
    });
  });

  describe('Initial State', () => {
    it('should have default filters', () => {
      const { filters } = useFilterStore.getState();

      expect(filters.nodeTypes.size).toBe(7);
      expect(filters.platforms.size).toBe(5);
      expect(filters.origins.size).toBe(2);
      expect(filters.projects.size).toBe(0);
      expect(filters.packages.size).toBe(0);
    });

    it('should have empty search query', () => {
      const { searchQuery } = useFilterStore.getState();
      expect(searchQuery).toBe('');
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const newFilters: FilterState = {
        nodeTypes: new Set(['app']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(),
        packages: new Set(),
      };

      useFilterStore.getState().setFilters(newFilters);
      const { filters } = useFilterStore.getState();

      expect(filters.nodeTypes.size).toBe(1);
      expect(filters.platforms.size).toBe(1);
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      useFilterStore.getState().setSearchQuery('test');
      const { searchQuery } = useFilterStore.getState();

      expect(searchQuery).toBe('test');
    });

    it('should handle empty string', () => {
      useFilterStore.getState().setSearchQuery('test');
      useFilterStore.getState().setSearchQuery('');

      expect(useFilterStore.getState().searchQuery).toBe('');
    });
  });

  describe('toggleNodeType', () => {
    it('should remove node type when present', () => {
      const initialSize = useFilterStore.getState().filters.nodeTypes.size;

      useFilterStore.getState().toggleNodeType('app');

      expect(useFilterStore.getState().filters.nodeTypes.size).toBe(initialSize - 1);
      expect(useFilterStore.getState().filters.nodeTypes.has('app')).toBe(false);
    });

    it('should add node type when absent', () => {
      useFilterStore.getState().toggleNodeType('app'); // Remove it
      const sizeAfterRemove = useFilterStore.getState().filters.nodeTypes.size;

      useFilterStore.getState().toggleNodeType('app'); // Add it back

      expect(useFilterStore.getState().filters.nodeTypes.size).toBe(sizeAfterRemove + 1);
      expect(useFilterStore.getState().filters.nodeTypes.has('app')).toBe(true);
    });
  });

  describe('togglePlatform', () => {
    it('should toggle platform off', () => {
      useFilterStore.getState().togglePlatform('iOS');

      expect(useFilterStore.getState().filters.platforms.has('iOS')).toBe(false);
    });

    it('should toggle platform on', () => {
      useFilterStore.getState().togglePlatform('iOS'); // Off
      useFilterStore.getState().togglePlatform('iOS'); // On

      expect(useFilterStore.getState().filters.platforms.has('iOS')).toBe(true);
    });

    it('should toggle multiple platforms independently', () => {
      useFilterStore.getState().togglePlatform('iOS');
      useFilterStore.getState().togglePlatform('macOS');

      const { platforms } = useFilterStore.getState().filters;
      expect(platforms.has('iOS')).toBe(false);
      expect(platforms.has('macOS')).toBe(false);
      expect(platforms.has('visionOS')).toBe(true); // Unchanged
    });
  });

  describe('toggleOrigin', () => {
    it('should toggle origin', () => {
      useFilterStore.getState().toggleOrigin('local');

      expect(useFilterStore.getState().filters.origins.has('local')).toBe(false);
      expect(useFilterStore.getState().filters.origins.has('external')).toBe(true);
    });
  });

  describe('toggleProject', () => {
    it('should add project when toggled', () => {
      useFilterStore.getState().toggleProject('MyProject');

      expect(useFilterStore.getState().filters.projects.has('MyProject')).toBe(true);
    });

    it('should remove project when toggled twice', () => {
      useFilterStore.getState().toggleProject('MyProject'); // Add
      useFilterStore.getState().toggleProject('MyProject'); // Remove

      expect(useFilterStore.getState().filters.projects.has('MyProject')).toBe(false);
    });
  });

  describe('togglePackage', () => {
    it('should add package when toggled', () => {
      useFilterStore.getState().togglePackage('Alamofire');

      expect(useFilterStore.getState().filters.packages.has('Alamofire')).toBe(true);
    });

    it('should remove package when toggled twice', () => {
      useFilterStore.getState().togglePackage('Alamofire'); // Add
      useFilterStore.getState().togglePackage('Alamofire'); // Remove

      expect(useFilterStore.getState().filters.packages.has('Alamofire')).toBe(false);
    });
  });

  describe('clearFilters', () => {
    it('should reset filters to defaults', () => {
      // Modify filters
      useFilterStore.getState().toggleNodeType('app');
      useFilterStore.getState().setSearchQuery('test');

      // Clear
      const defaults: FilterState = {
        nodeTypes: new Set([
          'app',
          'framework',
          'library',
          'test-unit',
          'test-ui',
          'cli',
          'package',
        ]),
        platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
        origins: new Set(['local', 'external']),
        projects: new Set(),
        packages: new Set(),
      };

      useFilterStore.getState().clearFilters(defaults);

      const state = useFilterStore.getState();
      expect(state.filters.nodeTypes.size).toBe(7);
      expect(state.searchQuery).toBe('');
    });
  });

  describe('initializeFromData', () => {
    it('should initialize projects and packages', () => {
      const projects = new Set(['ProjectA', 'ProjectB']);
      const packages = new Set(['PackageX', 'PackageY']);

      useFilterStore.getState().initializeFromData(projects, packages);

      const { filters } = useFilterStore.getState();
      expect(filters.projects).toEqual(projects);
      expect(filters.packages).toEqual(packages);
    });

    it('should preserve other filter settings', () => {
      const projects = new Set(['ProjectA']);
      const packages = new Set(['PackageX']);

      useFilterStore.getState().initializeFromData(projects, packages);

      const { filters } = useFilterStore.getState();
      expect(filters.nodeTypes.size).toBe(7); // Unchanged
      expect(filters.platforms.size).toBe(5); // Unchanged
    });
  });

  describe('State Access', () => {
    it('should access filters via getState', () => {
      const filters = useFilterStore.getState().filters;
      expect(filters).toBeDefined();
      expect(filters.nodeTypes.size).toBe(7);
    });

    it('should access search query via getState', () => {
      useFilterStore.getState().setSearchQuery('test');
      const searchQuery = useFilterStore.getState().searchQuery;
      expect(searchQuery).toBe('test');
    });
  });

  describe('Subscription and Reactivity', () => {
    it('should notify subscribers when filters change', () => {
      let callCount = 0;
      const unsubscribe = useFilterStore.subscribe(() => {
        callCount++;
      });

      useFilterStore.getState().toggleNodeType('app');

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should notify subscribers when search query changes', () => {
      let callCount = 0;
      const unsubscribe = useFilterStore.subscribe(() => {
        callCount++;
      });

      useFilterStore.getState().setSearchQuery('new query');

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });
  });
});

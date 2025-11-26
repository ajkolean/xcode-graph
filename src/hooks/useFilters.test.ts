import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createNode, createNodesForFilterTesting } from '../test/fixtures';
import type { FilterState } from '../types/app';
import { useFilters } from './useFilters';

describe('useFilters', () => {
  describe('typeCounts', () => {
    it('should count nodes by type', () => {
      const nodes = createNodesForFilterTesting();

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.typeCounts.get('app')).toBe(1);
      expect(result.current.typeCounts.get('framework')).toBe(1);
      expect(result.current.typeCounts.get('library')).toBe(1);
      expect(result.current.typeCounts.get('test-unit')).toBe(1);
      expect(result.current.typeCounts.get('test-ui')).toBe(1);
      expect(result.current.typeCounts.get('cli')).toBe(1);
      expect(result.current.typeCounts.get('package')).toBe(2);
    });

    it('should handle empty nodes array', () => {
      const { result } = renderHook(() => useFilters([]));

      expect(result.current.typeCounts.size).toBe(0);
    });
  });

  describe('platformCounts', () => {
    it('should count nodes by platform', () => {
      const nodes = createNodesForFilterTesting();

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.platformCounts.get('iOS')).toBe(5);
      expect(result.current.platformCounts.get('macOS')).toBe(2);
      expect(result.current.platformCounts.get('visionOS')).toBe(1);
    });
  });

  describe('projectCounts', () => {
    it('should count nodes by project, excluding packages', () => {
      const nodes = createNodesForFilterTesting();

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.projectCounts.get('Main')).toBe(2);
      expect(result.current.projectCounts.get('Core')).toBe(3);
      expect(result.current.projectCounts.get('Tools')).toBe(1);
    });

    it('should not count nodes without project', () => {
      const nodes = [createNode({ id: '1', name: 'NoProject', project: undefined })];

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.projectCounts.size).toBe(0);
    });
  });

  describe('packageCounts', () => {
    it('should count package nodes by name', () => {
      const nodes = createNodesForFilterTesting();

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.packageCounts.get('Package1')).toBe(1);
      expect(result.current.packageCounts.get('Package2')).toBe(1);
    });

    it('should only count package type nodes', () => {
      const nodes = [
        createNode({ id: '1', name: 'Framework1', type: 'framework' }),
        createNode({ id: '2', name: 'Package1', type: 'package' }),
      ];

      const { result } = renderHook(() => useFilters(nodes));

      expect(result.current.packageCounts.size).toBe(1);
      expect(result.current.packageCounts.has('Framework1')).toBe(false);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when all filters include everything', () => {
      const nodes = createNodesForFilterTesting();
      const { result } = renderHook(() => useFilters(nodes));

      const filters: FilterState = {
        nodeTypes: new Set(result.current.typeCounts.keys()),
        platforms: new Set(result.current.platformCounts.keys()),
        origins: new Set(['local', 'external']),
        projects: new Set(result.current.projectCounts.keys()),
        packages: new Set(result.current.packageCounts.keys()),
      };

      expect(result.current.hasActiveFilters(filters)).toBe(false);
    });

    it('should return true when some node types are filtered', () => {
      const nodes = createNodesForFilterTesting();
      const { result } = renderHook(() => useFilters(nodes));

      const filters: FilterState = {
        nodeTypes: new Set(['app', 'framework']), // Missing some types
        platforms: new Set(result.current.platformCounts.keys()),
        origins: new Set(['local', 'external']),
        projects: new Set(result.current.projectCounts.keys()),
        packages: new Set(result.current.packageCounts.keys()),
      };

      expect(result.current.hasActiveFilters(filters)).toBe(true);
    });

    it('should return true when some platforms are filtered', () => {
      const nodes = createNodesForFilterTesting();
      const { result } = renderHook(() => useFilters(nodes));

      const filters: FilterState = {
        nodeTypes: new Set(result.current.typeCounts.keys()),
        platforms: new Set(['iOS']), // Missing macOS, visionOS
        origins: new Set(['local', 'external']),
        projects: new Set(result.current.projectCounts.keys()),
        packages: new Set(result.current.packageCounts.keys()),
      };

      expect(result.current.hasActiveFilters(filters)).toBe(true);
    });

    it('should return true when some projects are filtered', () => {
      const nodes = createNodesForFilterTesting();
      const { result } = renderHook(() => useFilters(nodes));

      const filters: FilterState = {
        nodeTypes: new Set(result.current.typeCounts.keys()),
        platforms: new Set(result.current.platformCounts.keys()),
        origins: new Set(['local', 'external']),
        projects: new Set(['Main']), // Missing Core, Tools
        packages: new Set(result.current.packageCounts.keys()),
      };

      expect(result.current.hasActiveFilters(filters)).toBe(true);
    });
  });

  describe('createClearFilters', () => {
    it('should create a function that clears all filters', () => {
      const nodes = createNodesForFilterTesting();
      const { result } = renderHook(() => useFilters(nodes));

      const onFiltersChange = vi.fn();
      const clearFilters = result.current.createClearFilters(onFiltersChange);

      clearFilters();

      expect(onFiltersChange).toHaveBeenCalledTimes(1);
      const newFilters = onFiltersChange.mock.calls[0][0];

      expect(newFilters.nodeTypes.size).toBe(result.current.typeCounts.size);
      expect(newFilters.platforms.size).toBe(result.current.platformCounts.size);
      expect(newFilters.projects.size).toBe(result.current.projectCounts.size);
      expect(newFilters.packages.size).toBe(result.current.packageCounts.size);
      expect(newFilters.origins).toEqual(new Set(['local', 'external']));
    });
  });
});

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { FilterState } from '../types/app';
import { useGraphFilters } from './useGraphFilters';

// Test fixtures
const createTestNodes = (): GraphNode[] => [
  {
    id: '1',
    name: 'CoreFramework',
    type: 'framework',
    platform: 'iOS',
    origin: 'local',
    project: 'Core',
  },
  { id: '2', name: 'UIKit', type: 'framework', platform: 'iOS', origin: 'local', project: 'UI' },
  {
    id: '3',
    name: 'TestUtils',
    type: 'test-unit',
    platform: 'iOS',
    origin: 'local',
    project: 'Core',
  },
  {
    id: '4',
    name: 'MacFramework',
    type: 'framework',
    platform: 'macOS',
    origin: 'local',
    project: 'Core',
  },
  { id: '5', name: 'Alamofire', type: 'package', platform: 'iOS', origin: 'external' },
  { id: '6', name: 'MainApp', type: 'app', platform: 'iOS', origin: 'local', project: 'App' },
];

const createTestEdges = (): GraphEdge[] => [
  { source: '6', target: '1' }, // App -> Core
  { source: '6', target: '2' }, // App -> UI
  { source: '2', target: '1' }, // UI -> Core
  { source: '3', target: '1' }, // TestUtils -> Core
  { source: '1', target: '5' }, // Core -> Alamofire
];

const createAllInclusiveFilters = (): FilterState => ({
  nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
  platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
  origins: new Set(['local', 'external']),
  projects: new Set(['Core', 'UI', 'App']),
  packages: new Set(['Alamofire']),
});

describe('useGraphFilters', () => {
  describe('filtering by node type', () => {
    it('should filter out excluded node types', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        nodeTypes: new Set(['framework']), // Only frameworks
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes).toHaveLength(3);
      expect(result.current.filteredNodes.every((n) => n.type === 'framework')).toBe(true);
    });

    it('should include all types when all are selected', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters = createAllInclusiveFilters();

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes).toHaveLength(6);
    });
  });

  describe('filtering by platform', () => {
    it('should filter by platform', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        platforms: new Set(['macOS']),
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].platform).toBe('macOS');
    });
  });

  describe('filtering by origin', () => {
    it('should filter by local origin', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        origins: new Set(['local']),
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes.every((n) => n.origin === 'local')).toBe(true);
      expect(result.current.filteredNodes).toHaveLength(5);
    });

    it('should filter by external origin', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        origins: new Set(['external']),
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes.every((n) => n.origin === 'external')).toBe(true);
      expect(result.current.filteredNodes).toHaveLength(1);
    });
  });

  describe('filtering by project', () => {
    it('should filter by project', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        projects: new Set(['Core']),
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      // Should include Core project nodes and packages (packages filter separately)
      const coreNodes = result.current.filteredNodes.filter((n) => n.project === 'Core');
      expect(coreNodes.length).toBeGreaterThan(0);
    });
  });

  describe('search functionality', () => {
    it('should filter by search query (case insensitive)', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters = createAllInclusiveFilters();

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: 'core' }),
      );

      expect(result.current.filteredNodes).toHaveLength(1);
      expect(result.current.filteredNodes[0].name).toBe('CoreFramework');
    });

    it('should return searchResults count when searching', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters = createAllInclusiveFilters();

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: 'framework' }),
      );

      expect(result.current.searchResults).toBe(2);
    });

    it('should return null searchResults when not searching', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters = createAllInclusiveFilters();

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.searchResults).toBeNull();
    });
  });

  describe('edge filtering', () => {
    it('should only include edges where both nodes are visible', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        nodeTypes: new Set(['app', 'framework']), // No test-unit, no package
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      // Check all edges have visible source and target
      const visibleNodeIds = result.current.filteredNodeIds;
      result.current.filteredEdges.forEach((edge) => {
        expect(visibleNodeIds.has(edge.source)).toBe(true);
        expect(visibleNodeIds.has(edge.target)).toBe(true);
      });

      // Edge to Alamofire should be excluded (package filtered out)
      expect(result.current.filteredEdges.some((e) => e.target === '5')).toBe(false);
    });

    it('should return empty edges when no nodes match', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        nodeTypes: new Set(['cli']), // No CLI nodes exist
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodes).toHaveLength(0);
      expect(result.current.filteredEdges).toHaveLength(0);
    });
  });

  describe('filteredNodeIds', () => {
    it('should return Set of filtered node IDs', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();
      const filters: FilterState = {
        ...createAllInclusiveFilters(),
        nodeTypes: new Set(['app']),
      };

      const { result } = renderHook(() =>
        useGraphFilters({ nodes, edges, filters, searchQuery: '' }),
      );

      expect(result.current.filteredNodeIds).toBeInstanceOf(Set);
      expect(result.current.filteredNodeIds.has('6')).toBe(true);
      expect(result.current.filteredNodeIds.size).toBe(1);
    });
  });
});

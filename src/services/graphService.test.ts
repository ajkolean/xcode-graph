import { describe, it, expect } from 'vitest';
import {
  getConnectedNodes,
  findDependencyChain,
  findDependentsChain,
  hasPath,
  findCircularDependencies,
  getGraphStats,
} from './graphService';
import type { GraphNode, GraphEdge } from '../data/mockGraphData';

// Test fixtures
const createTestNodes = (): GraphNode[] => [
  { id: 'A', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' },
  { id: 'B', name: 'B', type: 'framework', platform: 'iOS', origin: 'local' },
  { id: 'C', name: 'C', type: 'library', platform: 'iOS', origin: 'local' },
  { id: 'D', name: 'D', type: 'library', platform: 'iOS', origin: 'local' },
  { id: 'E', name: 'E', type: 'test-unit', platform: 'iOS', origin: 'local' },
];

const createTestEdges = (): GraphEdge[] => [
  // A -> B -> C -> D
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
  { source: 'C', target: 'D' },
  // E tests A
  { source: 'E', target: 'A' },
];

describe('graphService', () => {
  describe('getConnectedNodes', () => {
    it('should return direct dependencies and dependents', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('B', edges);

      expect(result.dependencies).toEqual(['C']);
      expect(result.dependents).toEqual(['A']);
    });

    it('should return empty arrays for isolated nodes', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('isolated', edges);

      expect(result.dependencies).toEqual([]);
      expect(result.dependents).toEqual([]);
    });

    it('should handle nodes with only dependencies', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('D', edges);

      expect(result.dependencies).toEqual([]);
      expect(result.dependents).toEqual(['C']);
    });

    it('should handle nodes with only dependents', () => {
      const edges = createTestEdges();

      const result = getConnectedNodes('A', edges);

      expect(result.dependencies).toEqual(['B']);
      expect(result.dependents).toEqual(['E']);
    });
  });

  describe('findDependencyChain', () => {
    it('should find all transitive dependencies', () => {
      const edges = createTestEdges();

      const result = findDependencyChain('A', edges);

      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('C');
      expect(result).toContain('D');
      expect(result.size).toBe(4);
    });

    it('should respect maxDepth parameter', () => {
      const edges = createTestEdges();

      const result = findDependencyChain('A', edges, 1);

      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).not.toContain('C');
      expect(result).not.toContain('D');
    });

    it('should return only the node itself when no dependencies exist', () => {
      const edges = createTestEdges();

      const result = findDependencyChain('D', edges);

      expect(result).toContain('D');
      expect(result.size).toBe(1);
    });

    it('should handle empty edges', () => {
      const result = findDependencyChain('A', []);

      expect(result).toContain('A');
      expect(result.size).toBe(1);
    });
  });

  describe('findDependentsChain', () => {
    it('should find all transitive dependents', () => {
      const edges = createTestEdges();

      const result = findDependentsChain('D', edges);

      expect(result).toContain('D');
      expect(result).toContain('C');
      expect(result).toContain('B');
      expect(result).toContain('A');
      expect(result).toContain('E');
      expect(result.size).toBe(5);
    });

    it('should respect maxDepth parameter', () => {
      const edges = createTestEdges();

      const result = findDependentsChain('D', edges, 2);

      expect(result).toContain('D');
      expect(result).toContain('C');
      expect(result).toContain('B');
      expect(result).not.toContain('A');
    });

    it('should return only the node itself when no dependents exist', () => {
      const edges = createTestEdges();

      const result = findDependentsChain('E', edges);

      expect(result).toContain('E');
      expect(result.size).toBe(1);
    });
  });

  describe('hasPath', () => {
    it('should return true when path exists', () => {
      const edges = createTestEdges();

      expect(hasPath('A', 'D', edges)).toBe(true);
      expect(hasPath('A', 'B', edges)).toBe(true);
      expect(hasPath('E', 'D', edges)).toBe(true);
    });

    it('should return false when no path exists', () => {
      const edges = createTestEdges();

      expect(hasPath('D', 'A', edges)).toBe(false);
      expect(hasPath('B', 'E', edges)).toBe(false);
    });

    it('should return true for same node', () => {
      const edges = createTestEdges();

      expect(hasPath('A', 'A', edges)).toBe(true);
    });
  });

  describe('findCircularDependencies', () => {
    it('should return empty array when no cycles exist', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const result = findCircularDependencies(nodes, edges);

      expect(result).toEqual([]);
    });

    it('should detect simple circular dependency', () => {
      const nodes: GraphNode[] = [
        { id: 'X', name: 'X', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'Y', name: 'Y', type: 'framework', platform: 'iOS', origin: 'local' },
      ];
      const edges: GraphEdge[] = [
        { source: 'X', target: 'Y' },
        { source: 'Y', target: 'X' },
      ];

      const result = findCircularDependencies(nodes, edges);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain('X');
      expect(result[0]).toContain('Y');
    });

    it('should detect larger cycles', () => {
      const nodes: GraphNode[] = [
        { id: 'A', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'B', name: 'B', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'C', name: 'C', type: 'framework', platform: 'iOS', origin: 'local' },
      ];
      const edges: GraphEdge[] = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'A' },
      ];

      const result = findCircularDependencies(nodes, edges);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGraphStats', () => {
    it('should return correct statistics', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const stats = getGraphStats(nodes, edges);

      expect(stats.totalNodes).toBe(5);
      expect(stats.totalEdges).toBe(4);
    });

    it('should calculate isolated nodes correctly', () => {
      const nodes: GraphNode[] = [
        { id: 'A', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'B', name: 'B', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'C', name: 'C', type: 'framework', platform: 'iOS', origin: 'local' },
      ];
      const edges: GraphEdge[] = [
        { source: 'A', target: 'B' },
      ];

      const stats = getGraphStats(nodes, edges);

      // C has no outgoing edges, and B has no outgoing edges
      expect(stats.isolatedNodes).toBe(2);
    });

    it('should handle empty graph', () => {
      const stats = getGraphStats([], []);

      expect(stats.totalNodes).toBe(0);
      expect(stats.totalEdges).toBe(0);
      expect(stats.avgDependencies).toBe(0);
      expect(stats.maxDependencies).toBe(0);
      expect(stats.isolatedNodes).toBe(0);
    });

    it('should calculate average dependencies correctly', () => {
      const nodes: GraphNode[] = [
        { id: 'A', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'B', name: 'B', type: 'framework', platform: 'iOS', origin: 'local' },
      ];
      const edges: GraphEdge[] = [
        { source: 'A', target: 'B' },
      ];

      const stats = getGraphStats(nodes, edges);

      // A has 1 dependency, B has 0 -> average is 0.5
      expect(stats.avgDependencies).toBe(0.5);
      expect(stats.maxDependencies).toBe(1);
    });
  });
});

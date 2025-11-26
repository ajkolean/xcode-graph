import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { createNode } from '../test/fixtures';
import { useClusterStats } from './useClusterStats';

describe('useClusterStats', () => {
  const createTestCluster = () => {
    const nodes: GraphNode[] = [
      createNode({ id: 'c1', name: 'Cluster1Node1', platforms: ['iOS', 'macOS'] }),
      createNode({ id: 'c2', name: 'Cluster1Node2', platforms: ['iOS'] }),
      createNode({ id: 'c3', name: 'Cluster1Node3', platforms: ['macOS'] }),
    ];
    const allEdges: GraphEdge[] = [
      { source: 'c1', target: 'external1' },
      { source: 'c1', target: 'external2' },
      { source: 'c2', target: 'external1' },
      { source: 'external3', target: 'c1' },
      { source: 'external4', target: 'c2' },
      { source: 'external5', target: 'c3' },
    ];
    return { nodes, edges: allEdges };
  };

  describe('filteredDependencies', () => {
    it('should count outgoing edges from cluster nodes', () => {
      const { nodes, edges } = createTestCluster();

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      // c1 -> external1, c1 -> external2, c2 -> external1 = 3
      expect(result.current.filteredDependencies).toBe(3);
    });

    it('should use filtered edges when provided', () => {
      const { nodes, edges } = createTestCluster();
      const filteredEdges: GraphEdge[] = [{ source: 'c1', target: 'external1' }];

      const { result } = renderHook(() => useClusterStats(nodes, edges, filteredEdges));

      expect(result.current.filteredDependencies).toBe(1);
    });

    it('should return 0 for cluster with no outgoing edges', () => {
      const nodes: GraphNode[] = [createNode({ id: 'isolated', name: 'Isolated' })];
      const edges: GraphEdge[] = [];

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      expect(result.current.filteredDependencies).toBe(0);
    });
  });

  describe('totalDependencies', () => {
    it('should always use all edges', () => {
      const { nodes, edges } = createTestCluster();
      const filteredEdges: GraphEdge[] = [{ source: 'c1', target: 'external1' }];

      const { result } = renderHook(() => useClusterStats(nodes, edges, filteredEdges));

      // Total should use all edges, not filtered
      expect(result.current.totalDependencies).toBe(3);
    });
  });

  describe('filteredDependents', () => {
    it('should count incoming edges to cluster nodes', () => {
      const { nodes, edges } = createTestCluster();

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      // external3 -> c1, external4 -> c2, external5 -> c3 = 3
      expect(result.current.filteredDependents).toBe(3);
    });

    it('should use filtered edges when provided', () => {
      const { nodes, edges } = createTestCluster();
      const filteredEdges: GraphEdge[] = [{ source: 'external3', target: 'c1' }];

      const { result } = renderHook(() => useClusterStats(nodes, edges, filteredEdges));

      expect(result.current.filteredDependents).toBe(1);
    });
  });

  describe('totalDependents', () => {
    it('should always use all edges', () => {
      const { nodes, edges } = createTestCluster();
      const filteredEdges: GraphEdge[] = [{ source: 'external3', target: 'c1' }];

      const { result } = renderHook(() => useClusterStats(nodes, edges, filteredEdges));

      expect(result.current.totalDependents).toBe(3);
    });
  });

  describe('filteredTargetsCount', () => {
    it('should count all cluster nodes when no filtered edges', () => {
      const { nodes, edges } = createTestCluster();

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      expect(result.current.filteredTargetsCount).toBe(3);
    });

    it('should count only nodes with edges when filtered', () => {
      const { nodes, edges } = createTestCluster();
      const filteredEdges: GraphEdge[] = [
        { source: 'c1', target: 'external1' }, // Only c1 is involved
      ];

      const { result } = renderHook(() => useClusterStats(nodes, edges, filteredEdges));

      expect(result.current.filteredTargetsCount).toBe(1);
    });

    it('should handle empty cluster', () => {
      const { result } = renderHook(() => useClusterStats([], []));

      expect(result.current.filteredTargetsCount).toBe(0);
    });
  });

  describe('platforms', () => {
    it('should collect unique platforms from cluster nodes', () => {
      const { nodes, edges } = createTestCluster();

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      expect(result.current.platforms).toContain('iOS');
      expect(result.current.platforms).toContain('macOS');
      expect(result.current.platforms.size).toBe(2);
    });

    it('should handle nodes without platforms', () => {
      const nodes: GraphNode[] = [createNode({ id: 'np', name: 'NoPlatform' })];

      const { result } = renderHook(() => useClusterStats(nodes, []));

      expect(result.current.platforms.size).toBe(0);
    });

    it('should deduplicate platforms', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'n1', name: 'Node1', platforms: ['iOS', 'macOS'] }),
        createNode({ id: 'n2', name: 'Node2', platforms: ['iOS', 'macOS'] }),
        createNode({ id: 'n3', name: 'Node3', platforms: ['iOS'] }),
      ];

      const { result } = renderHook(() => useClusterStats(nodes, []));

      expect(result.current.platforms.size).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty cluster nodes', () => {
      const { result } = renderHook(() => useClusterStats([], []));

      expect(result.current.filteredDependencies).toBe(0);
      expect(result.current.totalDependencies).toBe(0);
      expect(result.current.filteredDependents).toBe(0);
      expect(result.current.totalDependents).toBe(0);
      expect(result.current.filteredTargetsCount).toBe(0);
      expect(result.current.platforms.size).toBe(0);
    });

    it('should handle internal cluster edges', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'n1', name: 'Node1' }),
        createNode({ id: 'n2', name: 'Node2' }),
      ];
      const edges: GraphEdge[] = [
        { source: 'n1', target: 'n2' }, // Internal edge
      ];

      const { result } = renderHook(() => useClusterStats(nodes, edges));

      // n1 -> n2: n1 has 1 dependency, n2 has 1 dependent
      expect(result.current.filteredDependencies).toBe(1);
      expect(result.current.filteredDependents).toBe(1);
    });
  });
});

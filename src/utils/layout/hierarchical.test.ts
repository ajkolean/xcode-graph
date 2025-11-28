import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from '../../schemas/graph.schema';
import { createNode } from '../../test/fixtures';
import type { Cluster } from '../../types/cluster';
import { computeHierarchicalLayout } from './hierarchical';

// Helper to create a simple cluster
function _createTestCluster(
  id: string,
  nodeData: Array<{ id: string; name: string; type: GraphNode['type'] }>,
): Cluster {
  const nodes = nodeData.map((n) => createNode(n));
  return {
    id,
    name: id,
    type: 'project',
    origin: 'local',
    nodes,
    metadata: new Map(),
    anchors: nodeData.length > 0 ? [nodeData[0].id] : [],
  };
}

describe('hierarchicalLayout', () => {
  describe('computeHierarchicalLayout', () => {
    it('should return empty maps for empty inputs', () => {
      const result = computeHierarchicalLayout([], [], []);

      expect(result.clusterPositions.size).toBe(0);
      expect(result.nodePositions.size).toBe(0);
      expect(result.clusters).toEqual([]);
    });

    it('should compute positions for single cluster', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'A', name: 'NodeA', type: 'framework' }),
        createNode({ id: 'B', name: 'NodeB', type: 'library' }),
      ];
      const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];
      const clusters: Cluster[] = [
        {
          id: 'cluster1',
          name: 'Cluster1',
          type: 'project',
          origin: 'local',
          nodes,
          metadata: new Map(),
          anchors: ['A'],
        },
      ];

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.clusterPositions.size).toBe(1);
      expect(result.clusterPositions.has('cluster1')).toBe(true);
      expect(result.nodePositions.size).toBe(2);
    });

    it('should compute positions for multiple clusters', () => {
      const nodesA: GraphNode[] = [
        createNode({ id: 'A1', name: 'A1', type: 'framework', project: 'ClusterA' }),
        createNode({ id: 'A2', name: 'A2', type: 'library', project: 'ClusterA' }),
      ];
      const nodesB: GraphNode[] = [
        createNode({ id: 'B1', name: 'B1', type: 'framework', project: 'ClusterB' }),
      ];
      const allNodes = [...nodesA, ...nodesB];
      const edges: GraphEdge[] = [
        { source: 'A1', target: 'A2' },
        { source: 'A1', target: 'B1' }, // Cross-cluster edge
      ];
      const clusters: Cluster[] = [
        {
          id: 'ClusterA',
          name: 'ClusterA',
          type: 'project',
          origin: 'local',
          nodes: nodesA,
          metadata: new Map(),
          anchors: ['A1'],
        },
        {
          id: 'ClusterB',
          name: 'ClusterB',
          type: 'project',
          origin: 'local',
          nodes: nodesB,
          metadata: new Map(),
          anchors: ['B1'],
        },
      ];

      const result = computeHierarchicalLayout(allNodes, edges, clusters);

      expect(result.clusterPositions.size).toBe(2);
      expect(result.clusterPositions.has('ClusterA')).toBe(true);
      expect(result.clusterPositions.has('ClusterB')).toBe(true);
    });

    it('should assign valid cluster positions', () => {
      const nodes: GraphNode[] = [createNode({ id: 'A', name: 'NodeA', type: 'app' })];
      const clusters: Cluster[] = [
        {
          id: 'test',
          name: 'Test',
          type: 'project',
          origin: 'local',
          nodes,
          metadata: new Map(),
          anchors: ['A'],
        },
      ];

      const result = computeHierarchicalLayout(nodes, [], clusters);

      const clusterPos = result.clusterPositions.get('test')!;
      expect(Number.isFinite(clusterPos.x)).toBe(true);
      expect(Number.isFinite(clusterPos.y)).toBe(true);
      expect(clusterPos.width).toBeGreaterThan(0);
      expect(clusterPos.height).toBeGreaterThan(0);
    });

    it('should assign valid node positions', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'A', name: 'NodeA', type: 'framework' }),
        createNode({ id: 'B', name: 'NodeB', type: 'library' }),
      ];
      const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];
      const clusters: Cluster[] = [
        {
          id: 'cluster',
          name: 'Cluster',
          type: 'project',
          origin: 'local',
          nodes,
          metadata: new Map(),
          anchors: ['A'],
        },
      ];

      const result = computeHierarchicalLayout(nodes, edges, clusters);

      nodes.forEach((node) => {
        expect(result.nodePositions.has(node.id)).toBe(true);
        const pos = result.nodePositions.get(node.id)!;
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      });
    });

    it('should return clusters in result', () => {
      const nodes: GraphNode[] = [createNode({ id: 'A', name: 'NodeA', type: 'framework' })];
      const clusters: Cluster[] = [
        {
          id: 'test',
          name: 'Test',
          type: 'project',
          origin: 'local',
          nodes,
          metadata: new Map(),
          anchors: ['A'],
        },
      ];

      const result = computeHierarchicalLayout(nodes, [], clusters);

      expect(result.clusters).toEqual(clusters);
    });

    it('should handle clusters with no nodes gracefully', () => {
      const emptyCluster: Cluster = {
        id: 'empty',
        name: 'Empty',
        type: 'project',
        origin: 'local',
        nodes: [],
        metadata: new Map(),
        anchors: [],
      };

      const result = computeHierarchicalLayout([], [], [emptyCluster]);

      // Should not throw, may or may not have position
      expect(result.clusters).toEqual([emptyCluster]);
    });

    it('should handle cross-cluster edges', () => {
      const nodesA: GraphNode[] = [
        createNode({ id: 'A', name: 'A', type: 'framework', project: 'P1' }),
      ];
      const nodesB: GraphNode[] = [
        createNode({ id: 'B', name: 'B', type: 'library', project: 'P2' }),
      ];
      const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];
      const clusters: Cluster[] = [
        {
          id: 'P1',
          name: 'Project1',
          type: 'project',
          origin: 'local',
          nodes: nodesA,
          metadata: new Map(),
          anchors: ['A'],
        },
        {
          id: 'P2',
          name: 'Project2',
          type: 'project',
          origin: 'local',
          nodes: nodesB,
          metadata: new Map(),
          anchors: ['B'],
        },
      ];

      const result = computeHierarchicalLayout([...nodesA, ...nodesB], edges, clusters);

      // Both clusters should be positioned
      expect(result.clusterPositions.has('P1')).toBe(true);
      expect(result.clusterPositions.has('P2')).toBe(true);

      // Cross-cluster edge should affect layout
      const p1Pos = result.clusterPositions.get('P1')!;
      const p2Pos = result.clusterPositions.get('P2')!;

      // Positions should be different
      const samePosition = p1Pos.x === p2Pos.x && p1Pos.y === p2Pos.y;
      expect(samePosition).toBe(false);
    });

    it('should compute cluster dimensions based on node count', () => {
      const smallNodes: GraphNode[] = [
        createNode({ id: 'S1', name: 'Small1', type: 'framework', project: 'Small' }),
      ];
      const largeNodes: GraphNode[] = [
        createNode({ id: 'L1', name: 'Large1', type: 'framework', project: 'Large' }),
        createNode({ id: 'L2', name: 'Large2', type: 'library', project: 'Large' }),
        createNode({ id: 'L3', name: 'Large3', type: 'library', project: 'Large' }),
        createNode({ id: 'L4', name: 'Large4', type: 'library', project: 'Large' }),
        createNode({ id: 'L5', name: 'Large5', type: 'library', project: 'Large' }),
      ];
      const smallEdges: GraphEdge[] = [];
      const largeEdges: GraphEdge[] = [
        { source: 'L1', target: 'L2' },
        { source: 'L1', target: 'L3' },
        { source: 'L2', target: 'L4' },
        { source: 'L3', target: 'L5' },
      ];
      const clusters: Cluster[] = [
        {
          id: 'Small',
          name: 'Small',
          type: 'project',
          origin: 'local',
          nodes: smallNodes,
          metadata: new Map(),
          anchors: ['S1'],
        },
        {
          id: 'Large',
          name: 'Large',
          type: 'project',
          origin: 'local',
          nodes: largeNodes,
          metadata: new Map(),
          anchors: ['L1'],
        },
      ];

      const result = computeHierarchicalLayout(
        [...smallNodes, ...largeNodes],
        [...smallEdges, ...largeEdges],
        clusters,
      );

      const smallSize = result.clusterPositions.get('Small')!;
      const largeSize = result.clusterPositions.get('Large')!;

      // Larger cluster should have larger dimensions
      expect(largeSize.width).toBeGreaterThanOrEqual(smallSize.width);
    });
  });
});

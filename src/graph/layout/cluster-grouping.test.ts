import { type Cluster, ClusterType, DEFAULT_CLUSTER_CONFIG } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import { createNode } from '@/fixtures';
import { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';

describe('clusterGrouping', () => {
  describe('groupIntoClusters', () => {
    it('should group nodes by project', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'a1', name: 'A1', project: 'ProjectA' }),
        createNode({ id: 'a2', name: 'A2', project: 'ProjectA' }),
        createNode({ id: 'b1', name: 'B1', project: 'ProjectB' }),
      ];
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters.length).toBe(2);
      const projectA = clusters.find((c) => c.id === 'ProjectA');
      const projectB = clusters.find((c) => c.id === 'ProjectB');
      expect(projectA?.nodes.length).toBe(2);
      expect(projectB?.nodes.length).toBe(1);
    });

    it('should use node name as cluster ID when no project', () => {
      const nodes: GraphNode[] = [createNode({ id: 'standalone', name: 'Standalone' })];
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters.length).toBe(1);
      expect(clusters[0].id).toBe('Standalone');
    });

    it('should mark external clusters as package type', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'ext1', name: 'External', origin: Origin.External }),
      ];
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters[0].type).toBe(ClusterType.Package);
    });

    it('should mark local clusters as project type', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'local1', name: 'Local', origin: Origin.Local }),
      ];
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters[0].type).toBe(ClusterType.Project);
    });

    it('should preserve node origin in cluster', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'ext', name: 'External', origin: Origin.External }),
      ];
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters[0].origin).toBe(Origin.External);
    });

    it('should analyze clusters with edges', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App, project: 'MyProject' }),
        createNode({ id: 'lib', name: 'Lib', type: NodeType.Library, project: 'MyProject' }),
      ];
      const edges: GraphEdge[] = [{ source: 'app', target: 'lib' }];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters[0].anchors.length).toBeGreaterThan(0);
      expect(clusters[0].metadata.size).toBe(2);
    });

    it('should handle empty nodes array', () => {
      const clusters = groupIntoClusters([], []);

      expect(clusters).toEqual([]);
    });

    it('should handle many clusters', () => {
      const nodes: GraphNode[] = Array.from({ length: 10 }, (_, i) =>
        createNode({ id: `n${i}`, name: `Node${i}`, project: `Project${i}` }),
      );
      const edges: GraphEdge[] = [];

      const clusters = groupIntoClusters(nodes, edges);

      expect(clusters.length).toBe(10);
    });
  });

  describe('arrangeClusterGrid', () => {
    const createClusterHelper = (
      id: string,
      nodeCount: number,
      origin: Origin = Origin.Local,
    ): Cluster => ({
      id,
      name: id,
      type: origin === Origin.Local ? ClusterType.Project : ClusterType.Package,
      origin,
      nodes: Array.from({ length: nodeCount }, (_, i) =>
        createNode({ id: `${id}-${i}`, name: `${id}-${i}` }),
      ),
      metadata: new Map(),
      anchors: [],
      bounds: { x: 0, y: 0, width: 300, height: 300 },
    });

    it('should position clusters in a grid', () => {
      const clusters = [
        createClusterHelper('A', 5),
        createClusterHelper('B', 3),
        createClusterHelper('C', 2),
        createClusterHelper('D', 1),
      ];

      const positions = arrangeClusterGrid(clusters);

      expect(positions.size).toBe(4);
      // All positions should be defined
      clusters.forEach((c) => {
        expect(positions.has(c.id)).toBe(true);
        const pos = positions.get(c.id);
        expect(pos?.x).toBeDefined();
        expect(pos?.y).toBeDefined();
      });
    });

    it('should place local clusters before external', () => {
      const clusters = [
        createClusterHelper('External', 5, 'external'),
        createClusterHelper('Local', 5, 'local'),
      ];

      const positions = arrangeClusterGrid(clusters);

      const localPos = positions.get('Local')!;
      const externalPos = positions.get('External')!;

      // Local should come first (either earlier x or y position)
      const localPriority = localPos.y * 10000 + localPos.x;
      const externalPriority = externalPos.y * 10000 + externalPos.x;
      expect(localPriority).toBeLessThanOrEqual(externalPriority);
    });

    it('should sort by size within same origin', () => {
      const clusters = [
        createClusterHelper('Small', 2, 'local'),
        createClusterHelper('Large', 10, 'local'),
        createClusterHelper('Medium', 5, 'local'),
      ];

      const positions = arrangeClusterGrid(clusters);

      // Larger clusters should come first
      const largePos = positions.get('Large')!;
      const smallPos = positions.get('Small')!;

      const largePriority = largePos.y * 10000 + largePos.x;
      const smallPriority = smallPos.y * 10000 + smallPos.x;
      expect(largePriority).toBeLessThanOrEqual(smallPriority);
    });

    it('should use default config when not provided', () => {
      const clusters = [createClusterHelper('A', 1)];

      const positions = arrangeClusterGrid(clusters);

      expect(positions.size).toBe(1);
    });

    it('should handle single cluster', () => {
      const clusters = [createClusterHelper('Only', 5)];

      const positions = arrangeClusterGrid(clusters);

      expect(positions.get('Only')).toEqual({ x: 0, y: 0 });
    });

    it('should handle empty clusters array', () => {
      const positions = arrangeClusterGrid([]);

      expect(positions.size).toBe(0);
    });

    it('should respect cluster spacing from config', () => {
      const clusters = [createClusterHelper('A', 1), createClusterHelper('B', 1)];
      const config = { ...DEFAULT_CLUSTER_CONFIG, clusterSpacing: 200 };

      const positions = arrangeClusterGrid(clusters, config);

      const posA = positions.get('A')!;
      const posB = positions.get('B')!;

      // Either in different columns (x differs) or rows (y differs)
      const xDiff = Math.abs(posB.x - posA.x);
      const yDiff = Math.abs(posB.y - posA.y);
      expect(xDiff + yDiff).toBeGreaterThan(0);
    });

    it('should use cluster bounds for spacing', () => {
      const clusters = [
        {
          ...createClusterHelper('A', 1),
          bounds: { x: 0, y: 0, width: 500, height: 200 },
        },
        {
          ...createClusterHelper('B', 1),
          bounds: { x: 0, y: 0, width: 300, height: 300 },
        },
      ];

      const positions = arrangeClusterGrid(clusters);

      // Both should be positioned
      expect(positions.has('A')).toBe(true);
      expect(positions.has('B')).toBe(true);
    });

    it('should use default bounds when not specified', () => {
      const cluster: Cluster = {
        id: 'NoBounds',
        name: 'NoBounds',
        type: ClusterType.Project,
        origin: Origin.Local,
        nodes: [createNode({ id: 'n1', name: 'N1' })],
        metadata: new Map(),
        anchors: [],
        // No bounds specified
      };

      const positions = arrangeClusterGrid([cluster, createClusterHelper('B', 1)]);

      expect(positions.has('NoBounds')).toBe(true);
    });

    it('should wrap to next row when exceeding column count', () => {
      // Create enough clusters to require multiple rows
      const clusters = Array.from({ length: 6 }, (_, i) => createClusterHelper(`Cluster${i}`, 1));

      const positions = arrangeClusterGrid(clusters);

      // Should have some variation in y positions (multiple rows)
      const yValues = Array.from(positions.values()).map((p) => p.y);
      const uniqueY = new Set(yValues);
      expect(uniqueY.size).toBeGreaterThan(1);
    });
  });
});

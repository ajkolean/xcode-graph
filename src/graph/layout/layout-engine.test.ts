/**
 * Tests for layout engine module (ELK-based)
 * Verifies strata positioning and cluster layout behavior
 */

import type { Cluster } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import {
  createLayeredGraph,
  createMultiClusterGraph,
  createProjectGraph,
} from '../../fixtures/graphs';
import { computeHierarchicalLayout } from './index';

/**
 * Helper to create clusters from nodes based on their project property
 */
function createClustersFromGraph(nodes: GraphNode[], _edges: GraphEdge[]): Cluster[] {
  const projectNodes = new Map<string, GraphNode[]>();

  for (const node of nodes) {
    const project = node.project ?? 'default';
    if (!projectNodes.has(project)) {
      projectNodes.set(project, []);
    }
    projectNodes.get(project)!.push(node);
  }

  return Array.from(projectNodes.entries()).map(([id, clusterNodes]) => ({
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: clusterNodes,
    anchors: clusterNodes.length > 0 ? [clusterNodes[0]!.id] : [],
    metadata: new Map(),
  }));
}

describe('computeHierarchicalLayout', () => {
  describe('Cluster Strata Positioning', () => {
    it('should position all layers with valid coordinates', async () => {
      // Create a layered graph with 4 layers, 3 nodes per layer
      const { nodes, edges } = createLayeredGraph(4, 3);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Note: After force-directed massage, strict strata Y ordering is relaxed
      // to reduce overlaps. We verify all clusters have valid positions instead.
      for (let i = 0; i < 4; i++) {
        const pos = result.clusterPositions.get(`Layer${i}`);
        expect(pos).toBeDefined();
        expect(Number.isFinite(pos!.x)).toBe(true);
        expect(Number.isFinite(pos!.y)).toBe(true);
      }
    });

    it('should create distinct cluster positions', async () => {
      const { nodes, edges } = createLayeredGraph(3, 2);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Verify clusters have distinct positions (not all collapsed to same point)
      const positions = Array.from(result.clusterPositions.values());
      const uniquePositions = new Set(
        positions.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`),
      );
      expect(uniquePositions.size).toBeGreaterThan(1);
    });

    it('should produce structurally consistent layouts', async () => {
      // Note: Due to d3-force massage using non-deterministic simulation,
      // exact position determinism isn't achievable. We verify structural consistency.
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result1 = await computeHierarchicalLayout(nodes, edges, clusters);
      const result2 = await computeHierarchicalLayout(nodes, edges, clusters);

      // Same clusters should have positions in both results
      expect(result1.clusterPositions.size).toBe(result2.clusterPositions.size);
      for (const clusterId of result1.clusterPositions.keys()) {
        expect(result2.clusterPositions.has(clusterId)).toBe(true);
      }

      // Same nodes should have positions in both results
      expect(result1.nodePositions.size).toBe(result2.nodePositions.size);
      for (const nodeId of result1.nodePositions.keys()) {
        expect(result2.nodePositions.has(nodeId)).toBe(true);
      }
    });
  });

  describe('Project Graph Layout', () => {
    it('should stratify project graph correctly', async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Get cluster Y positions
      const appY = result.clusterPositions.get('App')?.y ?? 0;
      const featuresY = result.clusterPositions.get('Features')?.y ?? 0;
      const coreY = result.clusterPositions.get('Core')?.y ?? 0;

      // App depends on Features, Features depends on Core
      expect(appY).toBeLessThan(featuresY);
      expect(featuresY).toBeLessThan(coreY);
    });

    it('should have reasonable cluster width and height', async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      for (const [, pos] of result.clusterPositions) {
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
        // Clusters should be reasonably sized
        expect(pos.width).toBeLessThan(2000);
        expect(pos.height).toBeLessThan(2000);
      }
    });
  });

  describe('Multi-Cluster Graph Layout', () => {
    it('should position all clusters with valid coordinates', async () => {
      // Multi-cluster graph has C0 -> C1 -> C2 -> C3 dependency chain
      // Note: After force-directed massage, strict Y ordering is relaxed
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // All clusters should have valid positions
      for (let i = 0; i < 4; i++) {
        const pos = result.clusterPositions.get(`Cluster${i}`);
        expect(pos).toBeDefined();
        expect(Number.isFinite(pos!.x)).toBe(true);
        expect(Number.isFinite(pos!.y)).toBe(true);
        expect(pos!.width).toBeGreaterThan(0);
        expect(pos!.height).toBeGreaterThan(0);
      }
    });
  });

  describe('Node Positioning Within Clusters', () => {
    function assertNodesWithinCluster(
      cluster: Cluster,
      result: Awaited<ReturnType<typeof computeHierarchicalLayout>>,
    ) {
      const clusterPos = result.clusterPositions.get(cluster.id);
      if (!clusterPos) return;

      const radius = Math.max(clusterPos.width, clusterPos.height) / 2;

      for (const node of cluster.nodes) {
        const nodePos = result.nodePositions.get(node.id);
        if (!nodePos) continue;

        const distFromCenter = Math.sqrt(nodePos.x ** 2 + nodePos.y ** 2);
        expect(distFromCenter).toBeLessThan(radius + 100);
      }
    }

    it('should position nodes within their cluster boundaries', async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      for (const cluster of clusters) {
        assertNodesWithinCluster(cluster, result);
      }
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty graph', async () => {
      const result = await computeHierarchicalLayout([], [], []);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
      expect(result.clusters).toEqual([]);
    });

    it('should handle single node', async () => {
      const nodes: GraphNode[] = [
        {
          id: 'single',
          name: 'Single',
          type: NodeType.Framework,
          platform: Platform.iOS,
          origin: Origin.Local,
        },
      ];
      const edges: GraphEdge[] = [];
      const clusters: Cluster[] = [
        {
          id: 'c0',
          name: 'C0',
          type: ClusterType.Project,
          origin: Origin.Local,
          nodes,
          anchors: ['single'],
          metadata: new Map(),
        },
      ];

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(1);
      expect(result.clusterPositions.size).toBe(1);
    });
  });

  describe('Position and Bounds Assertions', () => {
    it('should assign valid positions to all nodes', async () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(nodes.length);

      for (const node of nodes) {
        const pos = result.nodePositions.get(node.id);
        expect(pos).toBeDefined();
        expect(Number.isFinite(pos!.x)).toBe(true);
        expect(Number.isFinite(pos!.y)).toBe(true);
      }
    });

    it('should assign valid bounds to all clusters', async () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.clusterPositions.size).toBe(clusters.length);

      for (const cluster of clusters) {
        const pos = result.clusterPositions.get(cluster.id);
        expect(pos).toBeDefined();
        expect(pos!.width).toBeGreaterThan(0);
        expect(pos!.height).toBeGreaterThan(0);
      }
    });
  });
});

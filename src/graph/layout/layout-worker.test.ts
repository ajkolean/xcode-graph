/**
 * Layout Worker Tests
 *
 * Tests the layout computation functions that would normally run in a web worker.
 * Imports the computation functions directly and tests them as regular functions,
 * avoiding Comlink/worker protocol complexity.
 */

import type { Cluster } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.types';
import type { GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import {
  createDiamondGraph,
  createEmptyGraph,
  createLayeredGraph,
  createMultiClusterGraph,
  createProjectGraph,
} from '../../fixtures';
import { computeHierarchicalLayout } from './hierarchical-layout';

/**
 * Build clusters from nodes based on their project property.
 * Nodes without a project are placed into a 'default' cluster.
 */
function createClustersFromNodes(nodes: GraphNode[]): Cluster[] {
  const projectNodes = new Map<string, GraphNode[]>();

  for (const node of nodes) {
    const project = node.project ?? 'default';
    if (!projectNodes.has(project)) {
      projectNodes.set(project, []);
    }
    projectNodes.get(project)?.push(node);
  }

  return Array.from(projectNodes.entries()).map(([id, clusterNodes]) => ({
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: clusterNodes,
    anchors: clusterNodes.length > 0 && clusterNodes[0] ? [clusterNodes[0].id] : [],
    metadata: new Map(),
  }));
}

describe('Layout Worker (direct function tests)', () => {
  describe('valid graph input', () => {
    it('should produce layout with positions for a project graph', async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromNodes(nodes);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Every node should get a position
      expect(result.nodePositions.size).toBe(nodes.length);

      // Every cluster should get a position
      expect(result.clusterPositions.size).toBe(clusters.length);

      // All positions should have finite coordinates
      for (const [, pos] of result.nodePositions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }

      for (const [, pos] of result.clusterPositions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
      }
    });

    it('should produce layout for a multi-cluster graph', async () => {
      const { nodes, edges } = createMultiClusterGraph(3, 4);
      const clusters = createClustersFromNodes(nodes);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(nodes.length);
      expect(result.clusterPositions.size).toBe(clusters.length);
      expect(result.clusters).toHaveLength(clusters.length);
    });

    it('should produce layout for a layered graph', async () => {
      const { nodes, edges } = createLayeredGraph(3, 2);
      const clusters = createClustersFromNodes(nodes);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(nodes.length);
      expect(result.clusterPositions.size).toBeGreaterThan(0);
    });
  });

  describe('empty graph', () => {
    it('should return empty valid result for empty graph', async () => {
      const result = await computeHierarchicalLayout([], [], []);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
      expect(result.clusters).toEqual([]);
    });

    it('should handle graph with no edges', async () => {
      const { nodes } = createEmptyGraph();
      const result = await computeHierarchicalLayout(nodes, [], []);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle single node in a single cluster', async () => {
      const singleNode: GraphNode = {
        id: 'solo',
        name: 'SoloNode',
        type: NodeType.Framework,
        platform: Platform.iOS,
        origin: Origin.Local,
      };
      const clusters: Cluster[] = [
        {
          id: 'solo-cluster',
          name: 'SoloCluster',
          type: ClusterType.Project,
          origin: Origin.Local,
          nodes: [singleNode],
          anchors: ['solo'],
          metadata: new Map(),
        },
      ];

      const result = await computeHierarchicalLayout([singleNode], [], clusters);

      expect(result.nodePositions.size).toBe(1);
      expect(result.clusterPositions.size).toBe(1);

      const nodePos = result.nodePositions.get('solo');
      expect(nodePos).toBeDefined();
      expect(Number.isFinite(nodePos?.x)).toBe(true);
      expect(Number.isFinite(nodePos?.y)).toBe(true);
    });

    it('should handle diamond graph structure', async () => {
      const { nodes, edges } = createDiamondGraph();
      const clusters = createClustersFromNodes(nodes);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // All 4 nodes should have positions
      expect(result.nodePositions.size).toBe(4);
      expect(result.nodePositions.has('A')).toBe(true);
      expect(result.nodePositions.has('B')).toBe(true);
      expect(result.nodePositions.has('C')).toBe(true);
      expect(result.nodePositions.has('D')).toBe(true);
    });

    it('should return clusters array in result', async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromNodes(nodes);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.clusters).toBe(clusters);
      expect(result.clusters.length).toBeGreaterThan(0);
    });
  });
});

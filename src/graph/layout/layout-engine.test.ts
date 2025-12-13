/**
 * Tests for layout engine module (ELK-based)
 * Verifies strata positioning and cluster layout behavior
 */

import type { Cluster } from "@shared/schemas";
import type { GraphEdge, GraphNode } from "@shared/schemas/graph.schema";
import { describe, expect, it } from "vitest";
import {
  createLayeredGraph,
  createMultiClusterGraph,
  createProjectGraph,
} from "../../fixtures/graphs";
import { tuistGraphData } from "../../fixtures/tuist-graph-data";
import { groupIntoClusters } from "./cluster-grouping";
import { analyzeCluster } from "./cluster-analysis";
import { computeHierarchicalLayout } from "./index";

/**
 * Helper to create clusters from nodes based on their project property
 */
function createClustersFromGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Cluster[] {
  const projectNodes = new Map<string, GraphNode[]>();

  for (const node of nodes) {
    const project = node.project ?? "default";
    if (!projectNodes.has(project)) {
      projectNodes.set(project, []);
    }
    projectNodes.get(project)!.push(node);
  }

  return Array.from(projectNodes.entries()).map(([id, clusterNodes]) => ({
    id,
    label: id,
    nodes: clusterNodes,
    internalEdges: edges.filter(
      (e) =>
        clusterNodes.some((n) => n.id === e.source) &&
        clusterNodes.some((n) => n.id === e.target),
    ),
  }));
}

describe("computeHierarchicalLayout", () => {
  describe("Cluster Strata Positioning", () => {
    it("should position clusters at different Y levels based on strata", async () => {
      // Create a layered graph with 4 layers, 3 nodes per layer
      const { nodes, edges } = createLayeredGraph(4, 3);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Get cluster Y positions grouped by layer
      const layer0Y = result.clusterPositions.get("Layer0")?.y ?? 0;
      const layer1Y = result.clusterPositions.get("Layer1")?.y ?? 0;
      const layer2Y = result.clusterPositions.get("Layer2")?.y ?? 0;
      const layer3Y = result.clusterPositions.get("Layer3")?.y ?? 0;

      // Verify that Y increases with layer depth (strata)
      // Layer0 depends on Layer1, Layer1 depends on Layer2, etc.
      // So Layer0 should be at top (lowest Y) and Layer3 at bottom (highest Y)
      expect(layer0Y).toBeLessThan(layer1Y);
      expect(layer1Y).toBeLessThan(layer2Y);
      expect(layer2Y).toBeLessThan(layer3Y);
    });

    it("should maintain significant Y spacing between strata", async () => {
      const { nodes, edges } = createLayeredGraph(3, 2);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      const layer0Y = result.clusterPositions.get("Layer0")?.y ?? 0;
      const layer1Y = result.clusterPositions.get("Layer1")?.y ?? 0;
      const layer2Y = result.clusterPositions.get("Layer2")?.y ?? 0;

      // Each layer should have noticeable spacing
      expect(layer1Y - layer0Y).toBeGreaterThan(50);
      expect(layer2Y - layer1Y).toBeGreaterThan(50);
    });

    it("should produce deterministic layout results", async () => {
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result1 = await computeHierarchicalLayout(nodes, edges, clusters);
      const result2 = await computeHierarchicalLayout(nodes, edges, clusters);

      // Cluster positions should be identical
      for (const [clusterId, pos1] of result1.clusterPositions) {
        const pos2 = result2.clusterPositions.get(clusterId);
        expect(pos2).toBeDefined();
        expect(pos1.x).toBeCloseTo(pos2!.x, 1);
        expect(pos1.y).toBeCloseTo(pos2!.y, 1);
      }

      // Node positions should be identical
      for (const [nodeId, pos1] of result1.nodePositions) {
        const pos2 = result2.nodePositions.get(nodeId);
        expect(pos2).toBeDefined();
        expect(pos1.x).toBeCloseTo(pos2!.x, 1);
        expect(pos1.y).toBeCloseTo(pos2!.y, 1);
      }
    });
  });

  describe("Project Graph Layout", () => {
    it("should stratify project graph correctly", async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      // Get cluster Y positions
      const appY = result.clusterPositions.get("App")?.y ?? 0;
      const featuresY = result.clusterPositions.get("Features")?.y ?? 0;
      const coreY = result.clusterPositions.get("Core")?.y ?? 0;

      // App depends on Features, Features depends on Core
      expect(appY).toBeLessThan(featuresY);
      expect(featuresY).toBeLessThan(coreY);
    });

    it("should have reasonable cluster width and height", async () => {
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

  describe("Multi-Cluster Graph Layout", () => {
    it("should position clusters in a linear chain vertically", async () => {
      // Multi-cluster graph has C0 -> C1 -> C2 -> C3 dependency chain
      const { nodes, edges } = createMultiClusterGraph(4, 5);
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      const c0Y = result.clusterPositions.get("Cluster0")?.y ?? 0;
      const c1Y = result.clusterPositions.get("Cluster1")?.y ?? 0;
      const c2Y = result.clusterPositions.get("Cluster2")?.y ?? 0;
      const c3Y = result.clusterPositions.get("Cluster3")?.y ?? 0;

      expect(c0Y).toBeLessThan(c1Y);
      expect(c1Y).toBeLessThan(c2Y);
      expect(c2Y).toBeLessThan(c3Y);
    });
  });

  describe("Node Positioning Within Clusters", () => {
    it("should position nodes within their cluster boundaries", async () => {
      const { nodes, edges } = createProjectGraph();
      const clusters = createClustersFromGraph(nodes, edges);

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      for (const cluster of clusters) {
        const clusterPos = result.clusterPositions.get(cluster.id);
        if (!clusterPos) continue;

        const radius = Math.max(clusterPos.width, clusterPos.height) / 2;

        for (const node of cluster.nodes) {
          const nodePos = result.nodePositions.get(node.id);
          if (!nodePos) continue;

          // Node position is relative to cluster center
          const distFromCenter = Math.sqrt(nodePos.x ** 2 + nodePos.y ** 2);

          // Nodes should be within cluster radius (with some tolerance)
          // ELK rectangles vs circular approximation - tolerance increased
          expect(distFromCenter).toBeLessThan(radius + 100);
        }
      }
    });
  });

  describe("Empty and Edge Cases", () => {
    it("should handle empty graph", async () => {
      const result = await computeHierarchicalLayout([], [], []);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
      expect(result.clusters).toEqual([]);
    });

    it("should handle single node", async () => {
      const nodes: GraphNode[] = [{ id: "single", name: "Single" }];
      const edges: GraphEdge[] = [];
      const clusters: Cluster[] = [
        { id: "c0", label: "C0", nodes, internalEdges: [] },
      ];

      const result = await computeHierarchicalLayout(nodes, edges, clusters);

      expect(result.nodePositions.size).toBe(1);
      expect(result.clusterPositions.size).toBe(1);
    });
  });

  describe("Position and Bounds Assertions", () => {
    it("should assign valid positions to all nodes", async () => {
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

    it("should assign valid bounds to all clusters", async () => {
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

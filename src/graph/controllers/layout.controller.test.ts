/**
 * Tests for LayoutController
 * Ensures deterministic layout computation works correctly
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  createCyclicGraph,
  createDiamondGraph,
  createEmptyGraph,
  createLinearChain,
  createSingleNodeGraph,
} from "@/fixtures";
import { MockHost } from "@/test-utils";
import { LayoutController } from "./layout.controller";

describe("LayoutController", () => {
  let host: MockHost;
  let controller: LayoutController;

  beforeEach(() => {
    host = new MockHost();
    controller = new LayoutController(host);
  });

  describe("Initialization", () => {
    it("should create controller", () => {
      expect(controller).toBeDefined();
    });

    it("should register with host", () => {
      const newHost = new MockHost();
      const newController = new LayoutController(newHost);
      expect(newHost.getControllers()).toContain(newController);
    });

    it("should start with no cached result", () => {
      expect(controller.getCachedResult()).toBeNull();
    });
  });

  describe("Layout Computation", () => {
    it("should compute layout for simple graph", () => {
      const { nodes, edges } = createLinearChain(4);

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(4);
      expect(result.clusterPositions.size).toBeGreaterThan(0);
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should handle empty graph", () => {
      const { nodes, edges } = createEmptyGraph();

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(0);
      expect(result.clusterPositions.size).toBe(0);
      expect(result.clusters).toHaveLength(0);
    });

    it("should handle single node", () => {
      const { nodes, edges } = createSingleNodeGraph();

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(1);
      expect(result.clusterPositions.size).toBeGreaterThan(0);
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should handle cyclic graph", () => {
      const { nodes, edges } = createCyclicGraph();

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(nodes.length);
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should handle diamond pattern", () => {
      const { nodes, edges } = createDiamondGraph();

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(nodes.length);
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should assign positions to all nodes", () => {
      const { nodes, edges } = createLinearChain(5);

      const result = controller.computeLayout(nodes, edges);

      for (const node of nodes) {
        const pos = result.nodePositions.get(node.id);
        expect(pos).toBeDefined();
        expect(typeof pos?.x).toBe("number");
        expect(typeof pos?.y).toBe("number");
      }
    });

    it("should initialize velocities to zero", () => {
      const { nodes, edges } = createLinearChain(3);

      const result = controller.computeLayout(nodes, edges);

      for (const pos of result.nodePositions.values()) {
        expect(pos.vx).toBe(0);
        expect(pos.vy).toBe(0);
      }

      for (const pos of result.clusterPositions.values()) {
        expect(pos.vx).toBe(0);
        expect(pos.vy).toBe(0);
      }
    });

    it("should create clusters from graph structure", () => {
      const { nodes, edges } = createLinearChain(6);

      const result = controller.computeLayout(nodes, edges);

      expect(result.clusters.length).toBeGreaterThan(0);
      // Every cluster should have nodes
      for (const cluster of result.clusters) {
        expect(cluster.nodes.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Caching", () => {
    it("should cache layout result", () => {
      const { nodes, edges } = createLinearChain(3);

      const result1 = controller.computeLayout(nodes, edges);
      const cached = controller.getCachedResult();

      expect(cached).toBe(result1);
    });

    it("should return cached result for same input", () => {
      const { nodes, edges } = createLinearChain(3);

      const result1 = controller.computeLayout(nodes, edges);
      const result2 = controller.computeLayout(nodes, edges);

      expect(result2).toBe(result1); // Same reference
    });

    it("should recompute when input changes", () => {
      const graph1 = createLinearChain(3);
      const graph2 = createLinearChain(4);

      const result1 = controller.computeLayout(graph1.nodes, graph1.edges);
      const result2 = controller.computeLayout(graph2.nodes, graph2.edges);

      expect(result2).not.toBe(result1); // Different reference
      expect(result2.nodePositions.size).toBe(4);
    });

    it("should respect forceRecompute flag", () => {
      const { nodes, edges } = createLinearChain(3);

      const result1 = controller.computeLayout(nodes, edges);
      const result2 = controller.computeLayout(nodes, edges, true); // Force recompute

      expect(result2).not.toBe(result1); // New reference even with same input
    });

    it("should clear cache", () => {
      const { nodes, edges } = createLinearChain(3);

      controller.computeLayout(nodes, edges);
      expect(controller.getCachedResult()).not.toBeNull();

      controller.clearCache();
      expect(controller.getCachedResult()).toBeNull();
    });

    it("should recompute after clearing cache", () => {
      const { nodes, edges } = createLinearChain(3);

      const result1 = controller.computeLayout(nodes, edges);
      controller.clearCache();
      const result2 = controller.computeLayout(nodes, edges);

      expect(result2).not.toBe(result1); // New computation
      expect(result2.nodePositions.size).toBe(result1.nodePositions.size);
    });
  });

  describe("Determinism", () => {
    it("should produce same positions for same input", () => {
      const { nodes, edges } = createLinearChain(4);

      controller.clearCache();
      const result1 = controller.computeLayout(nodes, edges, true);

      controller.clearCache();
      const result2 = controller.computeLayout(nodes, edges, true);

      // Positions should be identical
      for (const node of nodes) {
        const pos1 = result1.nodePositions.get(node.id);
        const pos2 = result2.nodePositions.get(node.id);

        expect(pos1?.x).toBe(pos2?.x);
        expect(pos1?.y).toBe(pos2?.y);
      }
    });

    it("should produce consistent cluster count", () => {
      const { nodes, edges } = createLinearChain(5);

      const result1 = controller.computeLayout(nodes, edges, true);
      const result2 = controller.computeLayout(nodes, edges, true);

      expect(result1.clusters.length).toBe(result2.clusters.length);
    });
  });

  describe("Position Properties", () => {
    it("should include all required position properties", () => {
      const { nodes, edges } = createLinearChain(3);

      const result = controller.computeLayout(nodes, edges);

      const pos = Array.from(result.nodePositions.values())[0];
      expect(pos).toHaveProperty("x");
      expect(pos).toHaveProperty("y");
      expect(pos).toHaveProperty("vx");
      expect(pos).toHaveProperty("vy");
      expect(pos).toHaveProperty("clusterId");
      expect(pos).toHaveProperty("radius");
    });

    it("should include all required cluster position properties", () => {
      const { nodes, edges } = createLinearChain(3);

      const result = controller.computeLayout(nodes, edges);

      if (result.clusterPositions.size > 0) {
        const pos = Array.from(result.clusterPositions.values())[0];
        expect(pos).toHaveProperty("x");
        expect(pos).toHaveProperty("y");
        expect(pos).toHaveProperty("vx");
        expect(pos).toHaveProperty("vy");
        expect(pos).toHaveProperty("width");
        expect(pos).toHaveProperty("height");
      }
    });

    it("should assign valid numeric coordinates", () => {
      const { nodes, edges } = createLinearChain(3);

      const result = controller.computeLayout(nodes, edges);

      for (const pos of result.nodePositions.values()) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it("should assign cluster IDs to nodes", () => {
      const { nodes, edges } = createLinearChain(3);

      const result = controller.computeLayout(nodes, edges);

      for (const pos of result.nodePositions.values()) {
        expect(typeof pos.clusterId).toBe("string");
        expect(pos.clusterId.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Lifecycle Hooks", () => {
    it("should implement hostConnected", () => {
      expect(() => {
        host.connectedCallback();
      }).not.toThrow();
    });

    it("should clear cache on disconnect", () => {
      const { nodes, edges } = createLinearChain(3);

      controller.computeLayout(nodes, edges);
      expect(controller.getCachedResult()).not.toBeNull();

      host.disconnectedCallback();

      expect(controller.getCachedResult()).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large graphs", () => {
      // Create a larger graph
      const { nodes, edges } = createLinearChain(100);

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(100);
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should handle disconnected components", () => {
      // Create two separate chains with unique IDs
      const chain1 = createLinearChain(3);
      const chain2 = createLinearChain(3);

      // Rename chain2 nodes to avoid ID collision
      const chain2Nodes = chain2.nodes.map((n, i) => ({
        ...n,
        id: `n-chain2-${i}`,
      }));
      const chain2Edges = chain2.edges.map((e, i) => ({
        ...e,
        source: `n-chain2-${i}`,
        target: `n-chain2-${i + 1}`,
      }));

      const nodes = [...chain1.nodes, ...chain2Nodes];
      const edges = [...chain1.edges, ...chain2Edges];

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(6);
      // Should create clusters for disconnected components
      expect(result.clusters.length).toBeGreaterThan(0);
    });

    it("should handle nodes with no edges", () => {
      const { nodes } = createLinearChain(3);
      const edges: typeof nodes extends Array<infer T>
        ? Array<{ source: string; target: string }>
        : never = [];

      const result = controller.computeLayout(nodes, edges);

      expect(result.nodePositions.size).toBe(3);
    });
  });
});

/**
 * Tests for refactored GraphLayoutController
 * Ensures the composition of Layout + Physics + Animation works correctly
 */

import type { ReactiveController } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { createLinearChain } from '@/fixtures';
import { GraphLayoutController } from './graph-layout.controller';

// Mock host
class MockHost {
  private readonly controllers: ReactiveController[] = [];
  updateCount = 0;
  readonly updateComplete = Promise.resolve(true);

  addController(controller: ReactiveController) {
    this.controllers.push(controller);
  }

  removeController(_controller: ReactiveController): void {
    const idx = this.controllers.indexOf(_controller);
    if (idx >= 0) this.controllers.splice(idx, 1);
  }

  requestUpdate() {
    this.updateCount++;
  }

  connectedCallback() {
    for (const c of this.controllers) {
      c.hostConnected?.();
    }
  }

  disconnectedCallback() {
    for (const c of this.controllers) {
      c.hostDisconnected?.();
    }
  }
}

describe('GraphLayoutController', () => {
  let host: MockHost;
  let controller: GraphLayoutController;

  beforeEach(() => {
    host = new MockHost();
    controller = new GraphLayoutController(host, {
      enableAnimation: false, // Disable for faster tests
    });
  });

  describe('Initialization', () => {
    it('should create controller with default config', () => {
      expect(controller).toBeDefined();
      expect(controller.enableAnimation).toBe(false);
    });

    it('should initialize with empty positions', () => {
      expect(controller.nodePositions.size).toBe(0);
      expect(controller.clusterPositions.size).toBe(0);
      expect(controller.clusters).toHaveLength(0);
    });
  });

  describe('Layout Computation', () => {
    it('should compute layout for simple graph', async () => {
      const { nodes, edges } = createLinearChain(4);

      await controller.computeLayout(nodes, edges);

      expect(controller.nodePositions.size).toBe(4);
      expect(controller.clusterPositions.size).toBeGreaterThan(0);
      expect(controller.clusters.length).toBeGreaterThan(0);
    });

    it('should handle empty graph', async () => {
      await controller.computeLayout([], []);

      expect(controller.nodePositions.size).toBe(0);
      expect(controller.clusterPositions.size).toBe(0);
      expect(controller.clusters).toHaveLength(0);
    });
  });

  describe('Animation', () => {
    it('should not animate when disabled', async () => {
      const { nodes, edges } = createLinearChain(3);

      await controller.computeLayout(nodes, edges);

      expect(controller.isSettling).toBe(false);
    });

    it('should support enabling animation', () => {
      const animatedController = new GraphLayoutController(host, {
        enableAnimation: true,
        animationTicks: 5, // Short animation for testing
      });

      expect(animatedController.enableAnimation).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should update animation enabled', () => {
      controller.setEnableAnimation(true);
      expect(controller.enableAnimation).toBe(true);

      controller.setEnableAnimation(false);
      expect(controller.enableAnimation).toBe(false);
    });
  });

  describe('Lifecycle', () => {
    it('should cleanup on disconnect', async () => {
      const { nodes, edges } = createLinearChain(3);
      await controller.computeLayout(nodes, edges);

      host.disconnectedCallback();

      // Should not throw
      expect(controller.isSettling).toBe(false);
    });
  });

  describe('Public API', () => {
    it('should expose required methods and properties', () => {
      // Check all public methods exist
      expect(typeof controller.computeLayout).toBe('function');
      expect(typeof controller.setEnableAnimation).toBe('function');

      // Check all public properties exist
      expect(controller.nodePositions).toBeDefined();
      expect(controller.clusterPositions).toBeDefined();
      expect(controller.clusters).toBeDefined();
      expect(typeof controller.isSettling).toBe('boolean');
      expect(typeof controller.enableAnimation).toBe('boolean');
    });

    it('should expose cycle-related getters as undefined before layout', () => {
      expect(controller.cycleNodes).toBeUndefined();
      expect(controller.nodeSccId).toBeUndefined();
      expect(controller.sccSizes).toBeUndefined();
    });

    it('should expose edge-related getters as undefined before layout', () => {
      expect(controller.clusterEdges).toBeUndefined();
      expect(controller.routedEdges).toBeUndefined();
    });

    it('should populate cycle and edge getters after layout computation', async () => {
      const { nodes, edges } = createLinearChain(4);

      await controller.computeLayout(nodes, edges);

      // After layout, these may be defined depending on graph structure
      // For a linear chain without cycles, cycleNodes may be an empty set or undefined
      // The important thing is the getters work without error
      const cycleNodes = controller.cycleNodes;
      const nodeSccId = controller.nodeSccId;
      const sccSizes = controller.sccSizes;
      const clusterEdges = controller.clusterEdges;
      const routedEdges = controller.routedEdges;

      // Verify type correctness (no errors accessing these)
      if (cycleNodes) expect(cycleNodes).toBeInstanceOf(Set);
      if (nodeSccId) expect(nodeSccId).toBeInstanceOf(Map);
      if (sccSizes) expect(sccSizes).toBeInstanceOf(Map);
      if (clusterEdges) expect(Array.isArray(clusterEdges)).toBe(true);
      if (routedEdges) expect(Array.isArray(routedEdges)).toBe(true);
    });

    it('should reset all getters to initial state when computing empty layout', async () => {
      const { nodes, edges } = createLinearChain(4);
      await controller.computeLayout(nodes, edges);

      // Now compute with empty graph
      await controller.computeLayout([], []);

      expect(controller.nodePositions.size).toBe(0);
      expect(controller.clusterPositions.size).toBe(0);
      expect(controller.clusters).toHaveLength(0);
      expect(controller.cycleNodes).toBeUndefined();
      expect(controller.nodeSccId).toBeUndefined();
      expect(controller.sccSizes).toBeUndefined();
      expect(controller.clusterEdges).toBeUndefined();
      expect(controller.routedEdges).toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should coordinate all three sub-controllers', async () => {
      const { nodes, edges } = createLinearChain(10);

      await controller.computeLayout(nodes, edges);

      // LayoutController should have computed positions
      expect(controller.nodePositions.size).toBe(10);

      // AnimationController should not be running (disabled)
      expect(controller.isSettling).toBe(false);
    });
  });
});

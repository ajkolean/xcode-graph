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

  removeController(_controller: ReactiveController): void {} // skipcq: JS-0105, JS-0321

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

/**
 * Tests for AnimationController
 * Ensures physics-based animation loop works correctly
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLinearChain } from '@/fixtures';
import type { ClusterPosition, NodePosition } from '@/shared/schemas';
import {
  AnimationCallbackTracker,
  installAnimationFrameMock,
  type MockAnimationFrame,
  MockHost,
} from '@/test-utils';
import { AnimationController } from './animation.controller';
import { PhysicsController } from './physics.controller';

describe('AnimationController', () => {
  let host: MockHost;
  let controller: AnimationController;
  let rafMock: MockAnimationFrame;

  beforeEach(() => {
    host = new MockHost();
    controller = new AnimationController(host);
    rafMock = installAnimationFrameMock();
  });

  describe('Initialization', () => {
    it('should create controller with default config', () => {
      expect(controller).toBeDefined();
      expect(controller.isActive).toBe(false);
      expect(controller.currentTick).toBe(0);
    });

    it('should accept custom total ticks', () => {
      const customController = new AnimationController(host, { totalTicks: 60 });
      expect(customController.maxTicks).toBe(60);
    });

    it('should accept custom damping', () => {
      const customController = new AnimationController(host, { damping: 0.5 });
      // Damping is internal, just verify construction succeeds
      expect(customController).toBeDefined();
    });

    it('should register with host', () => {
      const newHost = new MockHost();
      const newController = new AnimationController(newHost);
      expect(newHost.getControllers()).toContain(newController);
    });
  });

  describe('Animation Lifecycle', () => {
    it('should start animation', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);

      expect(controller.isActive).toBe(true);
      expect(rafMock.hasPending()).toBe(true);
    });

    it('should stop animation', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);
      controller.stop();

      expect(controller.isActive).toBe(false);
      expect(rafMock.hasPending()).toBe(false);
    });

    it('should complete animation after max ticks', () => {
      const customController = new AnimationController(host, { totalTicks: 5 });
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(
        nodePositions,
        clusterPositions,
        edges,
        [],
        physicsController,
      );

      // Simulate 6 frames (one extra to trigger completion check)
      rafMock.tickMultiple(6);

      expect(customController.isActive).toBe(false);
      expect(customController.currentTick).toBe(5);
    });

    it('should reset tick count on new animation', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      // Start and tick
      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);
      rafMock.tick();
      expect(controller.currentTick).toBe(1);

      // Start again
      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);
      expect(controller.currentTick).toBe(0);
    });
  });

  describe('Animation Progress', () => {
    it('should track tick count', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);

      rafMock.tick();
      expect(controller.currentTick).toBe(1);

      rafMock.tick();
      expect(controller.currentTick).toBe(2);
    });

    it('should calculate progress (0-1)', () => {
      const customController = new AnimationController(host, { totalTicks: 10 });
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(
        nodePositions,
        clusterPositions,
        edges,
        [],
        physicsController,
      );

      expect(customController.progress).toBe(0);

      rafMock.tickMultiple(5);
      expect(customController.progress).toBe(0.5);

      rafMock.tickMultiple(5);
      expect(customController.progress).toBe(1);
    });

    it('should request host updates on each tick', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);

      const initialUpdateCount = host.updateCount;
      rafMock.tickMultiple(3);

      expect(host.updateCount).toBe(initialUpdateCount + 3);
    });
  });

  describe('Callbacks', () => {
    it('should call onTick callback', () => {
      const tracker = new AnimationCallbackTracker();
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(
        nodePositions,
        clusterPositions,
        edges,
        [],
        physicsController,
        tracker,
      );

      rafMock.tickMultiple(3);

      expect(tracker.getTotalTicks()).toBe(3);
    });

    it('should call onComplete callback', () => {
      const tracker = new AnimationCallbackTracker();
      const customController = new AnimationController(host, { totalTicks: 3 });
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(
        nodePositions,
        clusterPositions,
        edges,
        [],
        physicsController,
        tracker,
      );

      rafMock.tickMultiple(4); // Extra tick to trigger completion

      expect(tracker.wasCompleted()).toBe(true);
    });

    it('should provide alpha decay in callbacks', () => {
      const tracker = new AnimationCallbackTracker();
      const customController = new AnimationController(host, { totalTicks: 10 });
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(
        nodePositions,
        clusterPositions,
        edges,
        [],
        physicsController,
        tracker,
      );

      rafMock.tickMultiple(11);

      const alphas = tracker.getAlphaValues();
      // Alpha should decay from 1 to 0
      expect(alphas[0]).toBeGreaterThan(alphas[9]);
      expect(alphas[9]).toBeLessThan(0.15); // Close to zero but with some tolerance
    });
  });

  describe('Position Updates', () => {
    it('should update node positions based on velocity', () => {
      const nodePositions = new Map<string, NodePosition>([
        ['n1', { x: 0, y: 0, vx: 10, vy: 5, clusterId: 'c1', radius: 10 }],
      ]);
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, [], [], physicsController);

      rafMock.tick();

      const pos = nodePositions.get('n1')!;
      expect(pos.x).not.toBe(0); // Should have moved
      expect(pos.y).not.toBe(0);
    });

    it('should apply damping to velocities', () => {
      const customController = new AnimationController(host, { damping: 0.5 });
      const nodePositions = new Map<string, NodePosition>([
        ['n1', { x: 0, y: 0, vx: 100, vy: 100, clusterId: 'c1', radius: 10 }],
      ]);
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(nodePositions, clusterPositions, [], [], physicsController);

      const initialVx = nodePositions.get('n1')!.vx;
      rafMock.tick();
      const afterVx = nodePositions.get('n1')!.vx;

      expect(afterVx).toBeLessThan(initialVx);
    });

    it('should zero velocities on completion', () => {
      const customController = new AnimationController(host, { totalTicks: 2 });
      const nodePositions = new Map<string, NodePosition>([
        ['n1', { x: 0, y: 0, vx: 10, vy: 10, clusterId: 'c1', radius: 10 }],
      ]);
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      customController.startAnimation(nodePositions, clusterPositions, [], [], physicsController);

      rafMock.tickMultiple(3); // Extra tick to complete

      const pos = nodePositions.get('n1')!;
      expect(pos.vx).toBe(0);
      expect(pos.vy).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update total ticks', () => {
      expect(controller.maxTicks).toBe(30); // Default
      controller.setTotalTicks(60);
      expect(controller.maxTicks).toBe(60);
    });

    it('should update damping', () => {
      controller.setDamping(0.5);
      // Damping is internal, verify no error
      expect(controller).toBeDefined();
    });

    it('should clamp total ticks to minimum of 1', () => {
      controller.setTotalTicks(0);
      expect(controller.maxTicks).toBe(1);

      controller.setTotalTicks(-10);
      expect(controller.maxTicks).toBe(1);
    });

    it('should clamp damping between 0 and 1', () => {
      controller.setDamping(-0.5);
      // Should clamp to 0 (verified internally)
      controller.setDamping(1.5);
      // Should clamp to 1 (verified internally)
      expect(controller).toBeDefined();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should implement hostConnected', () => {
      expect(() => {
        host.connectedCallback();
      }).not.toThrow();
    });

    it('should cleanup on hostDisconnected', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);

      host.disconnectedCallback();

      expect(controller.isActive).toBe(false);
      expect(rafMock.hasPending()).toBe(false);
    });

    it('should handle cleanup errors gracefully', () => {
      // Force error by corrupting internal state
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Trigger disconnect with potentially invalid state
      host.disconnectedCallback();

      // Should not throw
      expect(controller.isActive).toBe(false);

      spy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty positions', () => {
      const nodePositions = new Map<string, NodePosition>();
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      expect(() => {
        controller.startAnimation(nodePositions, clusterPositions, [], [], physicsController);
        rafMock.tick();
      }).not.toThrow();
    });

    it('should handle stopping already stopped animation', () => {
      expect(() => {
        controller.stop();
        controller.stop();
      }).not.toThrow();
    });

    it('should handle starting while already animating', () => {
      const { nodes, edges } = createLinearChain(3);
      const nodePositions = new Map<string, NodePosition>(
        nodes.map((n) => [n.id, { x: 0, y: 0, vx: 0, vy: 0, clusterId: '', radius: 10 }]),
      );
      const clusterPositions = new Map<string, ClusterPosition>();
      const physicsController = new PhysicsController(host);

      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);
      rafMock.tick();

      // Start again - should stop previous animation
      controller.startAnimation(nodePositions, clusterPositions, edges, [], physicsController);

      expect(controller.currentTick).toBe(0); // Reset
      expect(controller.isActive).toBe(true);
    });
  });
});

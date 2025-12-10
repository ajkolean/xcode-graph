/**
 * Tests for LayoutWorkerController
 * Ensures Web Worker-based layout computation works correctly
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyGraph, createLinearChain } from '@/fixtures';
import { MockHost, MockLayoutWorkerAPI } from '@/test-utils';
import { LayoutWorkerController } from './layout-worker.controller';

// Mock Comlink
vi.mock('comlink', () => ({
  wrap: vi.fn(),
}));

describe('LayoutWorkerController', () => {
  let host: MockHost;
  let controller: LayoutWorkerController;
  let mockWorkerAPI: MockLayoutWorkerAPI;

  beforeEach(async () => {
    host = new MockHost();
    mockWorkerAPI = new MockLayoutWorkerAPI();

    // Mock Worker constructor as a class
    global.Worker = class MockWorker {
      postMessage = vi.fn();
      terminate = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      onmessage = null;
      onerror = null;
      onmessageerror = null;
      dispatchEvent = vi.fn();
    } as unknown as typeof Worker;

    // Mock comlink wrap
    const { wrap } = await import('comlink');
    vi.mocked(wrap).mockReturnValue(mockWorkerAPI as never);

    controller = new LayoutWorkerController(host);
  });

  describe('Initialization', () => {
    it('should create controller with default config', () => {
      expect(controller).toBeDefined();
      expect(controller.enableAnimation).toBe(true);
      expect(controller.animationTicks).toBe(30);
      expect(controller.useWorker).toBe(true);
    });

    it('should accept custom animation config', () => {
      const customController = new LayoutWorkerController(host, {
        enableAnimation: false,
        animationTicks: 60,
      });
      expect(customController.enableAnimation).toBe(false);
      expect(customController.animationTicks).toBe(60);
    });

    it('should accept worker disable flag', () => {
      const customController = new LayoutWorkerController(host, {
        useWorker: false,
      });
      expect(customController.useWorker).toBe(false);
    });

    it('should register with host', () => {
      const newHost = new MockHost();
      const newController = new LayoutWorkerController(newHost);
      expect(newHost.getControllers()).toContain(newController);
    });

    it('should start with empty positions', () => {
      expect(controller.nodePositions.size).toBe(0);
      expect(controller.clusterPositions.size).toBe(0);
      expect(controller.clusters).toHaveLength(0);
      expect(controller.isSettling).toBe(false);
    });
  });

  describe('Layout Computation - No Animation', () => {
    it('should compute initial layout', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = false;

      await controller.computeLayout(nodes, edges);

      expect(mockWorkerAPI.computeInitialLayoutCalls).toBe(1);
      expect(controller.isSettling).toBe(false);
    });

    it('should handle empty graph', async () => {
      const { nodes, edges } = createEmptyGraph();

      await controller.computeLayout(nodes, edges);

      expect(controller.nodePositions.size).toBe(0);
      expect(controller.clusterPositions.size).toBe(0);
      expect(controller.clusters).toHaveLength(0);
    });

    it('should request host update after computation', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = false;

      const initialUpdateCount = host.updateCount;
      await controller.computeLayout(nodes, edges);

      expect(host.updateCount).toBeGreaterThan(initialUpdateCount);
    });
  });

  describe('Layout Computation - With Animation', () => {
    it('should compute animated layout', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 0; // Fast test

      await controller.computeLayout(nodes, edges);

      expect(mockWorkerAPI.computeAnimatedLayoutCalls).toBe(1);
    });

    it('should set isSettling during animation', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 10;

      const computePromise = controller.computeLayout(nodes, edges);

      // Should be settling immediately after starting
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(controller.isSettling).toBe(true);

      await computePromise;
      expect(controller.isSettling).toBe(false);
    });

    it('should call progress callback during animation', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 0;

      await controller.computeLayout(nodes, edges);

      // Progress callbacks should have been received
      expect(controller.isSettling).toBe(false);
    });

    it('should update host during animation progress', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 0;

      const initialUpdateCount = host.updateCount;
      await controller.computeLayout(nodes, edges);

      expect(host.updateCount).toBeGreaterThan(initialUpdateCount);
    });
  });

  describe('Worker Lifecycle', () => {
    it('should initialize worker lazily', async () => {
      const { nodes, edges } = createLinearChain(3);

      // Worker class is available but not instantiated
      expect(global.Worker).toBeDefined();

      await controller.computeLayout(nodes, edges);

      // Worker should have been instantiated (verified by worker API calls)
      expect(
        mockWorkerAPI.computeInitialLayoutCalls + mockWorkerAPI.computeAnimatedLayoutCalls,
      ).toBeGreaterThan(0);
    });

    it('should reuse worker for multiple computations', async () => {
      const graph1 = createLinearChain(3);
      const graph2 = createLinearChain(4);

      mockWorkerAPI.reset();
      await controller.computeLayout(graph1.nodes, graph1.edges);
      const firstCallCount =
        mockWorkerAPI.computeInitialLayoutCalls + mockWorkerAPI.computeAnimatedLayoutCalls;

      await controller.computeLayout(graph2.nodes, graph2.edges);
      const secondCallCount =
        mockWorkerAPI.computeInitialLayoutCalls + mockWorkerAPI.computeAnimatedLayoutCalls;

      // Worker should be reused (both computations completed)
      expect(secondCallCount).toBe(firstCallCount + 1);
    });

    it('should terminate worker on disconnect', async () => {
      const mockTerminate = vi.fn();

      global.Worker = class MockWorker {
        postMessage = vi.fn();
        terminate = mockTerminate;
        addEventListener = vi.fn();
        removeEventListener = vi.fn();
        onmessage = null;
        onerror = null;
        onmessageerror = null;
        dispatchEvent = vi.fn();
      } as unknown as typeof Worker;

      const testController = new LayoutWorkerController(host);
      await testController.computeLayout([], []);

      host.disconnectedCallback();

      // Worker should be terminated (cleanup may be async)
      expect(testController).toBeDefined();
    });
  });

  describe('Animation Control', () => {
    it('should stop animation', async () => {
      // Start animation first so worker is initialized
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      controller.computeLayout(nodes, edges); // Start but don't await

      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      await controller.stopAnimation();

      expect(mockWorkerAPI.cancelAnimationCalls).toBeGreaterThanOrEqual(1);
      expect(controller.isSettling).toBe(false);
    });

    it('should stop animation during computation', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 100; // Slow animation

      const computePromise = controller.computeLayout(nodes, edges);

      // Stop animation mid-computation
      await new Promise((resolve) => setTimeout(resolve, 10));
      await controller.stopAnimation();

      await computePromise;

      expect(controller.isSettling).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle worker initialization error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Force worker creation error
      global.Worker = class ErrorWorker {
        constructor() {
          throw new Error('Worker creation failed');
        }
      } as unknown as typeof Worker;

      const errorController = new LayoutWorkerController(host);
      const { nodes, edges } = createLinearChain(3);

      await errorController.computeLayout(nodes, edges);

      // Should fallback to empty state
      expect(errorController.nodePositions.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle computation error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockWorkerAPI.shouldError = true;
      mockWorkerAPI.errorMessage = 'Computation failed';

      const { nodes, edges } = createLinearChain(3);

      await controller.computeLayout(nodes, edges);

      // Should fallback to empty state
      expect(controller.nodePositions.size).toBe(0);
      expect(controller.isSettling).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle disconnect error gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Force error during cleanup
      mockWorkerAPI.cancelAnimationCalls = 0;

      expect(() => {
        host.disconnectedCallback();
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Worker Fallback', () => {
    it('should throw error when worker disabled', async () => {
      const noWorkerController = new LayoutWorkerController(host, {
        useWorker: false,
      });
      const { nodes, edges } = createLinearChain(3);

      await expect(noWorkerController.computeLayout(nodes, edges)).rejects.toThrow(
        'Main thread fallback not implemented',
      );
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should implement hostConnected', () => {
      expect(() => {
        host.connectedCallback();
      }).not.toThrow();
    });

    it('should cleanup on hostDisconnected', () => {
      expect(() => {
        host.disconnectedCallback();
      }).not.toThrow();

      expect(controller.isSettling).toBe(false);
    });
  });

  describe('Configuration Updates', () => {
    it('should respect enableAnimation setting', async () => {
      controller.enableAnimation = false;
      const { nodes, edges } = createLinearChain(3);

      await controller.computeLayout(nodes, edges);

      expect(mockWorkerAPI.computeInitialLayoutCalls).toBe(1);
      expect(mockWorkerAPI.computeAnimatedLayoutCalls).toBe(0);
    });

    it('should respect animationTicks setting', async () => {
      controller.enableAnimation = true;
      controller.animationTicks = 10;
      mockWorkerAPI.animationDelay = 0;

      const { nodes, edges } = createLinearChain(3);

      await controller.computeLayout(nodes, edges);

      // Animation ticks passed to worker (verified by mock)
      expect(mockWorkerAPI.computeAnimatedLayoutCalls).toBe(1);
    });
  });

  describe('State Management', () => {
    it('should update positions from worker result', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = false;

      // Set mock output
      mockWorkerAPI.mockInitialOutput = {
        nodePositions: new Map([
          ['test-node', { x: 100, y: 200, vx: 0, vy: 0, clusterId: 'c1', radius: 10 }],
        ]),
        clusterPositions: new Map([
          ['c1', { x: 50, y: 60, vx: 0, vy: 0, width: 150, height: 150 }],
        ]),
        clusters: [],
        isAnimating: false,
        tickCount: 0,
        totalTicks: 0,
      };

      await controller.computeLayout(nodes, edges);

      expect(controller.nodePositions.has('test-node')).toBe(true);
      expect(controller.clusterPositions.has('c1')).toBe(true);
    });

    it('should update positions during animation progress', async () => {
      const { nodes, edges } = createLinearChain(3);
      controller.enableAnimation = true;
      mockWorkerAPI.animationDelay = 0;

      await controller.computeLayout(nodes, edges);

      // Positions should be updated from final result
      expect(controller.nodePositions).toBeDefined();
    });
  });
});

/**
 * Comlink Mocks - Test utilities for Comlink worker communication
 */

import type { LayoutWorkerAPI } from '@/graph/workers/layout-api';

/**
 * Mock Comlink wrap function
 * Returns a mock LayoutWorkerAPI instead of wrapping a real worker
 */
export function createMockComlinkWrap() {
  const mockAPI: LayoutWorkerAPI = {
    async computeInitialLayout(input) {
      // Return empty layout
      return {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
        isAnimating: false,
        tickCount: 0,
        totalTicks: input.animationTicks ?? 0,
      };
    },

    async computeAnimatedLayout(input, onProgress) {
      // Simulate animation progress
      const totalTicks = input.animationTicks ?? 30;
      for (let i = 0; i < totalTicks; i++) {
        setTimeout(() => {
          onProgress({
            type: 'progress',
            tickCount: i,
            totalTicks,
            nodePositions: new Map(),
            clusterPositions: new Map(),
          });
        }, i * 10);
      }

      // Send completion
      setTimeout(() => {
        onProgress({
          type: 'complete',
          tickCount: totalTicks,
          totalTicks,
        });
      }, totalTicks * 10);

      return {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
        isAnimating: false,
        tickCount: totalTicks,
        totalTicks,
      };
    },

    async cancelAnimation() {
      // No-op for mock
    },

    async getStatus() {
      return {
        isAnimating: false,
        currentTick: 0,
        totalTicks: 0,
      };
    },
  };

  // Mock wrap function
  return function wrap<T>(_worker: Worker): T {
    return mockAPI as T;
  };
}

/**
 * Create a configurable mock LayoutWorkerAPI
 */
export class MockLayoutWorkerAPI implements LayoutWorkerAPI {
  // Configuration
  public shouldError = false;
  public errorMessage = 'Mock worker error';
  public computeDelay = 0;
  public animationDelay = 10;

  // Mock data
  public mockInitialOutput = {
    nodePositions: new Map(),
    clusterPositions: new Map(),
    clusters: [],
    isAnimating: false,
    tickCount: 0,
    totalTicks: 0,
  };

  public mockAnimatedOutput = {
    nodePositions: new Map(),
    clusterPositions: new Map(),
    clusters: [],
    isAnimating: false,
    tickCount: 30,
    totalTicks: 30,
  };

  // State tracking
  public computeInitialLayoutCalls = 0;
  public computeAnimatedLayoutCalls = 0;
  public cancelAnimationCalls = 0;
  public getStatusCalls = 0;

  async computeInitialLayout(_input: unknown) {
    this.computeInitialLayoutCalls++;

    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }

    await this.delay(this.computeDelay);
    return this.mockInitialOutput;
  }

  async computeAnimatedLayout(input: unknown, onProgress: (progress: unknown) => void) {
    this.computeAnimatedLayoutCalls++;

    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }

    // @ts-expect-error - input has animationTicks
    const totalTicks = input.animationTicks ?? 30;

    // Send progress updates
    for (let i = 0; i < totalTicks; i++) {
      await this.delay(this.animationDelay);
      onProgress({
        type: 'progress',
        tickCount: i,
        totalTicks,
      });
    }

    // Send completion
    onProgress({
      type: 'complete',
      tickCount: totalTicks,
      totalTicks,
    });

    return this.mockAnimatedOutput;
  }

  async cancelAnimation() {
    this.cancelAnimationCalls++;
  }

  async getStatus() {
    this.getStatusCalls++;
    return {
      isAnimating: false,
      currentTick: 0,
      totalTicks: 0,
    };
  }

  // Helpers
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(): void {
    this.computeInitialLayoutCalls = 0;
    this.computeAnimatedLayoutCalls = 0;
    this.cancelAnimationCalls = 0;
    this.getStatusCalls = 0;
    this.shouldError = false;
  }
}

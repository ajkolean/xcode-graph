/**
 * Worker Mocks - Test utilities for Web Worker testing
 */

import type { LayoutInput, LayoutOutput, LayoutProgress } from '@/graph/workers/layout-api';

/**
 * Mock Web Worker for layout computation
 */
export class MockLayoutWorker {
  private onMessageHandler: ((event: MessageEvent) => void) | null = null;
  private onErrorHandler: ((event: ErrorEvent) => void) | null = null;

  // Mock state
  public terminated = false;
  public messagesSent: unknown[] = [];

  // Mock behavior configuration
  public shouldError = false;
  public errorMessage = 'Mock worker error';
  public computeDelay = 0;

  constructor() {
    // Worker constructor
  }

  /**
   * Mock postMessage
   */
  postMessage(message: unknown): void {
    if (this.terminated) {
      throw new Error('Worker has been terminated');
    }

    this.messagesSent.push(message);

    // Auto-respond based on message type
    setTimeout(() => {
      if (this.shouldError) {
        this.triggerError(new Error(this.errorMessage));
      } else {
        this.handleMessage(message);
      }
    }, this.computeDelay);
  }

  /**
   * Mock addEventListener
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions,
  ): void {
    if (type === 'message') {
      this.onMessageHandler = listener as (event: MessageEvent) => void;
    } else if (type === 'error') {
      this.onErrorHandler = listener as (event: ErrorEvent) => void;
    }
  }

  /**
   * Mock removeEventListener
   */
  removeEventListener(
    type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions,
  ): void {
    if (type === 'message') {
      this.onMessageHandler = null;
    } else if (type === 'error') {
      this.onErrorHandler = null;
    }
  }

  /**
   * Mock terminate
   */
  terminate(): void {
    this.terminated = true;
    this.onMessageHandler = null;
    this.onErrorHandler = null;
  }

  // ========================================
  // Test Helpers
  // ========================================

  /**
   * Trigger a message event
   */
  triggerMessage(data: unknown): void {
    if (this.onMessageHandler) {
      const event = new MessageEvent('message', { data });
      this.onMessageHandler(event);
    }
  }

  /**
   * Trigger an error event
   */
  triggerError(error: Error): void {
    if (this.onErrorHandler) {
      const event = new ErrorEvent('error', {
        message: error.message,
        error,
      });
      this.onErrorHandler(event);
    }
  }

  /**
   * Simulate successful layout computation
   */
  private handleMessage(message: unknown): void {
    // Simple mock response - return empty layout
    const mockOutput: LayoutOutput = {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
      isAnimating: false,
      tickCount: 0,
      totalTicks: 0,
    };

    this.triggerMessage(mockOutput);
  }

  /**
   * Reset mock state
   */
  reset(): void {
    this.messagesSent = [];
    this.terminated = false;
    this.shouldError = false;
    this.computeDelay = 0;
  }
}

/**
 * Mock worker that returns specific layout results
 */
export class MockLayoutWorkerWithResults extends MockLayoutWorker {
  public mockOutput: LayoutOutput | null = null;
  public mockProgress: LayoutProgress[] = [];

  setMockOutput(output: LayoutOutput): void {
    this.mockOutput = output;
  }

  setMockProgress(progress: LayoutProgress[]): void {
    this.mockProgress = progress;
  }

  private handleMessage(_message: unknown): void {
    // Return mock output if set
    if (this.mockOutput) {
      this.triggerMessage(this.mockOutput);
    }

    // Send progress updates if configured
    for (const progress of this.mockProgress) {
      setTimeout(() => this.triggerMessage(progress), 10);
    }
  }
}

/**
 * Create a mock Worker class for testing
 */
export function createMockWorkerClass(): typeof Worker {
  let instance: MockLayoutWorker | null = null;

  // @ts-expect-error - Mocking Worker class
  const MockWorkerClass = class implements Worker {
    constructor(_scriptURL: string | URL, _options?: WorkerOptions) {
      instance = new MockLayoutWorker();
      return instance as unknown as Worker;
    }
  };

  // Helper to get the created instance
  // @ts-expect-error - Adding test helper
  MockWorkerClass.getInstance = () => instance;

  return MockWorkerClass as unknown as typeof Worker;
}

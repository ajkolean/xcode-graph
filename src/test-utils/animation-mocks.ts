/**
 * Animation Mocks - Test utilities for animation/RAF testing
 */

/**
 * Mock for requestAnimationFrame with manual tick control
 */
export class MockAnimationFrame {
  private callbacks: Map<number, FrameRequestCallback> = new Map();
  private nextId = 1;
  private currentTime = 0;

  /**
   * Mock requestAnimationFrame - registers callback but doesn't execute
   */
  request(callback: FrameRequestCallback): number {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  }

  /**
   * Mock cancelAnimationFrame
   */
  cancel(id: number): void {
    this.callbacks.delete(id);
  }

  /**
   * Manually trigger one animation frame
   * @returns Number of callbacks executed
   */
  tick(deltaTime = 16): number {
    this.currentTime += deltaTime;
    const callbacks = Array.from(this.callbacks.entries());
    this.callbacks.clear();

    // Execute callbacks
    for (const [_id, callback] of callbacks) {
      callback(this.currentTime);
    }

    return callbacks.length;
  }

  /**
   * Trigger multiple animation frames
   */
  tickMultiple(count: number, deltaTime = 16): number {
    let totalExecuted = 0;
    for (let i = 0; i < count; i++) {
      totalExecuted += this.tick(deltaTime);
    }
    return totalExecuted;
  }

  /**
   * Check if animation is scheduled
   */
  hasPending(): boolean {
    return this.callbacks.size > 0;
  }

  /**
   * Get number of pending callbacks
   */
  pendingCount(): number {
    return this.callbacks.size;
  }

  /**
   * Clear all pending callbacks
   */
  clear(): void {
    this.callbacks.clear();
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Reset mock state
   */
  reset(): void {
    this.callbacks.clear();
    this.nextId = 1;
    this.currentTime = 0;
  }
}

/**
 * Install mock into global scope
 */
export function installAnimationFrameMock(): MockAnimationFrame {
  const mock = new MockAnimationFrame();

  globalThis.requestAnimationFrame = mock.request.bind(mock);
  globalThis.cancelAnimationFrame = mock.cancel.bind(mock);

  return mock;
}

/**
 * Restore original RAF functions
 */
export function uninstallAnimationFrameMock(): void {
  // Vitest should restore these automatically via vi.unstubAllGlobals()
  // But we can explicitly set to undefined if needed
}

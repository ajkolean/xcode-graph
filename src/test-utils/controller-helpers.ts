/**
 * Controller Test Helpers - Common utilities for testing Lit controllers
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Mock Reactive Controller Host for testing
 */
export class MockHost implements ReactiveControllerHost {
  private readonly controllers: ReactiveController[] = [];
  public updateCount = 0;
  public updates: Array<{ timestamp: number; reason?: string }> = [];

  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  requestUpdate(reason?: string): void {
    this.updateCount++;
    this.updates.push({
      timestamp: Date.now(),
      reason,
    });
  }

  connectedCallback(): void {
    for (const c of this.controllers) {
      c.hostConnected?.();
    }
  }

  disconnectedCallback(): void {
    for (const c of this.controllers) {
      c.hostDisconnected?.();
    }
  }

  /**
   * Reset update tracking
   */
  resetUpdateTracking(): void {
    this.updateCount = 0;
    this.updates = [];
  }

  /**
   * Get all controllers
   */
  getControllers(): ReactiveController[] {
    return [...this.controllers];
  }
}

/**
 * Create a standardized test context for controller testing
 */
export interface ControllerTestContext<T> {
  host: MockHost;
  controller: T;
}

/**
 * Create test context with host and controller
 */
export function createControllerTestContext<T>(
  controllerFactory: (host: MockHost) => T,
): ControllerTestContext<T> {
  const host = new MockHost();
  const controller = controllerFactory(host);
  return { host, controller };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  options: {
    timeout?: number;
    interval?: number;
  } = {},
): Promise<void> {
  const { timeout = 1000, interval = 10 } = options;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('waitFor timeout'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

/**
 * Wait for specific number of updates
 */
export async function waitForUpdates(host: MockHost, count: number, timeout = 1000): Promise<void> {
  const initialCount = host.updateCount;
  return waitFor(() => host.updateCount >= initialCount + count, { timeout });
}

/**
 * Wait for next update
 */
export async function waitForNextUpdate(host: MockHost, timeout = 1000): Promise<void> {
  return waitForUpdates(host, 1, timeout);
}

/**
 * Animation Test Helpers - Utilities for testing animation behavior
 */

import type { AnimationController } from '@/graph/controllers/animation.controller';

/**
 * Wait for animation to complete
 * Polls the animation controller until isActive is false
 */
export async function waitForAnimationComplete(
  controller: AnimationController,
  options: {
    timeout?: number;
    interval?: number;
  } = {},
): Promise<void> {
  const { timeout = 5000, interval = 16 } = options;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (!controller.isActive) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Animation did not complete within timeout'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

/**
 * Wait for animation to reach specific tick
 */
export async function waitForAnimationTick(
  controller: AnimationController,
  targetTick: number,
  timeout = 5000,
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (controller.currentTick >= targetTick) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Animation did not reach tick ${targetTick} within timeout`));
      } else {
        setTimeout(check, 16);
      }
    };
    check();
  });
}

/**
 * Wait for animation progress (0-1)
 */
export async function waitForAnimationProgress(
  controller: AnimationController,
  targetProgress: number,
  timeout = 5000,
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (controller.progress >= targetProgress) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Animation did not reach progress ${targetProgress} within timeout`));
      } else {
        setTimeout(check, 16);
      }
    };
    check();
  });
}

/**
 * Track animation callbacks
 */
export class AnimationCallbackTracker {
  public tickCallbacks: Array<{ tickCount: number; alpha: number }> = [];
  public completeCallbacks = 0;

  onTick = (tickCount: number, alpha: number) => {
    this.tickCallbacks.push({ tickCount, alpha });
  };

  onComplete = () => {
    this.completeCallbacks++;
  };

  reset(): void {
    this.tickCallbacks = [];
    this.completeCallbacks = 0;
  }

  getTotalTicks(): number {
    return this.tickCallbacks.length;
  }

  getAlphaValues(): number[] {
    return this.tickCallbacks.map((cb) => cb.alpha);
  }

  wasCompleted(): boolean {
    return this.completeCallbacks > 0;
  }
}

/**
 * Simulate animation frames
 * Manually trigger RAF callbacks
 */
export async function simulateAnimationFrames(
  count: number,
  callback: () => void,
  frameDelay = 16,
): Promise<void> {
  for (let i = 0; i < count; i++) {
    callback();
    await new Promise((resolve) => setTimeout(resolve, frameDelay));
  }
}

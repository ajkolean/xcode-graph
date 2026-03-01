import { type AnimatedValue, tickAnimationMap } from '@graph/utils/canvas-animation';

export interface AnimationLoopCallbacks {
  onRender(): void;
  shouldAnimate(): boolean;
  isVisible(): boolean;
}

/**
 * Manages the requestAnimationFrame render loop for canvas rendering.
 * Handles RAF scheduling, animation state tracking, and alpha transitions.
 */
export class AnimationLoopController {
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  time = 0;
  isAnimating = false;
  nodeAlphaMap: Map<string, AnimatedValue> = new Map<string, AnimatedValue>();

  constructor(private callbacks: AnimationLoopCallbacks) {}

  requestRender(): void {
    if (!this.callbacks.isVisible()) return;
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private renderLoop = (timestamp: number): void => {
    this.animationFrameId = null;
    const dt = this.lastFrameTime > 0 ? timestamp - this.lastFrameTime : 16;
    this.lastFrameTime = timestamp;
    this.time = timestamp;

    // Tick opacity transition animations
    const alphaAnimating = tickAnimationMap(this.nodeAlphaMap, dt);
    if (alphaAnimating && !this.isAnimating) {
      this.isAnimating = true;
    }

    this.callbacks.onRender();

    if (this.isAnimating) {
      // Re-check: if only alpha was animating and it settled, stop
      if (!alphaAnimating) {
        this.isAnimating = this.callbacks.shouldAnimate();
      }
      if (this.isAnimating) {
        this.animationFrameId = requestAnimationFrame(this.renderLoop);
      }
    }
  };
}

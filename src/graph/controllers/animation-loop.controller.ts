/**
 * Animation Loop Controller - Frame-skip canvas optimization
 *
 * Manages a requestAnimationFrame-based render loop with dirty-flag
 * optimization to avoid redundant canvas redraws. The controller only
 * invokes the render callback when:
 *
 * 1. The dirty flag is set (via `requestRender()`) indicating state changed
 * 2. An active animation is running (via `shouldAnimate()` callback)
 *
 * When neither condition is true, the render callback is skipped, saving
 * GPU/CPU time on idle frames.
 *
 * ## Usage with Lit Components
 *
 * ```ts
 * class MyCanvas extends LitElement {
 *   private loop = new AnimationLoopController(this, {
 *     onRender: (timestamp, dt) => this.renderCanvas(timestamp, dt),
 *     shouldAnimate: () => this.isAnimating,
 *   });
 *
 *   handleMouseMove(e) {
 *     // State changed, request a render
 *     this.loop.requestRender();
 *   }
 * }
 * ```
 *
 * @module controllers/animation-loop
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Render callback invoked each frame when rendering is needed.
 *
 * @param timestamp - The current `requestAnimationFrame` timestamp (ms)
 * @param dt - Delta time since last frame (ms), defaults to 16 on first frame
 */
export type RenderCallback = (timestamp: number, dt: number) => void;

/**
 * Configuration for the animation loop controller
 */
export interface AnimationLoopConfig {
  /**
   * Callback invoked each frame when a render is needed.
   * Receives the current timestamp and delta time since last frame.
   */
  onRender: RenderCallback;

  /**
   * Returns true when time-dependent animations are active
   * (e.g., physics simulation, opacity transitions, fade-outs).
   * When true, the loop always renders regardless of the dirty flag.
   */
  shouldAnimate: () => boolean;

  /**
   * Optional visibility check. When provided and returning false,
   * the loop will not schedule frames (e.g., element off-screen).
   */
  isVisible?: (() => boolean) | undefined;
}

/**
 * Reactive controller for frame-skip optimized canvas rendering.
 *
 * Uses a dirty-flag pattern to skip redundant renders:
 * - `requestRender()` sets the dirty flag, ensuring the next frame renders
 * - When `shouldAnimate()` returns true, every frame renders (active animation)
 * - When neither dirty nor animating, the render callback is skipped
 * - After rendering, the dirty flag resets to false
 */
export class AnimationLoopController implements ReactiveController {
  private readonly config: AnimationLoopConfig;

  // Frame state
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private _dirty = false;
  private _running = false;

  // Metrics (useful for debugging/testing)
  private _framesRendered = 0;
  private _framesSkipped = 0;

  constructor(host: ReactiveControllerHost, config: AnimationLoopConfig) {
    this.config = config;
    host.addController(this);
  }

  /**
   * Mark the canvas as needing a redraw on the next frame.
   * Call this after any state change that affects what's drawn
   * (hover, select, pan, zoom, resize, data change, etc.).
   *
   * If the loop is not currently running, this also starts it.
   */
  requestRender(): void {
    this._dirty = true;
    this.ensureRunning();
  }

  /**
   * Whether the dirty flag is currently set
   */
  get dirty(): boolean {
    return this._dirty;
  }

  /**
   * Whether the animation loop is currently running
   */
  get running(): boolean {
    return this._running;
  }

  /**
   * Total frames where `onRender` was called
   */
  get framesRendered(): number {
    return this._framesRendered;
  }

  /**
   * Total frames where `onRender` was skipped (not dirty, not animating)
   */
  get framesSkipped(): number {
    return this._framesSkipped;
  }

  /**
   * Stop the animation loop and cancel any pending frame
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this._running = false;
  }

  /**
   * Reset frame metrics (for testing/debugging)
   */
  resetMetrics(): void {
    this._framesRendered = 0;
    this._framesSkipped = 0;
  }

  /**
   * Ensure the RAF loop is scheduled if not already running
   */
  private ensureRunning(): void {
    if (this.config.isVisible?.() === false) return;
    if (this.animationFrameId === null) {
      this._running = true;
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  /**
   * The core animation loop. Decides whether to render or skip each frame.
   */
  private loop = (timestamp: number): void => {
    this.animationFrameId = null;

    const dt = this.lastFrameTime > 0 ? timestamp - this.lastFrameTime : 16;
    this.lastFrameTime = timestamp;

    const animating = this.config.shouldAnimate();
    const needsRender = this._dirty || animating;

    if (needsRender) {
      this._dirty = false;
      this._framesRendered++;
      this.config.onRender(timestamp, dt);
    } else {
      this._framesSkipped++;
    }

    // Continue the loop if animating or still dirty (onRender may have
    // set dirty again via requestRender)
    if (animating || this._dirty) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this._running = false;
    }
  };

  hostConnected(): void {
    // skipcq: JS-0105
    // Controller is passive until requestRender() is called
  }

  hostDisconnected(): void {
    this.stop();
    this._dirty = false;
    this.lastFrameTime = 0;
  }
}

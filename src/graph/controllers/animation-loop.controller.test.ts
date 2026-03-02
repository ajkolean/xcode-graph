/**
 * Tests for AnimationLoopController
 * Validates frame-skip optimization logic
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installAnimationFrameMock, type MockAnimationFrame, MockHost } from '@/test-utils';
import { AnimationLoopController, type RenderCallback } from './animation-loop.controller';

describe('AnimationLoopController', () => {
  let host: MockHost;
  let renderSpy: ReturnType<typeof vi.fn<RenderCallback>>;
  let shouldAnimate: ReturnType<typeof vi.fn<() => boolean>>;
  let mockRaf: MockAnimationFrame;
  let originalRaf: typeof globalThis.requestAnimationFrame;
  let originalCaf: typeof globalThis.cancelAnimationFrame;

  beforeEach(() => {
    host = new MockHost();
    renderSpy = vi.fn<RenderCallback>();
    shouldAnimate = vi.fn<() => boolean>().mockReturnValue(false);

    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    mockRaf = installAnimationFrameMock();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  function createController(
    overrides: Partial<{
      onRender: typeof renderSpy;
      shouldAnimate: typeof shouldAnimate;
      isVisible: () => boolean;
    }> = {},
  ): AnimationLoopController {
    return new AnimationLoopController(host, {
      onRender: overrides.onRender ?? renderSpy,
      shouldAnimate: overrides.shouldAnimate ?? shouldAnimate,
      isVisible: overrides.isVisible,
    });
  }

  describe('Initialization', () => {
    it('should create controller', () => {
      const controller = createController();
      expect(controller).toBeDefined();
    });

    it('should register with host', () => {
      const controller = createController();
      expect(host.getControllers()).toContain(controller);
    });

    it('should start with clean state', () => {
      const controller = createController();
      expect(controller.dirty).toBe(false);
      expect(controller.running).toBe(false);
      expect(controller.framesRendered).toBe(0);
      expect(controller.framesSkipped).toBe(0);
    });
  });

  describe('Frame-skip optimization', () => {
    it('skips render when nothing changed', () => {
      const controller = createController();

      // Start the loop by requesting a render, then consume that frame
      controller.requestRender();
      mockRaf.tick();

      // Now dirty is false and shouldAnimate returns false.
      // The loop should have stopped because there is nothing to do.
      expect(controller.running).toBe(false);

      // Manually re-start without dirtying to prove the skip
      // (simulate an external RAF cycle where nothing changed)
      shouldAnimate.mockReturnValue(false);
      controller.requestRender();
      renderSpy.mockClear();
      // dirty is now true, tick consumes it
      mockRaf.tick();
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Next tick: nothing changed, loop has stopped
      renderSpy.mockClear();
      const executed = mockRaf.tick();
      expect(executed).toBe(0); // no pending callback
      expect(renderSpy).not.toHaveBeenCalled();
      expect(controller.framesSkipped).toBe(0); // loop never ran, so no skip counted
    });

    it('renders when explicitly requested', () => {
      const controller = createController();

      controller.requestRender();
      expect(controller.dirty).toBe(true);

      mockRaf.tick();

      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(controller.dirty).toBe(false);
      expect(controller.framesRendered).toBe(1);
    });

    it('always renders during active animation', () => {
      shouldAnimate.mockReturnValue(true);
      const controller = createController();

      // Start the loop
      controller.requestRender();

      // Tick multiple frames without calling requestRender again
      mockRaf.tick(); // frame 1: dirty + animating
      mockRaf.tick(); // frame 2: not dirty, but animating
      mockRaf.tick(); // frame 3: not dirty, but animating

      expect(renderSpy).toHaveBeenCalledTimes(3);
      expect(controller.framesRendered).toBe(3);
      expect(controller.framesSkipped).toBe(0);
    });

    it('stops loop when not dirty and not animating', () => {
      const controller = createController();

      controller.requestRender();
      mockRaf.tick();

      // After render, dirty is false and shouldAnimate is false
      expect(controller.running).toBe(false);
      expect(mockRaf.hasPending()).toBe(false);
    });

    it('continues loop while animating even without dirty flag', () => {
      shouldAnimate.mockReturnValue(true);
      const controller = createController();

      controller.requestRender();
      mockRaf.tick();

      // Loop should still be running because shouldAnimate is true
      expect(mockRaf.hasPending()).toBe(true);

      // Stop animation
      shouldAnimate.mockReturnValue(false);
      mockRaf.tick();

      // Now it should stop
      expect(controller.running).toBe(false);
      expect(mockRaf.hasPending()).toBe(false);
    });

    it('skips render but continues loop when animating transitions to idle mid-frame', () => {
      shouldAnimate.mockReturnValue(true);
      const controller = createController();

      controller.requestRender();
      mockRaf.tick(); // renders (dirty + animating)
      renderSpy.mockClear();

      // Animation still active on next check
      mockRaf.tick(); // renders (animating)
      expect(renderSpy).toHaveBeenCalledTimes(1);
      renderSpy.mockClear();

      // Now animation stops
      shouldAnimate.mockReturnValue(false);
      mockRaf.tick(); // no dirty, no animation => skip
      expect(renderSpy).not.toHaveBeenCalled();
      expect(controller.framesSkipped).toBe(1);
    });
  });

  describe('requestRender', () => {
    it('sets dirty flag', () => {
      const controller = createController();
      expect(controller.dirty).toBe(false);

      controller.requestRender();
      expect(controller.dirty).toBe(true);
    });

    it('starts the loop if not running', () => {
      const controller = createController();
      expect(controller.running).toBe(false);

      controller.requestRender();
      expect(controller.running).toBe(true);
      expect(mockRaf.hasPending()).toBe(true);
    });

    it('does not schedule duplicate frames', () => {
      const controller = createController();

      controller.requestRender();
      controller.requestRender();
      controller.requestRender();

      expect(mockRaf.pendingCount()).toBe(1);
    });

    it('resets dirty flag after render', () => {
      const controller = createController();

      controller.requestRender();
      expect(controller.dirty).toBe(true);

      mockRaf.tick();
      expect(controller.dirty).toBe(false);
    });
  });

  describe('Render callback arguments', () => {
    it('passes timestamp and delta time to onRender', () => {
      const controller = createController();

      controller.requestRender();
      mockRaf.tick(100); // first frame at t=100

      expect(renderSpy).toHaveBeenCalledWith(100, 16); // default dt for first frame

      controller.requestRender();
      mockRaf.tick(16); // next frame at t=116, dt=16

      expect(renderSpy).toHaveBeenCalledWith(116, 16);
    });
  });

  describe('Visibility', () => {
    it('does not schedule frames when not visible', () => {
      const controller = createController({
        isVisible: () => false,
      });

      controller.requestRender();

      // dirty is set, but no frame scheduled
      expect(controller.dirty).toBe(true);
      expect(mockRaf.hasPending()).toBe(false);
      expect(controller.running).toBe(false);
    });

    it('schedules frames when visible', () => {
      const controller = createController({
        isVisible: () => true,
      });

      controller.requestRender();

      expect(mockRaf.hasPending()).toBe(true);
      expect(controller.running).toBe(true);
    });
  });

  describe('stop', () => {
    it('cancels pending animation frame', () => {
      const controller = createController();

      controller.requestRender();
      expect(mockRaf.hasPending()).toBe(true);

      controller.stop();

      // MockAnimationFrame.cancel was called
      expect(controller.running).toBe(false);
    });

    it('can be restarted after stop', () => {
      const controller = createController();

      controller.requestRender();
      controller.stop();

      controller.requestRender();
      expect(controller.running).toBe(true);
      expect(mockRaf.hasPending()).toBe(true);

      mockRaf.tick();
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('stops loop on hostDisconnected', () => {
      const controller = createController();

      shouldAnimate.mockReturnValue(true);
      controller.requestRender();
      mockRaf.tick();

      expect(controller.running).toBe(true);

      host.disconnectedCallback();

      expect(controller.running).toBe(false);
      expect(controller.dirty).toBe(false);
    });

    it('hostConnected does not auto-start', () => {
      createController();

      host.connectedCallback();

      expect(mockRaf.hasPending()).toBe(false);
    });
  });

  describe('Metrics', () => {
    it('tracks rendered and skipped frames', () => {
      shouldAnimate.mockReturnValue(true);
      const controller = createController();

      controller.requestRender();
      mockRaf.tick(); // renders (dirty + animating)
      mockRaf.tick(); // renders (animating)

      shouldAnimate.mockReturnValue(false);
      mockRaf.tick(); // skips (not dirty, not animating)

      expect(controller.framesRendered).toBe(2);
      expect(controller.framesSkipped).toBe(1);
    });

    it('resets metrics', () => {
      const controller = createController();

      controller.requestRender();
      mockRaf.tick();

      expect(controller.framesRendered).toBe(1);

      controller.resetMetrics();

      expect(controller.framesRendered).toBe(0);
      expect(controller.framesSkipped).toBe(0);
    });
  });
});

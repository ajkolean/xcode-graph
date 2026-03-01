import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimationLoopController } from './animation-loop.controller';

describe('AnimationLoopController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('schedules RAF when requestRender is called and visible', () => {
    const onRender = vi.fn();
    const controller = new AnimationLoopController({
      onRender,
      shouldAnimate: () => false,
      isVisible: () => true,
    });

    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    controller.requestRender();

    expect(rafSpy).toHaveBeenCalledOnce();
    rafSpy.mockRestore();
  });

  it('does not schedule RAF when not visible', () => {
    const onRender = vi.fn();
    const controller = new AnimationLoopController({
      onRender,
      shouldAnimate: () => false,
      isVisible: () => false,
    });

    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    controller.requestRender();

    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });

  it('cancels RAF on stop', () => {
    const controller = new AnimationLoopController({
      onRender: () => {},
      shouldAnimate: () => false,
      isVisible: () => true,
    });

    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    controller.requestRender();
    controller.stop();

    expect(cancelSpy).toHaveBeenCalledWith(42);
    cancelSpy.mockRestore();
  });

  it('initializes with time=0 and isAnimating=false', () => {
    const controller = new AnimationLoopController({
      onRender: () => {},
      shouldAnimate: () => false,
      isVisible: () => true,
    });

    expect(controller.time).toBe(0);
    expect(controller.isAnimating).toBe(false);
    expect(controller.nodeAlphaMap.size).toBe(0);
  });

  it('does not schedule duplicate RAFs', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    const controller = new AnimationLoopController({
      onRender: () => {},
      shouldAnimate: () => false,
      isVisible: () => true,
    });

    controller.requestRender();
    controller.requestRender();
    controller.requestRender();

    // Only one RAF should be scheduled (spy counts only calls from this test)
    const callCount = rafSpy.mock.calls.length;
    expect(callCount).toBe(1);
    rafSpy.mockRestore();
  });
});

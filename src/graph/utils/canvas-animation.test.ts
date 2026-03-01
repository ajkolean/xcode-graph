import { describe, expect, it } from 'vitest';
import {
  type AnimatedValue,
  getAnimatedAlpha,
  setAnimatedTarget,
  tickAnimation,
  tickAnimationMap,
} from './canvas-animation';

function createAnimatedValue(overrides: Partial<AnimatedValue> = {}): AnimatedValue {
  return { current: 1.0, target: 0.3, start: 1.0, progress: 0, ...overrides };
}

describe('canvas-animation', () => {
  describe('tickAnimation', () => {
    it('advances progress toward target', () => {
      const value = createAnimatedValue();
      const animating = tickAnimation(value, 100);
      expect(animating).toBe(true);
      expect(value.progress).toBeGreaterThan(0);
      expect(value.current).toBeLessThan(1.0);
    });

    it('returns false when progress is already at 1', () => {
      const value = createAnimatedValue({ progress: 1 });
      expect(tickAnimation(value, 16)).toBe(false);
    });

    it('settles to target when progress reaches 1', () => {
      const value = createAnimatedValue();
      tickAnimation(value, 300);
      expect(value.current).toBe(0.3);
      expect(tickAnimation(value, 16)).toBe(false);
    });

    it('uses custom duration', () => {
      const value = createAnimatedValue();
      tickAnimation(value, 50, 100);
      expect(value.progress).toBeCloseTo(0.5, 1);
    });
  });

  describe('tickAnimationMap', () => {
    it('ticks all values and returns true if any animating', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue());
      map.set('b', createAnimatedValue({ target: 0.5 }));
      expect(tickAnimationMap(map, 100)).toBe(true);
    });

    it('removes entries settled at 1.0', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ target: 1.0, progress: 0.9 }));
      tickAnimationMap(map, 100);
      expect(map.has('a')).toBe(false);
    });

    it('keeps entries not settled at 1.0', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ target: 0.3, progress: 0.9 }));
      tickAnimationMap(map, 100);
      expect(map.has('a')).toBe(true);
    });

    it('returns false when all settled', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ target: 1.0, progress: 1 }));
      expect(tickAnimationMap(map, 16)).toBe(false);
    });
  });

  describe('getAnimatedAlpha', () => {
    it('returns current value when entry exists', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ current: 0.5 }));
      expect(getAnimatedAlpha(map, 'a')).toBe(0.5);
    });

    it('returns 1.0 when entry does not exist', () => {
      const map = new Map<string, AnimatedValue>();
      expect(getAnimatedAlpha(map, 'missing')).toBe(1.0);
    });
  });

  describe('setAnimatedTarget', () => {
    it('creates entry when target differs from 1.0', () => {
      const map = new Map<string, AnimatedValue>();
      setAnimatedTarget(map, 'a', 0.3);
      expect(map.has('a')).toBe(true);
      expect(map.get('a')?.target).toBe(0.3);
    });

    it('does not create entry when target is 1.0', () => {
      const map = new Map<string, AnimatedValue>();
      setAnimatedTarget(map, 'a', 1.0);
      expect(map.has('a')).toBe(false);
    });

    it('updates existing entry when target changes', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ current: 0.5, target: 0.3 }));
      setAnimatedTarget(map, 'a', 0.8);
      const entry = map.get('a') as AnimatedValue;
      expect(entry.target).toBe(0.8);
      expect(entry.start).toBe(0.5);
      expect(entry.progress).toBe(0);
    });

    it('does not reset progress when target is same', () => {
      const map = new Map<string, AnimatedValue>();
      map.set('a', createAnimatedValue({ progress: 0.5, target: 0.3 }));
      setAnimatedTarget(map, 'a', 0.3);
      expect(map.get('a')?.progress).toBe(0.5);
    });
  });
});

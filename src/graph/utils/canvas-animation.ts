/**
 * Lightweight animation utilities for smooth canvas state transitions.
 *
 * AnimatedValue interpolates between start and target values using d3-ease
 * easing functions for natural-feeling motion. Used primarily for opacity
 * transitions on selection/deselection.
 */

import { easeQuadInOut } from 'd3-ease';

export interface AnimatedValue {
  current: number;
  target: number;
  /** Value when the current animation started */
  start: number;
  /** Normalized progress 0-1 of the current animation */
  progress: number;
}

/** Default animation duration in milliseconds */
const ANIMATION_DURATION_MS = 250;

/**
 * Advance an animated value toward its target using eased interpolation.
 * @returns true if the value is still animating (hasn't settled).
 */
export function tickAnimation(
  value: AnimatedValue,
  dt: number,
  durationMs = ANIMATION_DURATION_MS,
): boolean {
  if (value.progress >= 1) {
    return false;
  }

  value.progress = Math.min(1, value.progress + dt / durationMs);
  const easedT = easeQuadInOut(value.progress);
  value.current = value.start + (value.target - value.start) * easedT;

  if (value.progress >= 1) {
    value.current = value.target;
    return false;
  }

  return true;
}

/**
 * Tick all animated values in a map. Removes entries that have settled at 1.0
 * (the default/rest state) to avoid unbounded map growth.
 * @returns true if any values are still animating.
 */
export function tickAnimationMap(map: Map<string, AnimatedValue>, dt: number): boolean {
  let anyAnimating = false;
  for (const [key, value] of map) {
    const still = tickAnimation(value, dt);
    if (still) {
      anyAnimating = true;
    } else if (value.current === 1.0) {
      // Settled at rest state — remove to keep map lean
      map.delete(key);
    }
  }
  return anyAnimating;
}

/**
 * Get the animated alpha multiplier for a node. Returns 1.0 if no entry exists.
 */
export function getAnimatedAlpha(map: Map<string, AnimatedValue>, key: string): number {
  return map.get(key)?.current ?? 1.0;
}

/**
 * Set the target alpha for a key, creating the entry if needed.
 * Resets progress and captures the current value as the new start.
 */
export function setAnimatedTarget(
  map: Map<string, AnimatedValue>,
  key: string,
  target: number,
): void {
  const existing = map.get(key);
  if (existing) {
    if (existing.target !== target) {
      existing.start = existing.current;
      existing.target = target;
      existing.progress = 0;
    }
  } else {
    // Only create an entry if the target differs from default (1.0)
    if (target !== 1.0) {
      map.set(key, { current: 1.0, target, start: 1.0, progress: 0 });
    }
  }
}

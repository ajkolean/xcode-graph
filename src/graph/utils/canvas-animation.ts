/**
 * Lightweight animation utilities for smooth canvas state transitions.
 *
 * AnimatedValue lerps between current and target values at a configurable speed.
 * Used primarily for opacity transitions on selection/deselection.
 */

export interface AnimatedValue {
  current: number;
  target: number;
}

/**
 * Advance an animated value toward its target.
 * @returns true if the value is still animating (hasn't settled).
 */
export function tickAnimation(value: AnimatedValue, dt: number, speed = 8): boolean {
  value.current += (value.target - value.current) * Math.min(1, (speed * dt) / 1000);
  if (Math.abs(value.current - value.target) < 0.01) {
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
 * Starts the current value at the existing animated value (or 1.0 if new).
 */
export function setAnimatedTarget(
  map: Map<string, AnimatedValue>,
  key: string,
  target: number,
): void {
  const existing = map.get(key);
  if (existing) {
    existing.target = target;
  } else {
    // Only create an entry if the target differs from default (1.0)
    if (target !== 1.0) {
      map.set(key, { current: 1.0, target });
    }
  }
}

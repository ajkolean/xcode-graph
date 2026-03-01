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
export declare function tickAnimation(value: AnimatedValue, dt: number, speed?: number): boolean;
/**
 * Tick all animated values in a map. Removes entries that have settled at 1.0
 * (the default/rest state) to avoid unbounded map growth.
 * @returns true if any values are still animating.
 */
export declare function tickAnimationMap(map: Map<string, AnimatedValue>, dt: number): boolean;
/**
 * Get the animated alpha multiplier for a node. Returns 1.0 if no entry exists.
 */
export declare function getAnimatedAlpha(map: Map<string, AnimatedValue>, key: string): number;
/**
 * Set the target alpha for a key, creating the entry if needed.
 * Starts the current value at the existing animated value (or 1.0 if new).
 */
export declare function setAnimatedTarget(map: Map<string, AnimatedValue>, key: string, target: number): void;
//# sourceMappingURL=canvas-animation.d.ts.map
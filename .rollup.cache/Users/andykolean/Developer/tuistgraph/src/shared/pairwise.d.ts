/**
 * Generates all unique unordered pairs from an array.
 *
 * @example
 * for (const [a, b] of pairwise([1, 2, 3])) {
 *   // [1,2], [1,3], [2,3]
 * }
 */
export declare function pairwise<T>(items: T[]): Generator<readonly [T, T], void, unknown>;
/**
 * Generates consecutive adjacent pairs from an array.
 *
 * @example
 * for (const [prev, next] of adjacentPairs([1, 2, 3])) {
 *   // [1,2], [2,3]
 * }
 */
export declare function adjacentPairs<T>(items: T[]): Array<readonly [T, T]>;
//# sourceMappingURL=pairwise.d.ts.map
/**
 * Generate all unique unordered pairs (combinations of 2) from an array.
 *
 * Yields C(n, 2) = n*(n-1)/2 pairs. Skips undefined entries.
 *
 * @param items - Source array to pair from
 * @returns Generator yielding `[a, b]` tuples where `a` precedes `b` in the original array
 *
 * @example
 * ```ts
 * for (const [a, b] of pairwise([1, 2, 3])) {
 *   // [1,2], [1,3], [2,3]
 * }
 * ```
 */
export function* pairwise<T>(items: T[]): Generator<readonly [T, T], void, unknown> {
  // skipcq: JS-C1002
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      if (b === undefined) continue;
      yield [a, b] as const;
    }
  }
}

/**
 * Generate consecutive adjacent pairs (sliding window of size 2) from an array.
 *
 * For an array of length `n`, returns `n - 1` pairs. Skips undefined entries.
 *
 * @param items - Source array
 * @returns Array of `[prev, next]` tuples for each consecutive pair
 *
 * @example
 * ```ts
 * adjacentPairs([1, 2, 3]);
 * // => [[1, 2], [2, 3]]
 * ```
 */
export function adjacentPairs<T>(items: T[]): Array<readonly [T, T]> {
  const pairs: Array<readonly [T, T]> = [];
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];
    if (prev === undefined || curr === undefined) continue;
    pairs.push([prev, curr] as const);
  }
  return pairs;
}

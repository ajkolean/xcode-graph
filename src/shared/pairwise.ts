/**
 * Generates all unique unordered pairs from an array.
 *
 * @example
 * for (const [a, b] of pairwise([1, 2, 3])) {
 *   // [1,2], [1,3], [2,3]
 * }
 */
export function* pairwise<T>(items: T[]): Generator<readonly [T, T], void, unknown> {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      yield [items[i]!, items[j]!] as const;
    }
  }
}

/**
 * Generates consecutive adjacent pairs from an array.
 *
 * @example
 * for (const [prev, next] of adjacentPairs([1, 2, 3])) {
 *   // [1,2], [2,3]
 * }
 */
export function adjacentPairs<T>(items: T[]): Array<readonly [T, T]> {
  const pairs: Array<readonly [T, T]> = [];
  for (let i = 1; i < items.length; i++) {
    pairs.push([items[i - 1]!, items[i]!] as const);
  }
  return pairs;
}

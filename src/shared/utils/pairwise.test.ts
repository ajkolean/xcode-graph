/**
 * Pairwise utility tests - branch coverage for undefined guards
 */

import { describe, expect, it } from 'vitest';
import { adjacentPairs, pairwise } from './pairwise';

describe('pairwise', () => {
  it('yields all unique unordered pairs', () => {
    const result = [...pairwise([1, 2, 3])];
    expect(result).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
  });

  it('returns empty for single item', () => {
    expect([...pairwise([1])]).toEqual([]);
  });

  it('returns empty for empty array', () => {
    expect([...pairwise([])]).toEqual([]);
  });

  it('skips undefined entries in outer loop', () => {
    const sparse = [1, undefined, 3] as unknown as number[];
    const result = [...pairwise(sparse)];
    // 1 pairs with undefined (skipped) and 3; undefined skipped as outer
    expect(result).toEqual([[1, 3]]);
  });

  it('skips undefined entries in inner loop', () => {
    const sparse = [1, 2, undefined] as unknown as number[];
    const result = [...pairwise(sparse)];
    expect(result).toEqual([[1, 2]]);
  });
});

describe('adjacentPairs', () => {
  it('returns consecutive pairs', () => {
    expect(adjacentPairs([1, 2, 3])).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });

  it('returns empty for single item', () => {
    expect(adjacentPairs([1])).toEqual([]);
  });

  it('returns empty for empty array', () => {
    expect(adjacentPairs([])).toEqual([]);
  });

  it('skips pairs with undefined prev or curr', () => {
    const sparse = [1, undefined, 3] as unknown as number[];
    const result = adjacentPairs(sparse);
    // [1, undefined] skipped, [undefined, 3] skipped
    expect(result).toEqual([]);
  });
});

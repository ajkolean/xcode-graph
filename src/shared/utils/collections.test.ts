/**
 * Collections utility tests - branch coverage
 */

import { describe, expect, it } from 'vitest';
import { addToMultiMap, getOrDefault, range, resolveDefaults, times } from './collections';

describe('range', () => {
  it('generates 0 to n-1', () => {
    expect(range(3)).toEqual([0, 1, 2]);
  });

  it('returns empty for 0', () => {
    expect(range(0)).toEqual([]);
  });
});

describe('times', () => {
  it('invokes callback n times', () => {
    const result = times(3, (i) => i * 2);
    expect(result).toEqual([0, 2, 4]);
  });

  it('returns empty for 0', () => {
    expect(times(0, (i) => i)).toEqual([]);
  });
});

describe('addToMultiMap', () => {
  it('creates new array for first value', () => {
    const map = new Map<string, number[]>();
    addToMultiMap(map, 'a', 1);
    expect(map.get('a')).toEqual([1]);
  });

  it('appends to existing array', () => {
    const map = new Map<string, number[]>();
    addToMultiMap(map, 'a', 1);
    addToMultiMap(map, 'a', 2);
    expect(map.get('a')).toEqual([1, 2]);
  });
});

describe('getOrDefault', () => {
  it('returns value when key exists', () => {
    const map = new Map([['a', 1]]);
    expect(getOrDefault(map, 'a', 99)).toBe(1);
  });

  it('returns default when key missing', () => {
    const map = new Map<string, number>();
    expect(getOrDefault(map, 'missing', 42)).toBe(42);
  });
});

describe('resolveDefaults', () => {
  it('uses source values when present', () => {
    const source = { x: 10, y: 20 };
    const defaults = { x: 0, y: 0 };
    expect(resolveDefaults(source, defaults)).toEqual({ x: 10, y: 20 });
  });

  it('falls back to defaults for null/undefined', () => {
    const source = { x: null, y: undefined } as unknown as { x: number; y: number };
    const defaults = { x: 5, y: 10 };
    expect(resolveDefaults(source, defaults)).toEqual({ x: 5, y: 10 });
  });

  it('mixes source and defaults', () => {
    const source = { x: 42, y: null } as unknown as { x: number; y: number };
    const defaults = { x: 0, y: 99 };
    expect(resolveDefaults(source, defaults)).toEqual({ x: 42, y: 99 });
  });
});

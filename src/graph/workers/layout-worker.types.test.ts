import { describe, expect, it } from 'vitest';
import { deserializeMap, serializeMap } from './layout-worker.types';

describe('serializeMap', () => {
  it('converts a Map to an array of entries', () => {
    const map = new Map<string, number>([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    const result = serializeMap(map);

    expect(result).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
  });

  it('returns empty array for empty Map', () => {
    const result = serializeMap(new Map());
    expect(result).toEqual([]);
  });
});

describe('deserializeMap', () => {
  it('converts an array of entries back to a Map', () => {
    const entries: Array<[string, number]> = [
      ['x', 10],
      ['y', 20],
    ];

    const result = deserializeMap(entries);

    expect(result).toBeInstanceOf(Map);
    expect(result.get('x')).toBe(10);
    expect(result.get('y')).toBe(20);
    expect(result.size).toBe(2);
  });

  it('returns empty Map for empty array', () => {
    const result = deserializeMap([]);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('round-trips serialize then deserialize', () => {
    const original = new Map<string, { value: number }>([
      ['key1', { value: 42 }],
      ['key2', { value: 99 }],
    ]);

    const serialized = serializeMap(original);
    const restored = deserializeMap(serialized);

    expect(restored.size).toBe(original.size);
    expect(restored.get('key1')).toEqual({ value: 42 });
    expect(restored.get('key2')).toEqual({ value: 99 });
  });
});

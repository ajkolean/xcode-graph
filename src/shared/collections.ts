/**
 * Collection utility functions
 */

/**
 * Generate numbers from 0 to n-1.
 */
export function range(n: number): number[] {
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    out[i] = i;
  }
  return out;
}

/**
 * Invoke a callback n times, collecting the results.
 */
export function times<T>(n: number, fn: (index: number) => T): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(fn(i));
  }
  return out;
}

/**
 * Adds a value to a Map where values are arrays (multi-map pattern).
 * Creates the array if it doesn't exist for the key.
 */
export function addToMultiMap<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const existing = map.get(key);
  if (existing) {
    existing.push(value);
  } else {
    map.set(key, [value]);
  }
}

/**
 * Gets a value from a Map with a default fallback.
 * Useful for Map<K, V[]> where you want an empty array as default.
 */
export function getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
  return map.get(key) ?? defaultValue;
}

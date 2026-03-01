/**
 * Collection Utility Functions
 *
 * General-purpose helpers for working with arrays and maps.
 *
 * @module shared/utils/collections
 */

/**
 * Generate an array of sequential integers from 0 to `n - 1`.
 *
 * @param n - Number of elements to generate
 * @returns Array `[0, 1, 2, ..., n-1]`
 */
export function range(n: number): number[] {
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    out[i] = i;
  }
  return out;
}

/**
 * Invoke a callback `n` times, collecting the results into an array.
 *
 * @param n - Number of invocations
 * @param fn - Callback receiving the current index (0-based)
 * @returns Array of `n` results
 */
export function times<T>(n: number, fn: (index: number) => T): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(fn(i));
  }
  return out;
}

/**
 * Append a value to a multi-map (a `Map` whose values are arrays).
 * Creates the array entry if the key does not yet exist.
 *
 * @param map - The multi-map to modify
 * @param key - The key to append under
 * @param value - The value to append
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
 * Get a value from a `Map`, returning a fallback if the key is missing.
 *
 * @param map - The map to look up
 * @param key - The key to search for
 * @param defaultValue - Value to return when the key is absent
 * @returns The mapped value, or `defaultValue`
 */
export function getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
  return map.get(key) ?? defaultValue;
}

/**
 * Resolve optional/nullable values against a defaults object.
 * For each key in `defaults`, uses the `source` value if non-nullish, otherwise the default.
 *
 * @param source - Partial object with optional/nullable values
 * @param defaults - Object containing default values for every key
 * @returns A fully-populated object with no nullish values
 */
export function resolveDefaults<T extends Record<string, NonNullable<unknown>>>(
  source: { readonly [K in keyof T]?: T[K] | null | undefined },
  defaults: T,
): T {
  const result = {} as Record<string, unknown>;
  for (const key in defaults) {
    result[key] = source[key] ?? defaults[key];
  }
  return result as T;
}

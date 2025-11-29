/**
 * Collection utility functions for common map/set operations
 */

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

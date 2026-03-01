/**
 * Collection utility functions
 */
/**
 * Generate numbers from 0 to n-1.
 */
export function range(n) {
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
        out[i] = i;
    }
    return out;
}
/**
 * Invoke a callback n times, collecting the results.
 */
export function times(n, fn) {
    const out = [];
    for (let i = 0; i < n; i++) {
        out.push(fn(i));
    }
    return out;
}
/**
 * Adds a value to a Map where values are arrays (multi-map pattern).
 * Creates the array if it doesn't exist for the key.
 */
export function addToMultiMap(map, key, value) {
    const existing = map.get(key);
    if (existing) {
        existing.push(value);
    }
    else {
        map.set(key, [value]);
    }
}
/**
 * Gets a value from a Map with a default fallback.
 * Useful for Map<K, V[]> where you want an empty array as default.
 */
export function getOrDefault(map, key, defaultValue) {
    return map.get(key) ?? defaultValue;
}
//# sourceMappingURL=collections.js.map
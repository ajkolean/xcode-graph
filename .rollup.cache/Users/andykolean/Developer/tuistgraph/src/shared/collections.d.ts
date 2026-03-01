/**
 * Collection utility functions
 */
/**
 * Generate numbers from 0 to n-1.
 */
export declare function range(n: number): number[];
/**
 * Invoke a callback n times, collecting the results.
 */
export declare function times<T>(n: number, fn: (index: number) => T): T[];
/**
 * Adds a value to a Map where values are arrays (multi-map pattern).
 * Creates the array if it doesn't exist for the key.
 */
export declare function addToMultiMap<K, V>(map: Map<K, V[]>, key: K, value: V): void;
/**
 * Gets a value from a Map with a default fallback.
 * Useful for Map<K, V[]> where you want an empty array as default.
 */
export declare function getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V): V;
//# sourceMappingURL=collections.d.ts.map
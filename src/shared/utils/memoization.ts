/**
 * Memoization utilities for performance optimization
 */

/**
 * Deep equality check for arrays
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => deepEqual(item, b[index]));
}

/**
 * Deep equality check for Sets (shallow comparison of items)
 */
export function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

/**
 * Deep equality check for Maps (deep comparison of values)
 */
export function mapsEqual<K, V>(a: Map<K, V>, b: Map<K, V>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
  }
  return true;
}

/**
 * Deep equality check for plain objects
 */
export function objectsEqual(a: object, b: object): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

/**
 * Deep equality check for arrays and objects
 * Used to determine if memoized values need to be recomputed
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) return arraysEqual(a, b);
  if (a instanceof Set && b instanceof Set) return setsEqual(a, b);
  if (a instanceof Map && b instanceof Map) return mapsEqual(a, b);

  return objectsEqual(a, b);
}

/**
 * Shallow equality check for objects
 * Faster than deep equality, use when you know nested objects are the same reference
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Creates a memoized selector function
 * Only recomputes when inputs change (using shallow equality)
 */
export function createMemoizedSelector<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => TOutput,
  equalityFn: (a: TInput, b: TInput) => boolean = shallowArrayEqual,
): (...args: TInput) => TOutput {
  let lastArgs: TInput | undefined;
  let lastResult: TOutput | undefined;

  return (...args: TInput): TOutput => {
    if (lastArgs && equalityFn(args, lastArgs)) {
      return lastResult!;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  };
}

/**
 * Shallow equality check for arrays
 */
function shallowArrayEqual<T extends unknown[]>(a: T, b: T): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

/**
 * Creates a weak map cache for memoization
 * Useful for caching based on object identity
 */
export class WeakMapCache<K extends object, V> {
  private readonly cache = new WeakMap<K, V>();

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  getOrCompute(key: K, compute: () => V): V {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const value = compute();
    this.cache.set(key, value);
    return value;
  }
}

/**
 * Simple LRU cache for memoization
 * @param maxSize Maximum number of entries to keep
 */
export class LRUCache<K, V> {
  private readonly cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K | undefined;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

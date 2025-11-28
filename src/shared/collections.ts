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

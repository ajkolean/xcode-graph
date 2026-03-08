/**
 * Cross-Origin Worker Factory
 *
 * Creates web workers that work even when the script is loaded from a
 * different origin than the page (e.g., CDN script on localhost page).
 *
 * Browsers block `new Worker(crossOriginUrl)` with a SecurityError.
 * The workaround creates a same-origin blob that loads the cross-origin script.
 */

/**
 * Create a Worker that handles cross-origin script URLs.
 *
 * When the worker URL is same-origin as the page, creates a normal Worker.
 * When cross-origin (e.g., CDN), wraps in a same-origin blob URL.
 *
 * @param url - The worker script URL (from `new URL('...', import.meta.url)`)
 * @param options - Standard Worker options
 * @returns A Worker instance
 */
export function createWorkerFromUrl(url: URL, options?: WorkerOptions): Worker {
  if (typeof globalThis.location !== 'undefined' && url.origin === globalThis.location.origin) {
    return new Worker(url, options);
  }

  const isModule = options?.type === 'module';
  const source = isModule
    ? `import ${JSON.stringify(url.href)}`
    : `importScripts(${JSON.stringify(url.href)})`;

  const blob = new Blob([source], { type: 'text/javascript' });
  return new Worker(URL.createObjectURL(blob), isModule ? { type: 'module' } : undefined);
}

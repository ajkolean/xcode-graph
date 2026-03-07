/**
 * Vitest setup for jsdom environment.
 * Polyfills browser APIs not available in jsdom.
 */
import 'vitest-canvas-mock';
import { expect, vi } from 'vitest';
import 'vitest-axe/extend-expect';
import { toHaveNoViolations } from 'vitest-axe/matchers';

expect.extend({ toHaveNoViolations });

// Mock elkjs/lib/elk-api.js to return bundled ELK — allows createElk() to work
// in jsdom (no real workers needed). The wrapper ignores workerFactory.
vi.mock('elkjs/lib/elk-api.js', async () => {
  const { default: ELKBundled } = await vi.importActual<typeof import('elkjs/lib/elk.bundled.js')>(
    'elkjs/lib/elk.bundled.js',
  );
  class MockELK {
    private elk: InstanceType<typeof ELKBundled>;
    constructor() {
      this.elk = new ELKBundled();
    }
    layout(...args: Parameters<InstanceType<typeof ELKBundled>['layout']>) {
      return this.elk.layout(...args);
    }
    knownLayoutOptions() {
      return this.elk.knownLayoutOptions();
    }
  }
  return { default: MockELK };
});

// jsdom doesn't provide ResizeObserver or IntersectionObserver
if (typeof globalThis.ResizeObserver === 'undefined') {
  /** No-op ResizeObserver polyfill for jsdom */
  globalThis.ResizeObserver = class ResizeObserver {
    observe() { /* no-op: jsdom has no layout engine */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
  } as unknown as typeof globalThis.ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  /** No-op IntersectionObserver polyfill for jsdom */
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() { /* no-op: jsdom has no layout engine */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
  } as unknown as typeof globalThis.IntersectionObserver;
}

if (typeof globalThis.OffscreenCanvas === 'undefined') {
  /** Minimal OffscreenCanvas stub for jsdom — used by starfield and cluster label rendering */
  // biome-ignore lint/complexity/useLiteralKeys: bracket notation required for Record index signature
  (globalThis as Record<string, unknown>)['OffscreenCanvas'] = class {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return {
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillText: () => {},
        measureText: () => ({ width: 0 }),
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        globalAlpha: 1,
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
      };
    }
  };
}

/**
 * Vitest setup for jsdom environment.
 * Polyfills browser APIs not available in jsdom.
 */
import 'vitest-canvas-mock';
import { expect, vi } from 'vitest';
import 'vitest-axe/extend-expect';
import { toHaveNoViolations } from 'vitest-axe/matchers';

expect.extend({ toHaveNoViolations });

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

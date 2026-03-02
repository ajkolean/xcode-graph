/**
 * Vitest setup for jsdom environment.
 * Polyfills browser APIs not available in jsdom.
 */
import 'vitest-canvas-mock';
import { expect, vi } from 'vitest';
import 'vitest-axe/extend-expect';
import * as vitestAxeMatchers from 'vitest-axe/matchers';

expect.extend(vitestAxeMatchers);

// @lit-labs/virtualizer requires ResizeObserver which jsdom doesn't provide
if (typeof globalThis.ResizeObserver === 'undefined') {
  /** No-op ResizeObserver polyfill for jsdom */
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver;
}

// Mock the virtualize directive: in jsdom there's no layout engine,
// so the virtualizer can't determine viewport visibility.
// This mock renders all items directly (like repeat()).
vi.mock('@lit-labs/virtualizer/virtualize.js', () => ({
  virtualize: ({
    items,
    renderItem,
    keyFunction,
  }: {
    items: unknown[];
    renderItem: (item: unknown, index: number) => unknown;
    keyFunction?: (item: unknown) => unknown;
  }) => {
    if (keyFunction) {
      for (const item of items) keyFunction(item);
    }
    return items.map((item, index) => renderItem(item, index));
  },
}));

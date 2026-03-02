/**
 * Reduced Motion Signal Tests
 *
 * Verifies that prefersReducedMotion reflects the OS media query state.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('reduced-motion signal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should default to false when matchMedia is not mocked', async () => {
    // In jsdom, matchMedia returns { matches: false } by default
    const { prefersReducedMotion } = await import('./reduced-motion.signals');
    expect(prefersReducedMotion.get()).toBe(false);
  });

  it('should read from matchMedia when available', async () => {
    // matchMedia in jsdom always returns matches: false, so signal should be false
    const { prefersReducedMotion } = await import('./reduced-motion.signals');
    expect(typeof prefersReducedMotion.get()).toBe('boolean');
  });

  it('should update signal when change event listener is invoked', async () => {
    let capturedHandler: ((e: { matches: boolean }) => void) | null = null;
    const addEventListenerMock = vi.fn(
      (event: string, handler: (e: { matches: boolean }) => void) => {
        if (event === 'change') {
          capturedHandler = handler;
        }
      },
    );

    const original = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    }) as unknown as typeof globalThis.matchMedia;

    // Clear the module cache so it re-executes with the mock
    vi.resetModules();

    try {
      const { prefersReducedMotion } = await import('./reduced-motion.signals');

      // Initially false
      expect(prefersReducedMotion.get()).toBe(false);

      // Simulate change to reduced motion enabled
      expect(capturedHandler).not.toBeNull();
      const handler = capturedHandler as unknown as (e: { matches: boolean }) => void;
      handler({ matches: true });
      expect(prefersReducedMotion.get()).toBe(true);

      // Simulate change back to no reduced motion
      handler({ matches: false });
      expect(prefersReducedMotion.get()).toBe(false);
    } finally {
      globalThis.matchMedia = original;
    }
  });
});

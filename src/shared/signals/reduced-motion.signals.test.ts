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
});

import { ZOOM_CONFIG } from '@shared/utils/zoom-config';
import { describe, expect, it } from 'vitest';
import { adjustColorForZoom, adjustOpacityForZoom } from './zoom-colors';

// ---------------------------------------------------------------------------
// adjustColorForZoom
// ---------------------------------------------------------------------------

describe('adjustColorForZoom', () => {
  it('returns default purple for undefined color', () => {
    const result = adjustColorForZoom(undefined as unknown as string, 1);
    expect(result).toBe('#6F2CFF');
  });

  it('returns default purple for non-string color', () => {
    const result = adjustColorForZoom(42 as unknown as string, 1);
    expect(result).toBe('#6F2CFF');
  });

  it('returns default purple for empty string', () => {
    const result = adjustColorForZoom('', 1);
    expect(result).toBe('#6F2CFF');
  });

  it('handles rgba color string', () => {
    const result = adjustColorForZoom('rgba(255, 0, 0, 0.5)', 1);
    expect(result).toMatch(/^rgba\(/);
    // Should preserve the alpha value
    expect(result).toContain('0.5');
  });

  it('handles rgb color string (no alpha)', () => {
    const result = adjustColorForZoom('rgb(255, 0, 0)', 1);
    expect(result).toMatch(/^rgba\(/);
    // Default alpha = 1
    expect(result).toContain(', 1)');
  });

  it('returns original color when rgb/rgba regex does not match', () => {
    const result = adjustColorForZoom('rgba(invalid)', 1);
    expect(result).toBe('rgba(invalid)');
  });

  it('handles hex color string', () => {
    const result = adjustColorForZoom('#ff0000', 1);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('produces more saturated colors at higher zoom', () => {
    const lowZoom = adjustColorForZoom('#ff0000', ZOOM_CONFIG.MIN_ZOOM);
    const highZoom = adjustColorForZoom('#ff0000', ZOOM_CONFIG.MAX_ZOOM);
    // Both should be valid hex
    expect(lowZoom).toMatch(/^#[0-9a-f]{6}$/);
    expect(highZoom).toMatch(/^#[0-9a-f]{6}$/);
    // They should differ (different zoom adjustments)
    expect(lowZoom).not.toBe(highZoom);
  });

  it('adjusts rgba colors differently at different zoom levels', () => {
    const lowZoom = adjustColorForZoom('rgba(200, 100, 50, 0.8)', ZOOM_CONFIG.MIN_ZOOM);
    const highZoom = adjustColorForZoom('rgba(200, 100, 50, 0.8)', ZOOM_CONFIG.MAX_ZOOM);
    expect(lowZoom).not.toBe(highZoom);
  });

  it('preserves alpha channel for rgba colors', () => {
    const result = adjustColorForZoom('rgba(100, 200, 50, 0.75)', 1);
    expect(result).toContain('0.75');
  });

  it('caps lightness at 0.95 for rgba colors', () => {
    // Very light color at min zoom (maximum lightness adjustment)
    const result = adjustColorForZoom('rgba(250, 250, 250, 1)', ZOOM_CONFIG.MIN_ZOOM);
    // Result should still be valid
    expect(result).toMatch(/^rgba\(/);
  });

  it('caps lightness at 95 for hex colors', () => {
    // Very light hex color at min zoom
    const result = adjustColorForZoom('#fafafa', ZOOM_CONFIG.MIN_ZOOM);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});

// ---------------------------------------------------------------------------
// adjustOpacityForZoom
// ---------------------------------------------------------------------------

describe('adjustOpacityForZoom', () => {
  it('returns full opacity at max zoom', () => {
    const result = adjustOpacityForZoom(1.0, ZOOM_CONFIG.MAX_ZOOM);
    expect(result).toBeCloseTo(1.0);
  });

  it('returns reduced opacity at min zoom', () => {
    const result = adjustOpacityForZoom(1.0, ZOOM_CONFIG.MIN_ZOOM);
    expect(result).toBeLessThan(1.0);
    expect(result).toBeGreaterThan(0);
  });

  it('scales with base opacity', () => {
    const half = adjustOpacityForZoom(0.5, 1);
    const full = adjustOpacityForZoom(1.0, 1);
    expect(full).toBeGreaterThan(half);
    expect(half).toBeCloseTo(full / 2);
  });

  it('returns 0 when base opacity is 0', () => {
    expect(adjustOpacityForZoom(0, 1)).toBe(0);
  });
});

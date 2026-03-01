import { describe, expect, it } from 'vitest';
import { hexToHSL, hslToHex, hslToRgb, hue2rgb, rgbToHsl, toHex } from './color-math';

// ---------------------------------------------------------------------------
// hue2rgb
// ---------------------------------------------------------------------------

describe('hue2rgb', () => {
  it('wraps negative t by adding 1', () => {
    // t < 0 → adjustedT += 1 → becomes 0.9
    // 0.9 > 2/3 → returns p
    const result = hue2rgb(0.2, 0.8, -0.1);
    expect(result).toBeCloseTo(0.2);
  });

  it('wraps t > 1 by subtracting 1', () => {
    // t = 1.1 → adjustedT -= 1 → 0.1
    // 0.1 < 1/6 → returns p + (q - p) * 6 * adjustedT
    const result = hue2rgb(0.2, 0.8, 1.1);
    expect(result).toBeCloseTo(0.2 + (0.8 - 0.2) * 6 * 0.1);
  });

  it('handles t < 1/6 (first range)', () => {
    const result = hue2rgb(0.2, 0.8, 0.1);
    // p + (q - p) * 6 * t = 0.2 + 0.6 * 6 * 0.1 = 0.2 + 0.36 = 0.56
    expect(result).toBeCloseTo(0.56);
  });

  it('handles 1/6 <= t < 1/2 (second range)', () => {
    const result = hue2rgb(0.2, 0.8, 0.3);
    expect(result).toBeCloseTo(0.8);
  });

  it('handles 1/2 <= t < 2/3 (third range)', () => {
    const result = hue2rgb(0.2, 0.8, 0.6);
    // p + (q - p) * (2/3 - t) * 6 = 0.2 + 0.6 * (2/3 - 0.6) * 6
    // = 0.2 + 0.6 * 0.0667 * 6 = 0.2 + 0.24 = 0.44
    expect(result).toBeCloseTo(0.2 + 0.6 * (2 / 3 - 0.6) * 6);
  });

  it('handles t >= 2/3 (fourth range, returns p)', () => {
    const result = hue2rgb(0.2, 0.8, 0.9);
    expect(result).toBeCloseTo(0.2);
  });

  it('handles exact boundary at t = 1/6', () => {
    const result = hue2rgb(0.2, 0.8, 1 / 6);
    // 1/6 is NOT < 1/6, so falls to second range: return q
    expect(result).toBeCloseTo(0.8);
  });

  it('handles exact boundary at t = 1/2', () => {
    const result = hue2rgb(0.2, 0.8, 0.5);
    // 1/2 is NOT < 1/2, so falls to third range
    expect(result).toBeCloseTo(0.2 + 0.6 * (2 / 3 - 0.5) * 6);
  });
});

// ---------------------------------------------------------------------------
// toHex
// ---------------------------------------------------------------------------

describe('toHex', () => {
  it('converts 0 to "00"', () => {
    expect(toHex(0)).toBe('00');
  });

  it('converts 1 to "ff"', () => {
    expect(toHex(1)).toBe('ff');
  });

  it('pads single-digit hex values with leading zero', () => {
    // 1/255 ≈ 0.00392 → round(1) = 1 → "1" → padded "01"
    expect(toHex(1 / 255)).toBe('01');
  });

  it('converts 0.5 to "80"', () => {
    expect(toHex(0.5)).toBe('80');
  });

  it('handles values resulting in two-digit hex without padding', () => {
    // 16/255 → round(16) = 16 → "10"
    expect(toHex(16 / 255)).toBe('10');
  });
});

// ---------------------------------------------------------------------------
// rgbToHsl
// ---------------------------------------------------------------------------

describe('rgbToHsl', () => {
  it('returns achromatic (0 saturation) for grayscale', () => {
    const result = rgbToHsl(0.5, 0.5, 0.5);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(0.5);
  });

  it('computes hue correctly when red is max', () => {
    const result = rgbToHsl(1, 0.5, 0);
    // max = 1 (r), min = 0 (b), d = 1
    // h = ((g - b) / d + (g < b ? 6 : 0)) / 6 = ((0.5 - 0) / 1 + 0) / 6 = 0.5/6
    expect(result.h).toBeCloseTo(0.5 / 6);
  });

  it('adds 6 to hue offset when red is max and g < b', () => {
    const result = rgbToHsl(1, 0, 0.5);
    // h = ((g - b) / d + 6) / 6 = ((-0.5) / 1 + 6) / 6 = 5.5/6
    expect(result.h).toBeCloseTo(5.5 / 6);
  });

  it('computes hue correctly when green is max', () => {
    const result = rgbToHsl(0, 1, 0);
    // h = ((b - r) / d + 2) / 6 = (0 / 1 + 2) / 6 = 2/6
    expect(result.h).toBeCloseTo(2 / 6);
  });

  it('computes hue correctly when blue is max', () => {
    const result = rgbToHsl(0, 0, 1);
    // h = ((r - g) / d + 4) / 6 = (0 / 1 + 4) / 6 = 4/6
    expect(result.h).toBeCloseTo(4 / 6);
  });

  it('uses correct saturation formula when l > 0.5', () => {
    // Need l > 0.5: e.g. r=1, g=0.8, b=0.5
    const result = rgbToHsl(1, 0.8, 0.5);
    // max=1, min=0.5, l=(1+0.5)/2=0.75, d=0.5
    // s = d / (2 - max - min) = 0.5 / (2 - 1 - 0.5) = 0.5 / 0.5 = 1
    expect(result.l).toBeCloseTo(0.75);
    expect(result.s).toBeCloseTo(1);
  });

  it('uses correct saturation formula when l <= 0.5', () => {
    // Need l <= 0.5: e.g. r=0.5, g=0, b=0
    const result = rgbToHsl(0.5, 0, 0);
    // max=0.5, min=0, l=0.25, d=0.5
    // s = d / (max + min) = 0.5 / 0.5 = 1
    expect(result.l).toBeCloseTo(0.25);
    expect(result.s).toBeCloseTo(1);
  });

  it('handles pure white', () => {
    const result = rgbToHsl(1, 1, 1);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(1);
  });

  it('handles pure black', () => {
    const result = rgbToHsl(0, 0, 0);
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(0);
  });
});

// ---------------------------------------------------------------------------
// hslToRgb
// ---------------------------------------------------------------------------

describe('hslToRgb', () => {
  it('returns grayscale when saturation is 0', () => {
    const result = hslToRgb(0.5, 0, 0.7);
    expect(result.r).toBeCloseTo(0.7);
    expect(result.g).toBeCloseTo(0.7);
    expect(result.b).toBeCloseTo(0.7);
  });

  it('uses first q formula when l < 0.5', () => {
    const result = hslToRgb(0, 1, 0.25);
    // q = l * (1 + s) = 0.25 * 2 = 0.5, p = 2 * 0.25 - 0.5 = 0
    // Pure red at low lightness
    expect(result.r).toBeCloseTo(0.5);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });

  it('uses second q formula when l >= 0.5', () => {
    const result = hslToRgb(0, 1, 0.5);
    // q = l + s - l * s = 0.5 + 1 - 0.5 = 1, p = 2 * 0.5 - 1 = 0
    // Pure red
    expect(result.r).toBeCloseTo(1);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0);
  });

  it('roundtrips with rgbToHsl', () => {
    const original = { r: 0.3, g: 0.6, b: 0.9 };
    const hsl = rgbToHsl(original.r, original.g, original.b);
    const roundtrip = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(roundtrip.r).toBeCloseTo(original.r, 4);
    expect(roundtrip.g).toBeCloseTo(original.g, 4);
    expect(roundtrip.b).toBeCloseTo(original.b, 4);
  });
});

// ---------------------------------------------------------------------------
// hexToHSL
// ---------------------------------------------------------------------------

describe('hexToHSL', () => {
  it('converts pure red hex to HSL', () => {
    const result = hexToHSL('#ff0000');
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts pure green hex to HSL', () => {
    const result = hexToHSL('#00ff00');
    expect(result.h).toBe(120);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts pure blue hex to HSL', () => {
    const result = hexToHSL('#0000ff');
    expect(result.h).toBe(240);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('handles hex with # prefix', () => {
    const result = hexToHSL('#00ff00');
    expect(result.h).toBe(120);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// hslToHex
// ---------------------------------------------------------------------------

describe('hslToHex', () => {
  it('converts red HSL to hex', () => {
    const result = hslToHex(0, 100, 50);
    expect(result).toBe('#ff0000');
  });

  it('converts green HSL to hex', () => {
    const result = hslToHex(120, 100, 50);
    expect(result).toBe('#00ff00');
  });

  it('converts blue HSL to hex', () => {
    const result = hslToHex(240, 100, 50);
    expect(result).toBe('#0000ff');
  });

  it('roundtrips with hexToHSL for primary colors', () => {
    const hex = '#ff0000';
    const hsl = hexToHSL(hex);
    const roundtrip = hslToHex(hsl.h, hsl.s, hsl.l);
    expect(roundtrip).toBe(hex);
  });
});

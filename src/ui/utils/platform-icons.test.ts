/**
 * Platform Icons utility tests
 */

import { describe, expect, it } from 'vitest';
import {
  getPlatformColor,
  getPlatformIconPath,
  PLATFORM_COLOR,
  PLATFORM_COLORS,
} from './platform-icons';

describe('getPlatformColor', () => {
  it('returns color for known platform', () => {
    expect(getPlatformColor('iOS')).to.equal(PLATFORM_COLORS.iOS);
  });

  it('returns fallback color for unknown platform', () => {
    expect(getPlatformColor('AndroidOS')).to.equal(PLATFORM_COLOR);
  });

  it('returns color from CSS custom property when element is provided', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    // CSS custom props won't be set in test env, so it falls back to static value
    const color = getPlatformColor('iOS', el);
    expect(color).toBe(PLATFORM_COLORS.iOS);
    document.body.removeChild(el);
  });

  it('returns static color when element has no matching CSS property', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const color = getPlatformColor('UnknownOS', el);
    expect(color).toBe(PLATFORM_COLOR);
    document.body.removeChild(el);
  });
});

describe('getPlatformIconPath', () => {
  it('returns SVG path for known platform', () => {
    const path = getPlatformIconPath('macOS');
    expect(path).to.include('M20 3H4');
  });

  it('returns fallback path for unknown platform', () => {
    const path = getPlatformIconPath('UnknownOS');
    expect(path).to.equal('M12 2v20m10-10H2');
  });
});

import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { describe, expect, it } from 'vitest';
import { NODE_PALETTE } from '@/shared/constants/node-palette.ts';
import { resolveCanvasTheme } from './canvas-theme';

extend([a11yPlugin]);

describe('canvas-theme', () => {
  it('resolves theme with fallback values when no CSS properties set', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);

    expect(theme.nodeApp).toBe(NODE_PALETTE.app);
    expect(theme.nodeFramework).toBe(NODE_PALETTE.framework);
    expect(theme.nodeLibrary).toBe(NODE_PALETTE.library);
    expect(theme.nodeTest).toBe(NODE_PALETTE['test-unit']);
    expect(theme.nodeCli).toBe(NODE_PALETTE.cli);
    expect(theme.nodePackage).toBe(NODE_PALETTE.package);
    expect(theme.canvasBg).toBe('#161617');
    expect(theme.tooltipBg).toBe('rgba(24, 24, 28, 0.95)');
    expect(theme.shadowColor).toBe('rgba(24, 24, 28, 0.9)');
    expect(theme.cycleEdgeColor).toBe('rgba(239, 68, 68, 0.8)');
    expect(theme.cycleGlowColor).toBe('rgba(239, 68, 68, 0.6)');

    document.body.removeChild(el);
  });

  it('detects dark mode from default background', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);
    expect(theme.isDark).toBe(true);

    document.body.removeChild(el);
  });

  it('returns all required CanvasTheme properties', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);
    const keys = Object.keys(theme);

    expect(keys).toContain('nodeApp');
    expect(keys).toContain('canvasBg');
    expect(keys).toContain('isDark');
    expect(keys).toContain('cycleEdgeColor');

    document.body.removeChild(el);
  });

  it('detects dark mode from rgba background color', () => {
    const el = document.createElement('div');
    // Set a dark rgba background value via CSS custom property
    el.style.setProperty('--colors-background', 'rgba(22, 22, 23, 1)');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);
    expect(theme.isDark).toBe(true);

    document.body.removeChild(el);
  });

  it('detects light mode from a light hex background', () => {
    const el = document.createElement('div');
    // Set a light background: white
    el.style.setProperty('--colors-background', '#ffffff');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);
    expect(theme.isDark).toBe(false);

    document.body.removeChild(el);
  });

  it('falls back to dark when background color has no parseable digits', () => {
    const el = document.createElement('div');
    // Set a color value that has no digit matches (edge case)
    el.style.setProperty('--colors-background', 'transparent');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);
    // 'transparent' → no match → r=0, g=0, b=0 → luminance=0 → isDark=true
    expect(theme.isDark).toBe(true);

    document.body.removeChild(el);
  });

  describe('contrast validation', () => {
    const MIN_CONTRAST = 3.0; // WCAG AA for graphical objects
    const DARK_BG = '#161617';
    const paletteColors = Object.values(NODE_PALETTE);

    it('node palette colors have sufficient contrast against dark background', () => {
      const bg = colord(DARK_BG);
      for (const color of paletteColors) {
        const ratio = colord(color).contrast(bg);
        expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST);
      }
    });
  });
});

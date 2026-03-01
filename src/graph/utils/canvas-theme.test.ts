import { describe, expect, it } from 'vitest';
import { resolveCanvasTheme } from './canvas-theme';

describe('canvas-theme', () => {
  it('resolves theme with fallback values when no CSS properties set', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const theme = resolveCanvasTheme(el);

    expect(theme.nodeApp).toBe('rgba(240, 176, 64, 1)');
    expect(theme.nodeFramework).toBe('rgba(100, 181, 246, 1)');
    expect(theme.nodeLibrary).toBe('rgba(129, 199, 132, 1)');
    expect(theme.nodeTest).toBe('rgba(240, 120, 170, 1)');
    expect(theme.nodeCli).toBe('rgba(120, 160, 246, 1)');
    expect(theme.nodePackage).toBe('rgba(234, 196, 72, 1)');
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
});

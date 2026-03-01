import { describe, expect, it } from 'vitest';
import { colorWithAlpha, hexToRgba } from './canvas-colors';

describe('canvas-colors', () => {
  describe('hexToRgba', () => {
    it('converts hex to rgba', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
    });

    it('converts black hex', () => {
      expect(hexToRgba('#000000', 1)).toBe('rgba(0,0,0,1)');
    });

    it('converts white hex', () => {
      expect(hexToRgba('#ffffff', 0.8)).toBe('rgba(255,255,255,0.8)');
    });
  });

  describe('colorWithAlpha', () => {
    it('replaces alpha in rgba string', () => {
      expect(colorWithAlpha('rgba(255, 0, 0, 1)', 0.5)).toBe('rgba(255,0,0,0.5)');
    });

    it('adds alpha to rgb string', () => {
      expect(colorWithAlpha('rgb(100, 200, 50)', 0.3)).toBe('rgba(100,200,50,0.3)');
    });

    it('converts hex string', () => {
      expect(colorWithAlpha('#ff0000', 0.7)).toBe('rgba(255,0,0,0.7)');
    });

    it('returns original for unrecognized format', () => {
      expect(colorWithAlpha('hsl(0, 100%, 50%)', 0.5)).toBe('hsl(0, 100%, 50%)');
    });

    it('handles hex with lowercase', () => {
      expect(colorWithAlpha('#0a1b2c', 1)).toBe('rgba(10,27,44,1)');
    });
  });
});

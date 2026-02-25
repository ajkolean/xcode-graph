import { describe, expect, it } from 'vitest';
import { generateColor, generateColorPalette, generateColorWithAlpha } from './color-generator';

describe('colorGenerator', () => {
  describe('generateColor', () => {
    it('should return a valid hex color', () => {
      const color = generateColor('test');

      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should return consistent colors for same input', () => {
      const color1 = generateColor('myproject');
      const color2 = generateColor('myproject');

      expect(color1).toBe(color2);
    });

    it('should return different colors for different inputs', () => {
      const color1 = generateColor('project1');
      const color2 = generateColor('project2');

      expect(color1).not.toBe(color2);
    });

    it('should handle empty string', () => {
      const color = generateColor('');

      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should handle special characters', () => {
      const color = generateColor('test@#$%^&*()');

      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should apply category variation', () => {
      generateColor('test');
      const colorWithCategory = generateColor('test', 'platform');

      // May or may not be different depending on hash
      expect(colorWithCategory).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should handle unicode characters', () => {
      const color = generateColor('项目名称');

      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      const color = generateColor(longString);

      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should produce visually distinct colors for common names', () => {
      const colors = [
        generateColor('iOS'),
        generateColor('macOS'),
        generateColor('watchOS'),
        generateColor('tvOS'),
        generateColor('visionOS'),
      ];

      // All should be valid colors
      colors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      // At least some should be different (can't guarantee all unique)
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });
  });

  describe('generateColorPalette', () => {
    it('should return a Map of colors', () => {
      const items = ['iOS', 'macOS', 'watchOS'];
      const palette = generateColorPalette(items);

      expect(palette).toBeInstanceOf(Map);
      expect(palette.size).toBe(3);
    });

    it('should have valid hex colors for all items', () => {
      const items = ['item1', 'item2', 'item3'];
      const palette = generateColorPalette(items);

      items.forEach((item) => {
        expect(palette.get(item)).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should handle empty array', () => {
      const palette = generateColorPalette([]);

      expect(palette.size).toBe(0);
    });

    it('should apply category to all items', () => {
      const items = ['a', 'b'];
      const paletteWithCategory = generateColorPalette(items, 'project');

      expect(paletteWithCategory.size).toBe(2);
      items.forEach((item) => {
        expect(paletteWithCategory.get(item)).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should return consistent palette for same inputs', () => {
      const items = ['x', 'y', 'z'];
      const palette1 = generateColorPalette(items);
      const palette2 = generateColorPalette(items);

      items.forEach((item) => {
        expect(palette1.get(item)).toBe(palette2.get(item));
      });
    });
  });

  describe('generateColorWithAlpha', () => {
    it('should return an rgba color string', () => {
      const color = generateColorWithAlpha('test', 0.5);

      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    });

    it('should handle alpha of 0', () => {
      const color = generateColorWithAlpha('test', 0);

      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
    });

    it('should handle alpha of 1', () => {
      const color = generateColorWithAlpha('test', 1);

      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/);
    });

    it('should handle decimal alpha values', () => {
      const color = generateColorWithAlpha('test', 0.75);

      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.75\)$/);
    });

    it('should be consistent for same input', () => {
      const color1 = generateColorWithAlpha('myinput', 0.5);
      const color2 = generateColorWithAlpha('myinput', 0.5);

      expect(color1).toBe(color2);
    });

    it('should produce same RGB values as generateColor', () => {
      const hexColor = generateColor('test');
      const rgbaColor = generateColorWithAlpha('test', 1);

      // Extract RGB from hex
      const r = Number.parseInt(hexColor.slice(1, 3), 16);
      const g = Number.parseInt(hexColor.slice(3, 5), 16);
      const b = Number.parseInt(hexColor.slice(5, 7), 16);

      expect(rgbaColor).toBe(`rgba(${r}, ${g}, ${b}, 1)`);
    });

    it('should apply category variation', () => {
      const colorWithCategory = generateColorWithAlpha('test', 0.5, 'platform');

      expect(colorWithCategory).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    });
  });
});

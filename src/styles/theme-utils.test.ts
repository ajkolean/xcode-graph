/**
 * Theme Utilities Tests
 */

import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  darken,
  ensureContrast,
  lighten,
  meetsContrast,
  onColorSchemeChange,
  prefersDarkMode,
  withAlpha,
} from './theme-utils';

describe('theme-utils', () => {
  describe('contrastRatio', () => {
    it('should return ~21 for black and white', () => {
      const ratio = contrastRatio('#000000', '#ffffff');
      expect(ratio).to.be.closeTo(21, 0.1);
    });

    it('should return 1 for same color', () => {
      const ratio = contrastRatio('#ff0000', '#ff0000');
      expect(ratio).to.be.closeTo(1, 0.01);
    });

    it('should return a value between 1 and 21', () => {
      const ratio = contrastRatio('#8B5CF6', '#1c1c1e');
      expect(ratio).to.be.greaterThan(1);
      expect(ratio).to.be.lessThanOrEqual(21);
    });
  });

  describe('meetsContrast', () => {
    it('should pass AA for black on white', () => {
      expect(meetsContrast('#000000', '#ffffff', 'AA')).to.be.true;
    });

    it('should pass AAA for black on white', () => {
      expect(meetsContrast('#000000', '#ffffff', 'AAA')).to.be.true;
    });

    it('should fail for low contrast colors', () => {
      expect(meetsContrast('#777777', '#888888', 'AA')).to.be.false;
    });

    it('should default to AA level', () => {
      expect(meetsContrast('#000000', '#ffffff')).to.be.true;
    });
  });

  describe('ensureContrast', () => {
    it('should return a color that meets AA contrast on dark background', () => {
      const result = ensureContrast('#333333', '#000000', 'AA');
      expect(meetsContrast(result, '#000000', 'AA')).to.be.true;
    });

    it('should return a color that meets AA contrast on light background', () => {
      const result = ensureContrast('#cccccc', '#ffffff', 'AA');
      expect(meetsContrast(result, '#ffffff', 'AA')).to.be.true;
    });

    it('should return the original color if it already meets contrast', () => {
      const result = ensureContrast('#000000', '#ffffff', 'AA');
      // Black on white already meets AA; result should be close to black
      expect(result).to.equal('#000000');
    });
  });

  describe('withAlpha', () => {
    it('should set alpha to 0.5', () => {
      const result = withAlpha('#ff0000', 0.5);
      expect(result).to.include('rgba');
      expect(result).to.include('0.5');
    });

    it('should set alpha to 0', () => {
      const result = withAlpha('#ff0000', 0);
      expect(result).to.include('0');
    });

    it('should set alpha to 1', () => {
      const result = withAlpha('#ff0000', 1);
      // Fully opaque - should contain rgb values
      expect(result).to.include('255');
    });
  });

  describe('lighten', () => {
    it('should return a lighter color', () => {
      const original = '#555555';
      const lighter = lighten(original, 0.2);
      // Lighter color should be different from original
      expect(lighter).to.not.equal(original);
    });

    it('should return hex string', () => {
      const result = lighten('#000000', 0.1);
      expect(result).to.match(/^#[0-9a-f]{6}$/i);
    });

    it('should not exceed white', () => {
      const result = lighten('#ffffff', 0.5);
      expect(result.toLowerCase()).to.equal('#ffffff');
    });
  });

  describe('darken', () => {
    it('should return a darker color', () => {
      const original = '#aaaaaa';
      const darker = darken(original, 0.2);
      expect(darker).to.not.equal(original);
    });

    it('should return hex string', () => {
      const result = darken('#ffffff', 0.1);
      expect(result).to.match(/^#[0-9a-f]{6}$/i);
    });

    it('should not go below black', () => {
      const result = darken('#000000', 0.5);
      expect(result.toLowerCase()).to.equal('#000000');
    });
  });

  describe('prefersDarkMode', () => {
    it('should return a boolean', () => {
      const result = prefersDarkMode();
      expect(typeof result).to.equal('boolean');
    });
  });

  describe('onColorSchemeChange', () => {
    it('should return a cleanup function', () => {
      const cleanup = onColorSchemeChange(() => {});
      expect(typeof cleanup).to.equal('function');
      cleanup();
    });
  });
});

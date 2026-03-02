/**
 * Icon Adapter Tests
 *
 * Tests for getIcon() and iconNames exports.
 */

import { describe, expect, it } from 'vitest';
import { getIcon, iconNames, icons } from './icon-adapter';

describe('icon-adapter', () => {
  describe('icons', () => {
    it('should export a non-empty icons record', () => {
      expect(Object.keys(icons).length).toBeGreaterThan(0);
    });
  });

  describe('getIcon', () => {
    it('should return an SVGTemplateResult for a valid icon name', () => {
      const result = getIcon('Search');
      expect(result).toBeDefined();
      // SVGTemplateResult from Lit has a `strings` property (TemplateResult shape)
      expect(result).toHaveProperty('strings');
    });

    it('should return SVGTemplateResult for each known icon', () => {
      for (const name of iconNames) {
        const result = getIcon(name);
        expect(result).toBeDefined();
      }
    });
  });

  describe('iconNames', () => {
    it('should be an array containing all keys from icons', () => {
      expect(Array.isArray(iconNames)).toBe(true);
      expect(iconNames.length).to.equal(Object.keys(icons).length);
    });

    it('should contain expected icon names', () => {
      expect(iconNames).toContain('Search');
      expect(iconNames).toContain('Upload');
      expect(iconNames).toContain('X');
      expect(iconNames).toContain('Plus');
      expect(iconNames).toContain('Minus');
    });

    it('should match icons object keys exactly', () => {
      const keysFromObject = Object.keys(icons);
      expect([...iconNames].sort()).to.deep.equal([...keysFromObject].sort());
    });
  });
});

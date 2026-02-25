import { describe, expect, it } from 'vitest';
import { generateColorMap } from './filters';

describe('filterHelpers', () => {
  describe('generateColorMap', () => {
    it('should generate colors for platforms', () => {
      const platforms = ['iOS', 'macOS', 'watchOS'];
      const colorMap = generateColorMap(platforms, 'platform');

      expect(colorMap).toBeInstanceOf(Map);
      expect(colorMap.size).toBe(3);

      platforms.forEach((platform) => {
        expect(colorMap.get(platform)).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should generate colors for projects', () => {
      const projects = ['Core', 'Features', 'App'];
      const colorMap = generateColorMap(projects, 'project');

      expect(colorMap.size).toBe(3);

      projects.forEach((project) => {
        expect(colorMap.get(project)).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should generate colors for packages', () => {
      const packages = ['Alamofire', 'Kingfisher'];
      const colorMap = generateColorMap(packages, 'package');

      expect(colorMap.size).toBe(2);

      packages.forEach((pkg) => {
        expect(colorMap.get(pkg)).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should handle empty iterable', () => {
      const colorMap = generateColorMap([], 'platform');

      expect(colorMap.size).toBe(0);
    });

    it('should handle Set as input', () => {
      const platformSet = new Set(['iOS', 'macOS']);
      const colorMap = generateColorMap(platformSet, 'platform');

      expect(colorMap.size).toBe(2);
      expect(colorMap.has('iOS')).toBe(true);
      expect(colorMap.has('macOS')).toBe(true);
    });

    it('should return consistent colors for same inputs', () => {
      const items = ['A', 'B', 'C'];
      const colorMap1 = generateColorMap(items, 'project');
      const colorMap2 = generateColorMap(items, 'project');

      items.forEach((item) => {
        expect(colorMap1.get(item)).toBe(colorMap2.get(item));
      });
    });
  });
});

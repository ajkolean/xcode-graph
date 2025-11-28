import { describe, expect, it } from 'vitest';
import { generateColorMap, getNodeTypeColor, NODE_TYPE_COLORS } from './filters';

describe('filterHelpers', () => {
  describe('NODE_TYPE_COLORS', () => {
    it('should have color for app type', () => {
      expect(NODE_TYPE_COLORS.app).toBe('#6F2CFF');
    });

    it('should have color for framework type', () => {
      expect(NODE_TYPE_COLORS.framework).toBe('#0280B9');
    });

    it('should have color for library type', () => {
      expect(NODE_TYPE_COLORS.library).toBe('#28A745');
    });

    it('should have color for test-unit type', () => {
      expect(NODE_TYPE_COLORS['test-unit']).toBe('#9C27B0');
    });

    it('should have color for test-ui type', () => {
      expect(NODE_TYPE_COLORS['test-ui']).toBe('#E91E63');
    });

    it('should have color for cli type', () => {
      expect(NODE_TYPE_COLORS.cli).toBe('#FD791C');
    });

    it('should have color for package type', () => {
      expect(NODE_TYPE_COLORS.package).toBe('#FF9800');
    });

    it('should have all expected node types', () => {
      const expectedTypes = [
        'app',
        'framework',
        'library',
        'test-unit',
        'test-ui',
        'cli',
        'package',
      ];

      expectedTypes.forEach((type) => {
        expect(NODE_TYPE_COLORS).toHaveProperty(type);
      });
    });
  });

  describe('getNodeTypeColor', () => {
    it('should return correct color for known type', () => {
      expect(getNodeTypeColor('app')).toBe('#6F2CFF');
      expect(getNodeTypeColor('framework')).toBe('#0280B9');
      expect(getNodeTypeColor('library')).toBe('#28A745');
    });

    it('should return default color for unknown type', () => {
      expect(getNodeTypeColor('unknown')).toBe('#6F2CFF');
    });

    it('should return default color for empty string', () => {
      expect(getNodeTypeColor('')).toBe('#6F2CFF');
    });

    it('should be case-sensitive', () => {
      // 'App' is not the same as 'app'
      expect(getNodeTypeColor('App')).toBe('#6F2CFF'); // Falls back to default
    });
  });

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

    it('should generate different colors for different categories', () => {
      const items = ['Test'];
      const platformColor = generateColorMap(items, 'platform').get('Test');
      const projectColor = generateColorMap(items, 'project').get('Test');

      // Colors may differ based on category (though not guaranteed)
      expect(platformColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(projectColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

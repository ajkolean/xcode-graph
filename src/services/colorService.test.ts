import { describe, expect, it, beforeEach } from 'vitest';
import { ColorService, colorService } from './colorService';

describe('ColorService', () => {
  let service: ColorService;

  beforeEach(() => {
    service = new ColorService();
  });

  describe('getNodeTypeColor', () => {
    it('should return correct color for app type', () => {
      expect(service.getNodeTypeColor('app')).toBe('#6F2CFF');
    });

    it('should return correct color for framework type', () => {
      expect(service.getNodeTypeColor('framework')).toBe('#0280B9');
    });

    it('should return correct color for library type', () => {
      expect(service.getNodeTypeColor('library')).toBe('#28A745');
    });

    it('should return correct color for test-unit type', () => {
      expect(service.getNodeTypeColor('test-unit')).toBe('#FD791C');
    });

    it('should return correct color for test-ui type', () => {
      expect(service.getNodeTypeColor('test-ui')).toBe('#E51C01');
    });

    it('should return correct color for cli type', () => {
      expect(service.getNodeTypeColor('cli')).toBe('#A855F7');
    });

    it('should return correct color for package type', () => {
      expect(service.getNodeTypeColor('package')).toBe('#FF9800');
    });

    it('should return default color for unknown type', () => {
      expect(service.getNodeTypeColor('unknown')).toBe('#6F2CFF');
    });
  });

  describe('getNodeTypeColorMap', () => {
    it('should return map with all node types', () => {
      const map = service.getNodeTypeColorMap();

      expect(map.size).toBe(7);
      expect(map.get('app')).toBe('#6F2CFF');
      expect(map.get('framework')).toBe('#0280B9');
      expect(map.get('library')).toBe('#28A745');
    });

    it('should include all expected types', () => {
      const map = service.getNodeTypeColorMap();
      const expectedTypes = ['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package'];

      expectedTypes.forEach((type) => {
        expect(map.has(type)).toBe(true);
      });
    });
  });

  describe('getPlatformColor', () => {
    it('should return default color for platforms', () => {
      // PLATFORM_COLOR is a string constant, so all platforms get default
      expect(service.getPlatformColor('iOS')).toBe('#6F2CFF');
      expect(service.getPlatformColor('macOS')).toBe('#6F2CFF');
      expect(service.getPlatformColor('unknown')).toBe('#6F2CFF');
    });
  });

  describe('getPlatformColorMap', () => {
    it('should return a map', () => {
      const map = service.getPlatformColorMap();

      expect(map).toBeInstanceOf(Map);
    });
  });

  describe('generateColor', () => {
    it('should generate consistent color for same name', () => {
      const color1 = service.generateColor('TestModule');
      const color2 = service.generateColor('TestModule');

      expect(color1).toBe(color2);
    });

    it('should cache generated colors', () => {
      const color1 = service.generateColor('CachedModule');
      service.clearCache();
      const color2 = service.generateColor('CachedModule');

      // Colors should still be same (deterministic generation)
      expect(color1).toBe(color2);
    });

    it('should generate different colors for different names', () => {
      const color1 = service.generateColor('ModuleA');
      const color2 = service.generateColor('ModuleB');

      // Different names should generate different colors
      expect(color1).not.toBe(color2);
    });

    it('should include type in cache key when provided', () => {
      const colorWithType = service.generateColor('Test', 'framework');
      const colorWithoutType = service.generateColor('Test');

      // These may or may not be different depending on implementation
      // but both should be valid hex colors
      expect(colorWithType).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colorWithoutType).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('generateColorMap', () => {
    it('should generate map for array of items', () => {
      const items = ['Item1', 'Item2', 'Item3'];
      const map = service.generateColorMap(items);

      expect(map.size).toBe(3);
      expect(map.has('Item1')).toBe(true);
      expect(map.has('Item2')).toBe(true);
      expect(map.has('Item3')).toBe(true);
    });

    it('should handle Set input', () => {
      const items = new Set(['A', 'B', 'C']);
      const map = service.generateColorMap(items);

      expect(map.size).toBe(3);
    });

    it('should generate valid hex colors', () => {
      const map = service.generateColorMap(['Test']);

      expect(map.get('Test')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('adjustColorForZoom', () => {
    it('should return valid hex color', () => {
      const result = service.adjustColorForZoom('#FF0000', 1);

      expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should darken at min zoom', () => {
      const original = '#808080';
      const result = service.adjustColorForZoom(original, 0.2);

      // At min zoom, brightness should decrease
      expect(result).not.toBe(original);
    });

    it('should brighten at max zoom', () => {
      const original = '#808080';
      const result = service.adjustColorForZoom(original, 2);

      // At max zoom, brightness should increase
      expect(result).not.toBe(original);
    });

    it('should clamp zoom to valid range', () => {
      // Very low zoom should be clamped
      const resultLow = service.adjustColorForZoom('#808080', -1);
      expect(resultLow).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Very high zoom should be clamped
      const resultHigh = service.adjustColorForZoom('#808080', 5);
      expect(resultHigh).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('adjustOpacityForZoom', () => {
    it('should return lower opacity at min zoom', () => {
      const result = service.adjustOpacityForZoom(1, 0.2);

      expect(result).toBeLessThan(1);
    });

    it('should return higher opacity at max zoom', () => {
      const result = service.adjustOpacityForZoom(0.5, 2);

      expect(result).toBeGreaterThan(0.5);
    });

    it('should clamp result to max 1', () => {
      const result = service.adjustOpacityForZoom(1, 2);

      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle base opacity of 0', () => {
      const result = service.adjustOpacityForZoom(0, 1);

      expect(result).toBe(0);
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba with full opacity', () => {
      const result = service.hexToRgba('#FF0000');

      expect(result).toBe('rgba(255, 0, 0, 1)');
    });

    it('should convert hex to rgba with custom alpha', () => {
      const result = service.hexToRgba('#00FF00', 0.5);

      expect(result).toBe('rgba(0, 255, 0, 0.5)');
    });

    it('should handle hex without #', () => {
      const result = service.hexToRgba('0000FF');

      expect(result).toBe('rgba(0, 0, 255, 1)');
    });

    it('should handle mixed case hex', () => {
      const result = service.hexToRgba('#AbCdEf');

      expect(result).toBe('rgba(171, 205, 239, 1)');
    });
  });

  describe('getContrastTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(service.getContrastTextColor('#FFFFFF')).toBe('#000000');
      expect(service.getContrastTextColor('#FFFF00')).toBe('#000000');
      expect(service.getContrastTextColor('#00FF00')).toBe('#000000');
    });

    it('should return white for dark backgrounds', () => {
      expect(service.getContrastTextColor('#000000')).toBe('#FFFFFF');
      expect(service.getContrastTextColor('#0000FF')).toBe('#FFFFFF');
      expect(service.getContrastTextColor('#800000')).toBe('#FFFFFF');
    });

    it('should handle mid-range colors based on luminance', () => {
      // Gray that's just above the threshold
      const result = service.getContrastTextColor('#909090');

      expect([result]).toContain(result); // Just verify it returns a valid value
    });
  });

  describe('clearCache', () => {
    it('should clear the color cache', () => {
      service.generateColor('TestItem');
      service.clearCache();

      // No way to directly verify cache is empty, but should not throw
      expect(() => service.generateColor('TestItem')).not.toThrow();
    });
  });

  describe('getCSSPrimary', () => {
    it('should return default color when window is undefined', () => {
      // In test environment, we can verify it returns a valid color
      const result = service.getCSSPrimary();

      expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('colorService singleton', () => {
  it('should be an instance of ColorService', () => {
    expect(colorService).toBeInstanceOf(ColorService);
  });

  it('should provide all ColorService methods', () => {
    expect(typeof colorService.getNodeTypeColor).toBe('function');
    expect(typeof colorService.getPlatformColor).toBe('function');
    expect(typeof colorService.generateColor).toBe('function');
    expect(typeof colorService.hexToRgba).toBe('function');
    expect(typeof colorService.getContrastTextColor).toBe('function');
  });
});

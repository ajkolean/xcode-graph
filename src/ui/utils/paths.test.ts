import { describe, expect, it } from 'vitest';
import { generateBezierPath, generatePortRoutedPath, generateWaypointPath } from './paths';

describe('paths', () => {
  describe('generateBezierPath', () => {
    it('generates a cubic bezier path string', () => {
      const path = generateBezierPath(0, 0, 200, 100);
      expect(path).toMatch(/^M /);
      expect(path).toContain('C');
    });

    it('returns cached result for same coordinates', () => {
      const path1 = generateBezierPath(10, 20, 30, 40);
      const path2 = generateBezierPath(10, 20, 30, 40);
      expect(path1).toBe(path2);
    });

    it('uses rounded coordinates for cache hits', () => {
      const path1 = generateBezierPath(10.1, 20.2, 30.3, 40.4);
      const path2 = generateBezierPath(10.4, 20.1, 30.2, 40.3);
      expect(path1).toBe(path2);
    });
  });

  describe('generateWaypointPath', () => {
    it('falls back to bezier when no waypoints', () => {
      const path = generateWaypointPath({ x: 0, y: 0 }, [], { x: 100, y: 100 });
      expect(path).toContain('C');
    });

    it('generates quadratic bezier with one waypoint', () => {
      const path = generateWaypointPath({ x: 0, y: 0 }, [{ x: 50, y: 50 }], { x: 100, y: 100 });
      expect(path).toContain('Q');
    });

    it('chains quadratic curves with multiple waypoints', () => {
      const path = generateWaypointPath(
        { x: 0, y: 0 },
        [
          { x: 30, y: 30 },
          { x: 60, y: 60 },
          { x: 90, y: 90 },
        ],
        { x: 120, y: 120 },
      );
      expect(path).toContain('Q');
      expect(path).toMatch(/^M /);
    });

    it('handles two waypoints', () => {
      const path = generateWaypointPath(
        { x: 0, y: 0 },
        [
          { x: 50, y: 20 },
          { x: 80, y: 60 },
        ],
        { x: 100, y: 100 },
      );
      expect(path).toMatch(/^M /);
      expect(path).toContain('Q');
    });
  });

  describe('generatePortRoutedPath', () => {
    it('generates path with no waypoints', () => {
      const path = generatePortRoutedPath(
        { x: 10, y: 10 },
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 290, y: 90 },
        [],
        { x: 0, y: 0 },
        { x: 300, y: 100 },
      );
      expect(path).toMatch(/^M /);
      expect(path).toContain('C');
      expect(path).toContain('L');
    });

    it('generates path with waypoints', () => {
      const path = generatePortRoutedPath(
        { x: 10, y: 10 },
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 290, y: 90 },
        [{ x: 150, y: 30 }],
        { x: 0, y: 0 },
        { x: 300, y: 100 },
      );
      expect(path).toMatch(/^M /);
      expect(path).toContain('C');
    });

    it('accepts custom curvature option', () => {
      const path = generatePortRoutedPath(
        { x: 10, y: 10 },
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 290, y: 90 },
        [],
        { x: 0, y: 0 },
        { x: 300, y: 100 },
        { curvature: 0.5 },
      );
      expect(path).toMatch(/^M /);
    });
  });
});

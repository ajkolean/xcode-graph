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

  describe('generateBezierPath cache eviction', () => {
    it('should evict oldest entries when cache exceeds MAX_CACHE_SIZE', () => {
      // Generate 1001 unique paths to exceed the 1000-entry cache
      for (let i = 0; i < 1001; i++) {
        // Use sufficiently different coordinates so they don't round to same key
        generateBezierPath(i * 10, 0, i * 10 + 100, 100);
      }

      // Generate another path; this confirms the cache didn't crash
      // and still works after eviction
      const path = generateBezierPath(99999, 0, 100099, 100);
      expect(path).toMatch(/^M /);
      expect(path).toContain('C');
    });
  });

  describe('generateWaypointPath middle segments', () => {
    it('should exercise the middle segment branch with 4+ waypoints', () => {
      // 4 waypoints = points.length = 6, so the loop for i = 2,3 hits the else (middle) branch
      const path = generateWaypointPath(
        { x: 0, y: 0 },
        [
          { x: 20, y: 10 },
          { x: 40, y: 30 },
          { x: 60, y: 50 },
          { x: 80, y: 70 },
        ],
        { x: 100, y: 100 },
      );
      expect(path).toMatch(/^M /);
      // Should contain multiple Q commands for chained quadratic curves
      const qCount = (path.match(/Q /g) || []).length;
      expect(qCount).toBeGreaterThanOrEqual(3);
    });

    it('should handle 5 waypoints covering all branch paths', () => {
      // 5 waypoints = points.length = 7
      // i=1 → first segment, i=2,3,4 → middle segments, i=5 → last segment
      const path = generateWaypointPath(
        { x: 0, y: 0 },
        [
          { x: 15, y: 10 },
          { x: 30, y: 25 },
          { x: 50, y: 40 },
          { x: 70, y: 55 },
          { x: 85, y: 75 },
        ],
        { x: 100, y: 100 },
      );
      expect(path).toMatch(/^M /);
      const qCount = (path.match(/Q /g) || []).length;
      expect(qCount).toBeGreaterThanOrEqual(4);
    });

    it('should produce midpoint coordinates in middle segments', () => {
      // With 4 waypoints: points = [start, w1, w2, w3, w4, end]
      // Middle segment (i=2): Q w2.x,w2.y midAfter.x,midAfter.y
      // where midAfter = ((w2.x + w3.x)/2, (w2.y + w3.y)/2)
      const path = generateWaypointPath(
        { x: 0, y: 0 },
        [
          { x: 20, y: 0 },
          { x: 40, y: 0 },
          { x: 60, y: 0 },
          { x: 80, y: 0 },
        ],
        { x: 100, y: 0 },
      );
      // midpoint of w2(40,0) and w3(60,0) should be (50,0)
      expect(path).toContain('50,0');
    });
  });
});

/**
 * Tests for Viewport Culling Utilities
 */

import { describe, expect, it } from 'vitest';
import {
  calculateViewportBounds,
  cullEdges,
  cullNodes,
  estimateCullingRatio,
  isCircleInViewport,
  isLineInViewport,
  isPointInViewport,
  type Point,
} from './viewport';

describe('calculateViewportBounds', () => {
  it('should calculate correct bounds with no pan or zoom', () => {
    const bounds = calculateViewportBounds(1000, 800, 0, 0, 1, 100);

    expect(bounds.minX).toBe(-100);
    expect(bounds.maxX).toBe(1100);
    expect(bounds.minY).toBe(-100);
    expect(bounds.maxY).toBe(900);
  });

  it('should account for zoom level', () => {
    const bounds = calculateViewportBounds(1000, 800, 0, 0, 2, 0);

    // At 2x zoom, viewport shows half the area
    expect(bounds.maxX - bounds.minX).toBe(500);
    expect(bounds.maxY - bounds.minY).toBe(400);
  });

  it('should account for pan offset', () => {
    const bounds = calculateViewportBounds(1000, 800, -500, -400, 1, 0);

    expect(bounds.minX).toBe(500);
    expect(bounds.maxX).toBe(1500);
    expect(bounds.minY).toBe(400);
    expect(bounds.maxY).toBe(1200);
  });

  it('should include margin', () => {
    const withMargin = calculateViewportBounds(1000, 800, 0, 0, 1, 200);
    const withoutMargin = calculateViewportBounds(1000, 800, 0, 0, 1, 0);

    expect(withMargin.maxX - withMargin.minX).toBeGreaterThan(
      withoutMargin.maxX - withoutMargin.minX,
    );
  });
});

describe('isPointInViewport', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('should return true for points inside viewport', () => {
    expect(isPointInViewport({ x: 500, y: 400 }, bounds)).toBe(true);
    expect(isPointInViewport({ x: 0, y: 0 }, bounds)).toBe(true); // Edge
    expect(isPointInViewport({ x: 1000, y: 800 }, bounds)).toBe(true); // Edge
  });

  it('should return false for points outside viewport', () => {
    expect(isPointInViewport({ x: -10, y: 400 }, bounds)).toBe(false);
    expect(isPointInViewport({ x: 1100, y: 400 }, bounds)).toBe(false);
    expect(isPointInViewport({ x: 500, y: -10 }, bounds)).toBe(false);
    expect(isPointInViewport({ x: 500, y: 900 }, bounds)).toBe(false);
  });
});

describe('isLineInViewport', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('should return true if both endpoints are inside', () => {
    const start: Point = { x: 100, y: 100 };
    const end: Point = { x: 900, y: 700 };

    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('should return true if one endpoint is inside', () => {
    const start: Point = { x: 100, y: 100 };
    const end: Point = { x: 1500, y: 1000 }; // Outside

    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('should return true if line passes through viewport', () => {
    const start: Point = { x: -100, y: 400 }; // Left of viewport
    const end: Point = { x: 1100, y: 400 }; // Right of viewport

    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('should return false if line is completely outside', () => {
    const start: Point = { x: -200, y: -200 };
    const end: Point = { x: -100, y: -100 };

    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });

  it('should return false for lines parallel to viewport but outside', () => {
    const start: Point = { x: 1100, y: 100 }; // Right of viewport
    const end: Point = { x: 1100, y: 700 };

    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });

  it('should handle diagonal lines correctly', () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 1000, y: 800 };

    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });
});

describe('isCircleInViewport', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('should return true for circles inside viewport', () => {
    expect(isCircleInViewport({ x: 500, y: 400 }, 50, bounds)).toBe(true);
  });

  it('should return true for circles partially in viewport', () => {
    // Circle center outside but radius extends into viewport
    expect(isCircleInViewport({ x: -40, y: 400 }, 50, bounds)).toBe(true);
    expect(isCircleInViewport({ x: 1040, y: 400 }, 50, bounds)).toBe(true);
  });

  it('should return false for circles completely outside', () => {
    expect(isCircleInViewport({ x: -200, y: 400 }, 50, bounds)).toBe(false);
    expect(isCircleInViewport({ x: 1200, y: 400 }, 50, bounds)).toBe(false);
    expect(isCircleInViewport({ x: 500, y: -200 }, 50, bounds)).toBe(false);
    expect(isCircleInViewport({ x: 500, y: 1200 }, 50, bounds)).toBe(false);
  });
});

describe('cullEdges', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('should keep visible edges', () => {
    const edges = [
      { source: { x: 100, y: 100 }, target: { x: 900, y: 700 }, id: '1' }, // Visible
      { source: { x: 500, y: 400 }, target: { x: 600, y: 500 }, id: '2' }, // Visible
      { source: { x: -200, y: -200 }, target: { x: -100, y: -100 }, id: '3' }, // Not visible
    ];

    const visible = cullEdges(edges, bounds);

    expect(visible).toHaveLength(2);
    expect(visible.some((e) => e.id === '1')).toBe(true);
    expect(visible.some((e) => e.id === '2')).toBe(true);
    expect(visible.some((e) => e.id === '3')).toBe(false);
  });

  it('should handle empty edge list', () => {
    const visible = cullEdges([], bounds);
    expect(visible).toHaveLength(0);
  });

  it('should keep edges that pass through viewport', () => {
    const edges = [
      {
        source: { x: -100, y: 400 },
        target: { x: 1100, y: 400 },
        id: 'through',
      },
    ];

    const visible = cullEdges(edges, bounds);
    expect(visible).toHaveLength(1);
  });
});

describe('cullNodes', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };
  const radius = 50;

  it('should keep visible nodes', () => {
    const nodes = [
      { x: 500, y: 400, id: '1' }, // Visible
      { x: -200, y: 400, id: '2' }, // Not visible
      { x: 1200, y: 400, id: '3' }, // Not visible
    ];

    const visible = cullNodes(nodes, radius, bounds);

    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe('1');
  });

  it('should keep nodes partially in viewport', () => {
    const nodes = [
      { x: -40, y: 400, id: 'partial' }, // Partially in (radius 50)
    ];

    const visible = cullNodes(nodes, radius, bounds);
    expect(visible).toHaveLength(1);
  });
});

describe('estimateCullingRatio', () => {
  it('should calculate culling ratio', () => {
    const stats = estimateCullingRatio(1000, 200);

    expect(stats.ratio).toBe(5); // 5x improvement
    expect(stats.percentageSaved).toBe(80); // 80% elements saved
  });

  it('should handle no culling', () => {
    const stats = estimateCullingRatio(1000, 1000);

    expect(stats.ratio).toBe(1);
    expect(stats.percentageSaved).toBe(0);
  });

  it('should handle edge case of zero viewport elements', () => {
    const stats = estimateCullingRatio(1000, 0);

    expect(stats.ratio).toBeGreaterThan(0);
    expect(stats.percentageSaved).toBe(100);
  });
});

describe('Performance', () => {
  it('should cull large edge lists quickly', () => {
    const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };
    const largeEdgeList = [];

    for (let i = 0; i < 10000; i++) {
      largeEdgeList.push({
        source: { x: Math.random() * 5000 - 1000, y: Math.random() * 5000 - 1000 },
        target: { x: Math.random() * 5000 - 1000, y: Math.random() * 5000 - 1000 },
        id: `edge-${i}`,
      });
    }

    const start = Date.now();
    const visible = cullEdges(largeEdgeList, bounds);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100); // Should be fast
    expect(visible.length).toBeLessThan(largeEdgeList.length); // Should cull some edges
  });
});

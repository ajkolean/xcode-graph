/**
 * Tests for Viewport Culling Utilities
 */

import { describe, expect, it } from 'vitest';
import {
  type BoundingBox,
  calculateViewportBounds,
  cullEdges,
  cullNodes,
  estimateCullingRatio,
  isBoundingBoxInViewport,
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

// ---------------------------------------------------------------------------
// Cohen-Sutherland branch coverage
// ---------------------------------------------------------------------------

describe('Cohen-Sutherland outcode and clipping branches', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('clips line entering from the TOP (y > maxY)', () => {
    // Both endpoints outside, line crosses top boundary into viewport
    // Start above-left, end above-right → line crosses top
    const start: Point = { x: -100, y: 900 }; // LEFT | TOP
    const end: Point = { x: 1100, y: 900 }; // RIGHT | TOP
    // Both share TOP outcode → outcode0 & outcode1 != 0 → trivially rejected
    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });

  it('clips line entering from the BOTTOM (y < minY)', () => {
    // Line from below viewport crossing through
    const start: Point = { x: 500, y: -100 }; // BOTTOM
    const end: Point = { x: 500, y: 500 }; // Inside (detected by isPointInViewport shortcut)
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('clips line entering from the LEFT (x < minX)', () => {
    // Start to the left, end inside
    const start: Point = { x: -100, y: 400 }; // LEFT
    const end: Point = { x: 500, y: 400 }; // Inside
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('clips line entering from the RIGHT (x > maxX)', () => {
    const start: Point = { x: 1100, y: 400 }; // RIGHT
    const end: Point = { x: 500, y: 400 }; // Inside
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line crossing TOP boundary diagonally (both endpoints outside)', () => {
    // Start: left of viewport and above → LEFT | TOP
    // End: right of viewport and inside-y → RIGHT
    // Forces clipToBoundary to handle TOP then RIGHT
    const start: Point = { x: -200, y: 1000 }; // LEFT | TOP
    const end: Point = { x: 1200, y: 400 }; // RIGHT
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line crossing BOTTOM boundary diagonally (both endpoints outside)', () => {
    // Start below-left, end to the right
    const start: Point = { x: -200, y: -200 }; // LEFT | BOTTOM
    const end: Point = { x: 1200, y: 400 }; // RIGHT
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line crossing through viewport from LEFT to RIGHT', () => {
    // Neither endpoint inside, both outside on opposite sides
    const start: Point = { x: -200, y: 400 }; // LEFT
    const end: Point = { x: 1200, y: 400 }; // RIGHT
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line from BOTTOM to TOP passing through viewport', () => {
    const start: Point = { x: 500, y: -200 }; // BOTTOM
    const end: Point = { x: 500, y: 1000 }; // TOP
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('rejects line entirely in BOTTOM-LEFT quadrant', () => {
    const start: Point = { x: -200, y: -200 }; // LEFT | BOTTOM
    const end: Point = { x: -100, y: -100 }; // LEFT | BOTTOM
    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });

  it('rejects line entirely in TOP-RIGHT quadrant', () => {
    const start: Point = { x: 1100, y: 900 }; // RIGHT | TOP
    const end: Point = { x: 1200, y: 1000 }; // RIGHT | TOP
    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });

  it('clips outcode0 when it is the non-zero outcode', () => {
    // Start outside (LEFT), end inside → outcodeOut = outcode0
    // Forces the outcode0 === outcodeOut branch
    const start: Point = { x: -50, y: 400 }; // LEFT
    const end: Point = { x: 500, y: 400 }; // Inside (shortcut via isPointInViewport)
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('clips outcode1 when start is inside but end is outside', () => {
    // This won't reach Cohen-Sutherland because isPointInViewport catches it
    // But let's verify the behavior is correct
    const start: Point = { x: 500, y: 400 }; // Inside
    const end: Point = { x: 1200, y: 400 }; // RIGHT
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles diagonal line from TOP-LEFT to BOTTOM-RIGHT through viewport', () => {
    // Both endpoints outside, diagonal through viewport
    const start: Point = { x: -100, y: 900 }; // LEFT | TOP
    const end: Point = { x: 1100, y: -100 }; // RIGHT | BOTTOM
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line from BOTTOM-LEFT corner outcode to TOP-RIGHT corner outcode', () => {
    const start: Point = { x: -100, y: -100 }; // LEFT | BOTTOM
    const end: Point = { x: 1100, y: 900 }; // RIGHT | TOP
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('handles line along the left boundary (x = minX)', () => {
    const start: Point = { x: 0, y: 100 };
    const end: Point = { x: 0, y: 700 };
    expect(isLineInViewport(start, end, bounds)).toBe(true);
  });

  it('rejects line parallel to left boundary but outside', () => {
    const start: Point = { x: -10, y: 100 }; // LEFT
    const end: Point = { x: -10, y: 700 }; // LEFT
    expect(isLineInViewport(start, end, bounds)).toBe(false);
  });
});

describe('isBoundingBoxInViewport edge cases', () => {
  const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 800 };

  it('rejects box entirely to the left', () => {
    const box: BoundingBox = { minX: -200, maxX: -100, minY: 300, maxY: 500 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(false);
  });

  it('rejects box entirely to the right', () => {
    const box: BoundingBox = { minX: 1100, maxX: 1200, minY: 300, maxY: 500 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(false);
  });

  it('rejects box entirely above', () => {
    const box: BoundingBox = { minX: 300, maxX: 500, minY: 900, maxY: 1000 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(false);
  });

  it('rejects box entirely below', () => {
    const box: BoundingBox = { minX: 300, maxX: 500, minY: -200, maxY: -100 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(false);
  });

  it('accepts box overlapping from the left', () => {
    const box: BoundingBox = { minX: -50, maxX: 50, minY: 300, maxY: 500 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(true);
  });

  it('accepts box fully contained in viewport', () => {
    const box: BoundingBox = { minX: 100, maxX: 200, minY: 100, maxY: 200 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(true);
  });

  it('accepts box that contains the viewport', () => {
    const box: BoundingBox = { minX: -100, maxX: 1100, minY: -100, maxY: 900 };
    expect(isBoundingBoxInViewport(box, bounds)).toBe(true);
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

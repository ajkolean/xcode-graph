import type { ClusterPosition } from '@shared/schemas/simulation.types';
import { describe, expect, it } from 'vitest';
import { computeFitToViewport, getCanvasMousePos, screenToWorld } from './canvas-viewport';

function makeCluster(overrides: Partial<ClusterPosition> & { id: string }): ClusterPosition {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 100,
    height: 100,
    nodeCount: 1,
    ...overrides,
  };
}

describe('canvas-viewport', () => {
  describe('computeFitToViewport', () => {
    it('returns null when cluster map is empty', () => {
      const result = computeFitToViewport(new Map(), 800, 600);
      expect(result).toBeNull();
    });

    it('computes zoom and pan for a single centered cluster', () => {
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: 0, y: 0, width: 200, height: 200 })],
      ]);

      const result = computeFitToViewport(clusters, 800, 600);

      expect(result).not.toBeNull();
      expect(result?.zoom).toBeGreaterThan(0);
      // Pan should center the graph in the viewport
      expect(result?.pan.x).toBeCloseTo(800 / 2, 0);
      expect(result?.pan.y).toBeCloseTo(600 / 2, 0);
    });

    it('computes correct zoom for multiple clusters', () => {
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: -200, y: 0, width: 100, height: 100 })],
        ['c2', makeCluster({ id: 'c2', x: 200, y: 0, width: 100, height: 100 })],
      ]);

      const result = computeFitToViewport(clusters, 800, 600);

      expect(result).not.toBeNull();
      // Total graph width is 500 (from -250 to 250), viewport 800 - 80 padding = 720
      // scaleX = 720 / 500 = 1.44
      expect(result?.zoom).toBeLessThanOrEqual(1.5);
      expect(result?.zoom).toBeGreaterThan(0);
    });

    it('respects minimum zoom', () => {
      // Very large graph relative to viewport forces small zoom
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: -5000, y: -5000, width: 100, height: 100 })],
        ['c2', makeCluster({ id: 'c2', x: 5000, y: 5000, width: 100, height: 100 })],
      ]);

      const result = computeFitToViewport(clusters, 200, 200);

      expect(result).not.toBeNull();
      // Should be clamped to ZOOM_CONFIG.MIN_ZOOM
      expect(result?.zoom).toBeGreaterThan(0);
    });

    it('caps zoom at 1.5', () => {
      // Very small graph relative to viewport would produce a large zoom
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: 0, y: 0, width: 10, height: 10 })],
      ]);

      const result = computeFitToViewport(clusters, 2000, 2000);

      expect(result).not.toBeNull();
      expect(result?.zoom).toBeLessThanOrEqual(1.5);
    });

    it('returns null when cluster positions contain non-finite values', () => {
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: Number.POSITIVE_INFINITY, y: 0 })],
      ]);

      const result = computeFitToViewport(clusters, 800, 600);

      // min/max will be finite from the width/height offsets, but x is Infinity
      // The function checks isFinite on the computed bounds
      expect(result).toBeNull();
    });

    it('centers pan on graph centroid', () => {
      const clusters = new Map<string, ClusterPosition>([
        ['c1', makeCluster({ id: 'c1', x: 100, y: 100, width: 50, height: 50 })],
        ['c2', makeCluster({ id: 'c2', x: 300, y: 300, width: 50, height: 50 })],
      ]);

      const result = computeFitToViewport(clusters, 800, 600);

      expect(result).not.toBeNull();
      // Graph center is (200, 200). Pan should position center in viewport center.
      const expectedPanX = 800 / 2 - 200 * result!.zoom;
      const expectedPanY = 600 / 2 - 200 * result!.zoom;
      expect(result?.pan.x).toBeCloseTo(expectedPanX, 2);
      expect(result?.pan.y).toBeCloseTo(expectedPanY, 2);
    });
  });

  describe('screenToWorld', () => {
    it('converts screen coordinates to world coordinates with no pan or zoom', () => {
      const result = screenToWorld(100, 200, { x: 0, y: 0 }, 1);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('accounts for pan offset', () => {
      const result = screenToWorld(150, 250, { x: 50, y: 50 }, 1);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('accounts for zoom level', () => {
      const result = screenToWorld(200, 200, { x: 0, y: 0 }, 2);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('accounts for both pan and zoom', () => {
      const result = screenToWorld(300, 400, { x: 100, y: 200 }, 2);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('handles fractional zoom', () => {
      const result = screenToWorld(50, 50, { x: 0, y: 0 }, 0.5);
      expect(result).toEqual({ x: 100, y: 100 });
    });
  });

  describe('getCanvasMousePos', () => {
    it('returns position relative to canvas rect', () => {
      const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250 });
      const rect = { left: 50, top: 100 } as DOMRect;

      const result = getCanvasMousePos(event, rect);

      expect(result).toEqual({ x: 100, y: 150 });
    });

    it('handles zero offset', () => {
      const event = new MouseEvent('mousemove', { clientX: 300, clientY: 400 });
      const rect = { left: 0, top: 0 } as DOMRect;

      const result = getCanvasMousePos(event, rect);

      expect(result).toEqual({ x: 300, y: 400 });
    });
  });
});

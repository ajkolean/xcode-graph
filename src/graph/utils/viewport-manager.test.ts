import type { ClusterPosition } from '@shared/schemas';
import { describe, expect, it } from 'vitest';
import { centerGraph, fitToViewport, getMousePos, screenToWorld } from './viewport-manager';

function makeRect(width: number, height: number): DOMRect {
  return {
    width,
    height,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    toJSON: () => ({}),
  } as DOMRect;
}

function makeClusterPos(id: string, x: number, y: number, size = 200): ClusterPosition {
  return { id, x, y, width: size, height: size, nodeCount: 3, vx: 0, vy: 0 };
}

describe('viewport-manager', () => {
  describe('screenToWorld', () => {
    it('converts screen coordinates to world coordinates', () => {
      const result = screenToWorld(150, 200, 50, 50, 2);
      expect(result.x).toBe(50);
      expect(result.y).toBe(75);
    });

    it('handles zoom=1 with zero pan', () => {
      const result = screenToWorld(100, 200, 0, 0, 1);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });
  });

  describe('centerGraph', () => {
    it('returns center of the rectangle', () => {
      const result = centerGraph(makeRect(800, 600));
      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });
  });

  describe('fitToViewport', () => {
    it('returns null for empty cluster positions', () => {
      const result = fitToViewport({
        rect: makeRect(800, 600),
        clusterPositions: new Map(),
      });
      expect(result).toBeNull();
    });

    it('computes zoom and pan for a single cluster', () => {
      const positions = new Map<string, ClusterPosition>([['A', makeClusterPos('A', 0, 0, 200)]]);
      const result = fitToViewport({
        rect: makeRect(800, 600),
        clusterPositions: positions,
      });

      expect(result).not.toBeNull();
      expect(result?.zoom).toBeGreaterThan(0);
      expect(Number.isFinite(result?.panX ?? Number.NaN)).toBe(true);
      expect(Number.isFinite(result?.panY ?? Number.NaN)).toBe(true);
    });

    it('computes a smaller zoom for larger graphs', () => {
      const small = new Map<string, ClusterPosition>([['A', makeClusterPos('A', 0, 0, 100)]]);
      const large = new Map<string, ClusterPosition>([
        ['A', makeClusterPos('A', -2000, -2000, 500)],
        ['B', makeClusterPos('B', 2000, 2000, 500)],
      ]);

      const smallResult = fitToViewport({ rect: makeRect(800, 600), clusterPositions: small });
      const largeResult = fitToViewport({ rect: makeRect(800, 600), clusterPositions: large });

      expect(smallResult).not.toBeNull();
      expect(largeResult).not.toBeNull();
      expect(largeResult?.zoom).toBeLessThan(smallResult?.zoom ?? 0);
    });

    it('centers the graph in the viewport', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', makeClusterPos('A', 100, 100, 200)],
      ]);
      const result = fitToViewport({
        rect: makeRect(800, 600),
        clusterPositions: positions,
      });

      expect(result).not.toBeNull();
      // Pan should offset the center (100, 100) to be at viewport center (400, 300)
      const worldCenterX = ((result?.panX ?? 0) - 400) / -(result?.zoom ?? 1);
      const worldCenterY = ((result?.panY ?? 0) - 300) / -(result?.zoom ?? 1);
      expect(Math.abs(worldCenterX - 100)).toBeLessThan(1);
      expect(Math.abs(worldCenterY - 100)).toBeLessThan(1);
    });

    it('returns null when cluster positions contain non-finite values', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', makeClusterPos('A', Number.NaN, Number.NaN, 200)],
      ]);
      const result = fitToViewport({
        rect: makeRect(800, 600),
        clusterPositions: positions,
      });
      expect(result).toBeNull();
    });
  });

  describe('getMousePos', () => {
    it('returns mouse position relative to canvas element', () => {
      const mockCanvas = {
        getBoundingClientRect: () => makeRect(800, 600),
      } as unknown as HTMLCanvasElement;
      const mockEvent = {
        clientX: 150,
        clientY: 250,
      } as MouseEvent;

      const pos = getMousePos(mockEvent, mockCanvas);
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(250);
    });

    it('offsets by canvas position', () => {
      const mockCanvas = {
        getBoundingClientRect: () =>
          ({
            ...makeRect(800, 600),
            left: 50,
            top: 100,
          }) as DOMRect,
      } as unknown as HTMLCanvasElement;
      const mockEvent = {
        clientX: 200,
        clientY: 300,
      } as MouseEvent;

      const pos = getMousePos(mockEvent, mockCanvas);
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(200);
    });
  });
});

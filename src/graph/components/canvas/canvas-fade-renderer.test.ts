import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import * as canvasPositions from '@graph/utils/canvas-positions';
import { NodeType, Origin, Platform } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';
import {
  FADE_OUT_DURATION,
  type FadeRenderContext,
  renderFadingNodes,
} from './canvas-fade-renderer';

function createNode(id: string, project = 'TestProject'): GraphNode {
  return {
    id,
    name: `Node-${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Internal,
    project,
    deploymentTargets: {},
    buildSettings: {},
  };
}

function createMockCtx(): CanvasRenderingContext2D {
  return {
    globalAlpha: 1,
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

function createRenderContext(overrides?: Partial<FadeRenderContext>): FadeRenderContext {
  return {
    ctx: createMockCtx(),
    theme: {
      canvasBg: '#000',
      tooltipBg: '#111',
      tooltipFg: '#fff',
      tooltipBorder: '#333',
      shadowColor: 'rgba(0,0,0,0.5)',
      cycleEdge: '#f00',
      nodeFramework: '#0EA5E9',
      nodeApp: '#F59E0B',
      nodeLibrary: '#8B5CF6',
      nodeTest: '#10B981',
      nodeCli: '#EC4899',
      nodePackage: '#06B6D4',
      clusterBg: '#1c1c1e',
      clusterBorder: '#333',
      clusterHoverBg: '#2a2a2c',
      clusterSelectedBorder: '#7c3aed',
      edgeDefault: '#555',
    },
    layout: {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
      routedEdges: undefined,
      cycleNodes: undefined,
    } as unknown as GraphLayoutController,
    zoom: 1,
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    getPathForNode: vi.fn(() => new Path2D()),
    ...overrides,
  };
}

describe('canvas-fade-renderer', () => {
  describe('FADE_OUT_DURATION', () => {
    it('is 250ms', () => {
      expect(FADE_OUT_DURATION).toBe(250);
    });
  });

  describe('renderFadingNodes', () => {
    it('does nothing when map is empty', () => {
      const ctx = createRenderContext();
      const map = new Map();

      renderFadingNodes(ctx, map);

      expect(ctx.ctx.save).not.toHaveBeenCalled();
    });

    it('removes nodes whose animation has completed', () => {
      const ctx = createRenderContext();
      const map = new Map([['n1', { node: createNode('n1'), startTime: performance.now() - 300 }]]);

      renderFadingNodes(ctx, map);

      expect(map.size).toBe(0);
    });

    it('removes nodes with no position', () => {
      vi.spyOn(canvasPositions, 'resolveNodeWorldPosition').mockReturnValue(undefined);

      const ctx = createRenderContext();
      const map = new Map([['n1', { node: createNode('n1'), startTime: performance.now() - 50 }]]);

      renderFadingNodes(ctx, map);

      expect(map.size).toBe(0);

      vi.restoreAllMocks();
    });

    it('renders nodes that are still fading', () => {
      vi.spyOn(canvasPositions, 'resolveNodeWorldPosition').mockReturnValue({ x: 10, y: 20 });

      const ctx = createRenderContext();
      const map = new Map([['n1', { node: createNode('n1'), startTime: performance.now() - 100 }]]);

      renderFadingNodes(ctx, map);

      // Node should still be in the map (still fading)
      expect(map.size).toBe(1);
      // Canvas context should have been used for drawing
      expect(ctx.ctx.save).toHaveBeenCalled();
      expect(ctx.ctx.restore).toHaveBeenCalled();
      expect(ctx.ctx.translate).toHaveBeenCalled();
      expect(ctx.getPathForNode).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('resets globalAlpha to 1.0 after rendering', () => {
      vi.spyOn(canvasPositions, 'resolveNodeWorldPosition').mockReturnValue({ x: 10, y: 20 });

      const ctx = createRenderContext();
      const map = new Map([['n1', { node: createNode('n1'), startTime: performance.now() - 100 }]]);

      renderFadingNodes(ctx, map);

      expect(ctx.ctx.globalAlpha).toBe(1.0);

      vi.restoreAllMocks();
    });

    it('sets partial alpha based on elapsed time', () => {
      vi.spyOn(canvasPositions, 'resolveNodeWorldPosition').mockReturnValue({ x: 0, y: 0 });

      const mockCtx = createMockCtx();
      const alphaValues: number[] = [];
      Object.defineProperty(mockCtx, 'globalAlpha', {
        get() {
          return this._alpha ?? 1;
        },
        set(val: number) {
          this._alpha = val;
          alphaValues.push(val);
        },
      });

      const ctx = createRenderContext({ ctx: mockCtx });
      const map = new Map([['n1', { node: createNode('n1'), startTime: performance.now() - 125 }]]);

      renderFadingNodes(ctx, map);

      // At 125ms / 250ms duration, alpha ≈ 0.5, multiplied by 0.5 → ~0.25
      const fadeAlpha = alphaValues.find((a) => a < 1 && a > 0);
      expect(fadeAlpha).toBeDefined();
      expect(fadeAlpha).toBeGreaterThan(0);
      expect(fadeAlpha).toBeLessThan(1);

      vi.restoreAllMocks();
    });

    it('handles multiple nodes with mixed states', () => {
      vi.spyOn(canvasPositions, 'resolveNodeWorldPosition').mockImplementation((nodeId: string) => {
        if (nodeId === 'n2') return undefined;
        return { x: 0, y: 0 };
      });

      const ctx = createRenderContext();
      const now = performance.now();
      const map = new Map([
        ['n1', { node: createNode('n1'), startTime: now - 300 }], // expired
        ['n2', { node: createNode('n2'), startTime: now - 50 }], // no position
        ['n3', { node: createNode('n3'), startTime: now - 50 }], // still fading
      ]);

      renderFadingNodes(ctx, map);

      // Only n3 should remain
      expect(map.size).toBe(1);
      expect(map.has('n3')).toBe(true);

      vi.restoreAllMocks();
    });
  });
});

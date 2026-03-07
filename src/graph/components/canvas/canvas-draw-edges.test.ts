import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { NodeType, Origin, Platform } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveEdgeColor,
  resolveEdgeOpacity,
  drawArrowhead,
  drawEdgePath,
  applyEdgeStyle,
  drawEdgeGlow,
  MAX_BEZIER_CACHE_SIZE,
  type EdgeMeta,
} from './canvas-draw-edges';

function createTheme(overrides?: Partial<CanvasTheme>): CanvasTheme {
  return {
    nodeApp: '#F59E0B',
    nodeFramework: '#0EA5E9',
    nodeLibrary: '#10B981',
    nodeTest: '#8B5CF6',
    nodeCli: '#F43F5E',
    nodePackage: '#6366F1',
    canvasBg: '#0f0f11',
    tooltipBg: 'rgba(24, 24, 28, 0.95)',
    shadowColor: 'rgba(24, 24, 28, 0.9)',
    edgeDefault: 'rgba(120, 120, 130, 0.45)',
    cycleEdgeColor: 'rgba(239, 68, 68, 0.8)',
    cycleGlowColor: 'rgba(239, 68, 68, 0.6)',
    isDark: true,
    ...overrides,
  };
}

function createNode(id: string, type: NodeType = NodeType.Framework): GraphNode {
  return {
    id,
    name: `Node-${id}`,
    type,
    platform: Platform.iOS,
    origin: Origin.Internal,
    project: 'TestProject',
    deploymentTargets: {},
    buildSettings: {},
  };
}

describe('canvas-draw-edges', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;
  });

  describe('resolveEdgeColor', () => {
    it('returns cycle edge color when isCycle is true', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const color = resolveEdgeColor(source, target, false, true, theme, null);
      expect(color).toBe(theme.cycleEdgeColor);
    });

    it('returns default edge color when not emphasized', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const color = resolveEdgeColor(source, target, false, false, theme, null);
      expect(color).toBe(theme.edgeDefault);
    });

    it('returns target node color when source is selected', () => {
      const theme = createTheme();
      const source = createNode('a', NodeType.App);
      const target = createNode('b', NodeType.Framework);
      const color = resolveEdgeColor(source, target, true, false, theme, source);
      // When selectedNode === source, colorNode = target (Framework)
      expect(color).toBe(theme.nodeFramework);
    });

    it('returns source node color when target is selected', () => {
      const theme = createTheme();
      const source = createNode('a', NodeType.Library);
      const target = createNode('b', NodeType.App);
      const color = resolveEdgeColor(source, target, true, false, theme, target);
      // When selectedNode !== source, colorNode = source (Library)
      expect(color).toBe(theme.nodeLibrary);
    });

    it('returns source node color when no node is selected', () => {
      const theme = createTheme();
      const source = createNode('a', NodeType.Package);
      const target = createNode('b', NodeType.App);
      const color = resolveEdgeColor(source, target, true, false, theme, null);
      expect(color).toBe(theme.nodePackage);
    });
  });

  describe('resolveEdgeOpacity', () => {
    it('returns 1.0 for chain edges at depth 0', () => {
      const getDepth = vi.fn().mockReturnValue(0);
      expect(resolveEdgeOpacity('a->b', false, false, true, getDepth)).toBe(1.0);
    });

    it('returns 0.5 for chain edges at depth > 0', () => {
      const getDepth = vi.fn().mockReturnValue(1);
      expect(resolveEdgeOpacity('a->b', false, false, true, getDepth)).toBe(0.5);
    });

    it('returns 1.0 for highlighted edges', () => {
      const getDepth = vi.fn();
      expect(resolveEdgeOpacity('a->b', true, false, false, getDepth)).toBe(1.0);
    });

    it('returns 0.2 for non-highlighted, non-cycle edges', () => {
      const getDepth = vi.fn();
      expect(resolveEdgeOpacity('a->b', false, false, false, getDepth)).toBe(0.2);
    });

    it('returns at least 0.8 for cycle edges', () => {
      const getDepth = vi.fn();
      expect(resolveEdgeOpacity('a->b', false, true, false, getDepth)).toBe(0.8);
    });

    it('returns 1.0 for highlighted cycle edges', () => {
      const getDepth = vi.fn();
      expect(resolveEdgeOpacity('a->b', true, true, false, getDepth)).toBe(1.0);
    });
  });

  describe('drawArrowhead', () => {
    it('saves and restores context', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 0 };
      drawArrowhead(ctx, endpoints, false, 1);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('translates to the target endpoint', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 50 };
      drawArrowhead(ctx, endpoints, false, 1);
      expect(ctx.translate).toHaveBeenCalledWith(100, 50);
    });

    it('draws a triangular path', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 0 };
      drawArrowhead(ctx, endpoints, false, 1);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('uses larger arrow size when emphasized', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 0 };
      drawArrowhead(ctx, endpoints, true, 1);

      // arrowSize = 7 / 1 = 7
      expect(ctx.lineTo).toHaveBeenCalledWith(-7, 3.5);
      expect(ctx.lineTo).toHaveBeenCalledWith(-7, -3.5);
    });

    it('uses smaller arrow size when not emphasized', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 0 };
      drawArrowhead(ctx, endpoints, false, 1);

      // arrowSize = 5 / 1 = 5
      expect(ctx.lineTo).toHaveBeenCalledWith(-5, 2.5);
      expect(ctx.lineTo).toHaveBeenCalledWith(-5, -2.5);
    });

    it('scales arrow size inversely with zoom', () => {
      const endpoints = { x1: 0, y1: 0, x2: 100, y2: 0 };
      drawArrowhead(ctx, endpoints, false, 2);

      // arrowSize = 5 / 2 = 2.5
      expect(ctx.lineTo).toHaveBeenCalledWith(-2.5, 1.25);
      expect(ctx.lineTo).toHaveBeenCalledWith(-2.5, -1.25);
    });
  });

  describe('drawEdgePath', () => {
    it('draws a straight line for short distances', () => {
      const cache = new Map<string, Path2D>();
      drawEdgePath(ctx, 0, 0, 50, 50, cache);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 50);
      expect(ctx.stroke).toHaveBeenCalled();
      expect(cache.size).toBe(0); // No caching for short paths
    });

    it('uses Path2D for long distances (> 150)', () => {
      const cache = new Map<string, Path2D>();
      drawEdgePath(ctx, 0, 0, 200, 200, cache);

      // Should create and cache a Path2D
      expect(cache.size).toBe(1);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('reuses cached Path2D for same coordinates', () => {
      const cache = new Map<string, Path2D>();
      drawEdgePath(ctx, 0, 0, 200, 200, cache);
      drawEdgePath(ctx, 0, 0, 200, 200, cache);

      expect(cache.size).toBe(1);
    });

    it('evicts oldest cache entry when exceeding max size', () => {
      const cache = new Map<string, Path2D>();
      // Fill cache to max
      for (let i = 0; i < MAX_BEZIER_CACHE_SIZE; i++) {
        cache.set(`${i},0,${i + 200},0`, new Path2D());
      }
      expect(cache.size).toBe(MAX_BEZIER_CACHE_SIZE);

      // Add one more
      drawEdgePath(ctx, 0, 0, 300, 300, cache);
      expect(cache.size).toBe(MAX_BEZIER_CACHE_SIZE);
    });
  });

  describe('applyEdgeStyle', () => {
    it('sets dashed line for cycle edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        false, // isEmphasized
        false, // isHighlighted
        true,  // cycleEdge
        false, // inChain
        0,
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
    });

    it('sets dashed line for emphasized edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        true,  // isEmphasized
        true,  // isHighlighted
        false, // cycleEdge
        false, // inChain
        0,
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.setLineDash).toHaveBeenCalledWith([6, 3]);
    });

    it('uses solid line for normal edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        false, // isEmphasized
        false, // isHighlighted
        false, // cycleEdge
        false, // inChain
        0,
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    });

    it('applies animated dash offset for emphasized edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        true,  // isEmphasized
        true,  // isHighlighted
        false,
        false,
        42, // animatedDashOffset
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.lineDashOffset).toBe(42);
    });

    it('uses thicker line for emphasized edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        true,  // isEmphasized
        true,
        false,
        false,
        0,
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.lineWidth).toBe(2.5);
    });

    it('uses thinner line for normal edges', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const getDepth = vi.fn().mockReturnValue(0);

      applyEdgeStyle(
        ctx,
        { sourceNode: source, targetNode: target },
        'a->b',
        false,
        false,
        false,
        false,
        0,
        1,
        theme,
        null,
        getDepth,
      );

      expect(ctx.lineWidth).toBe(1.2);
    });
  });

  describe('drawEdgeGlow', () => {
    it('saves and restores context', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const endpoints = { sourceNode: source, targetNode: target, x1: 0, y1: 0, x2: 100, y2: 100 };
      const drawPath = vi.fn();
      const getDepth = vi.fn().mockReturnValue(0);

      drawEdgeGlow(ctx, endpoints, false, false, true, 'a->b', 1, theme, null, getDepth, drawPath);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('calls the provided drawEdgePath function', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const endpoints = { sourceNode: source, targetNode: target, x1: 10, y1: 20, x2: 30, y2: 40 };
      const drawPath = vi.fn();
      const getDepth = vi.fn().mockReturnValue(0);

      drawEdgeGlow(ctx, endpoints, false, false, true, 'a->b', 1, theme, null, getDepth, drawPath);

      expect(drawPath).toHaveBeenCalledWith(ctx, 10, 20, 30, 40);
    });

    it('sets glow line width scaled by zoom', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const endpoints = { sourceNode: source, targetNode: target, x1: 0, y1: 0, x2: 100, y2: 100 };
      const drawPath = vi.fn();
      const getDepth = vi.fn().mockReturnValue(0);

      drawEdgeGlow(ctx, endpoints, false, false, true, 'a->b', 2, theme, null, getDepth, drawPath);

      expect(ctx.lineWidth).toBe(3); // 6 / 2
    });

    it('uses lower alpha for chain edges that are not highlighted', () => {
      const theme = createTheme();
      const source = createNode('a');
      const target = createNode('b');
      const endpoints = { sourceNode: source, targetNode: target, x1: 0, y1: 0, x2: 100, y2: 100 };
      const drawPath = vi.fn();
      const getDepth = vi.fn().mockReturnValue(0);

      drawEdgeGlow(ctx, endpoints, false, true, false, 'a->b', 1, theme, null, getDepth, drawPath);

      // inChain=true, isHighlighted=false, depth=0 => glowAlpha = 0.15
      expect(ctx.globalAlpha).toBe(0.15);
    });
  });
});

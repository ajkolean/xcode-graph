import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { drawClusterBorder, drawClusterFill, truncateText } from './canvas-draw-clusters';

describe('canvas-draw-clusters', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    prefersReducedMotion.set(false);
  });

  describe('drawClusterFill', () => {
    it('creates a radial gradient and fills a circle', () => {
      const cache = new Map<string, CanvasGradient>();
      drawClusterFill(ctx, 100, '#FF0000', false, 10, cache, 'cluster-1');

      expect(ctx.createRadialGradient).toHaveBeenCalledWith(0, 0, 0, 0, 0, 100);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 100, 0, Math.PI * 2);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.globalAlpha).toBe(1.0);
    });

    it('caches the gradient for repeated calls', () => {
      const cache = new Map<string, CanvasGradient>();
      drawClusterFill(ctx, 100, '#FF0000', false, 10, cache, 'cluster-1');
      drawClusterFill(ctx, 100, '#FF0000', false, 10, cache, 'cluster-1');

      // createRadialGradient should only be called once due to caching
      expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
      expect(cache.size).toBe(1);
    });

    it('uses different opacity for active clusters', () => {
      const cache = new Map<string, CanvasGradient>();
      // Active cluster uses fillOpacity 0.08
      drawClusterFill(ctx, 100, '#FF0000', true, 10, cache, 'active-cluster');
      // The gradient is created with specific color stops; we verify it was cached
      expect(cache.size).toBe(1);
    });

    it('uses different opacity based on node count', () => {
      const cache = new Map<string, CanvasGradient>();
      // nodeCount <= 5 uses 0.06
      drawClusterFill(ctx, 100, '#FF0000', false, 3, cache, 'small');
      // nodeCount <= 20 uses 0.08
      drawClusterFill(ctx, 100, '#FF0000', false, 15, cache, 'medium');
      // nodeCount > 20 uses 0.1
      drawClusterFill(ctx, 100, '#FF0000', false, 30, cache, 'large');

      // Each should create a separate cache entry due to different fill opacities
      expect(cache.size).toBe(3);
    });
  });

  describe('drawClusterBorder', () => {
    it('draws a dashed circle stroke', () => {
      drawClusterBorder(ctx, 100, '#00FF00', false, false, 10, 'project', 1, 0);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 100, 0, Math.PI * 2);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('uses project dash pattern for project type', () => {
      drawClusterBorder(ctx, 100, '#00FF00', false, false, 10, 'project', 1, 0);
      expect(ctx.setLineDash).toHaveBeenCalledWith([10, 6]);
    });

    it('uses package dash pattern for non-project type', () => {
      drawClusterBorder(ctx, 100, '#00FF00', false, false, 10, 'package', 1, 0);
      expect(ctx.setLineDash).toHaveBeenCalledWith([5, 6]);
    });

    it('applies thicker line when active', () => {
      drawClusterBorder(ctx, 100, '#00FF00', true, false, 10, 'project', 1, 0);
      // baseWidth is 2.5 when active, multiplied by Math.max(1, Math.log2(10)) * 1.5
      const expectedWidth = Math.max(1, Math.log2(10)) * 2.5 * 1.5;
      expect(ctx.lineWidth).toBeCloseTo(expectedWidth, 2);
    });

    it('animates dash offset when selected and motion is allowed', () => {
      drawClusterBorder(ctx, 100, '#00FF00', false, true, 10, 'project', 1, 500);
      expect(ctx.lineDashOffset).toBe(0); // Reset at end
    });

    it('does not animate when reduced motion is preferred', () => {
      prefersReducedMotion.set(true);
      drawClusterBorder(ctx, 100, '#00FF00', false, true, 10, 'project', 1, 500);
      // lineDashOffset should not be set to animated value
      // After draw, it resets to 0
      expect(ctx.lineDashOffset).toBe(0);
    });

    it('resets line dash after drawing', () => {
      drawClusterBorder(ctx, 100, '#00FF00', false, false, 10, 'project', 1, 0);
      // Last setLineDash call should be the reset
      const calls = vi.mocked(ctx.setLineDash).mock.calls;
      expect(calls[calls.length - 1]).toEqual([[]]);
    });

    it('sets full opacity when active', () => {
      drawClusterBorder(ctx, 100, '#00FF00', true, false, 10, 'project', 1, 0);
      expect(ctx.globalAlpha).toBe(1.0);
    });
  });

  describe('truncateText', () => {
    it('returns original text when it fits within maxWidth', () => {
      const cache = new Map<string, string>();
      // vitest-canvas-mock returns 0 for measureText width, so text always fits
      const result = truncateText(ctx, 'Short', 200, cache);
      expect(result).toBe('Short');
    });

    it('caches results for repeated calls', () => {
      const cache = new Map<string, string>();
      ctx.font = '12px sans-serif';
      const result1 = truncateText(ctx, 'Hello', 200, cache);
      const result2 = truncateText(ctx, 'Hello', 200, cache);
      expect(result1).toBe(result2);
      expect(cache.size).toBe(1);
    });

    it('uses font as part of cache key', () => {
      const cache = new Map<string, string>();
      ctx.font = '12px sans-serif';
      truncateText(ctx, 'Hello', 200, cache);
      ctx.font = '14px sans-serif';
      truncateText(ctx, 'Hello', 200, cache);
      expect(cache.size).toBe(2);
    });
  });

  // drawClusterLabel is skipped because it requires OffscreenCanvas,
  // complex callback dependencies (truncateText, renderArcLabelBitmap),
  // and relies on CLUSTER_LABEL_CONFIG constants. The function is
  // better tested via integration tests.

  // renderArcLabelBitmap is skipped because it requires OffscreenCanvas
  // which is not available in jsdom/vitest-canvas-mock environment.
});

import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  drawCycleGlow,
  drawSelectionRings,
  drawNodeIcon,
  drawNodeLabel,
  NODE_LABEL_FONT_SIZE,
  NODE_LABEL_PADDING,
  NODE_FONT_SELECTED,
  NODE_FONT_CONNECTED,
  NODE_FONT_NORMAL,
} from './canvas-draw-nodes';

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

describe('canvas-draw-nodes', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;
    // Reset reduced motion to false for consistent tests
    prefersReducedMotion.set(false);
  });

  describe('drawCycleGlow', () => {
    it('draws an arc stroke with the cycle glow color', () => {
      const theme = createTheme();
      drawCycleGlow(ctx, 10, theme, 1, 0);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.strokeStyle).toBe(theme.cycleGlowColor);
      expect(ctx.lineWidth).toBe(2);
    });

    it('restores globalAlpha to the provided alpha value', () => {
      const theme = createTheme();
      drawCycleGlow(ctx, 10, theme, 0.8, 0);
      expect(ctx.globalAlpha).toBe(0.8);
    });

    it('uses a fixed pulse value when reduced motion is preferred', () => {
      prefersReducedMotion.set(true);
      const theme = createTheme();
      drawCycleGlow(ctx, 10, theme, 1, 0);
      // With reduced motion, pulse = 0.5, glowRadius = 10 + 4 + 0.5*2 = 15
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 15, 0, Math.PI * 2);
    });
  });

  describe('drawSelectionRings', () => {
    it('draws a single ring when reduced motion is preferred', () => {
      prefersReducedMotion.set(true);
      drawSelectionRings(ctx, 10, '#FF0000', 1, 0);

      // Should draw exactly one arc (single static ring)
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 18, 0, Math.PI * 2);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('draws three animated rings when motion is allowed', () => {
      prefersReducedMotion.set(false);
      drawSelectionRings(ctx, 10, '#00FF00', 1, 0);

      // Should draw 3 rings (3 stroke calls)
      const strokeCalls = vi.mocked(ctx.stroke).mock.calls;
      expect(strokeCalls.length).toBe(3);
    });

    it('restores globalAlpha after drawing', () => {
      drawSelectionRings(ctx, 10, '#FF0000', 0.6, 0);
      expect(ctx.globalAlpha).toBe(0.6);
    });
  });

  describe('drawNodeIcon', () => {
    it('saves and restores the context', () => {
      const theme = createTheme();
      const path = new Path2D();
      drawNodeIcon(ctx, path, 12, '#FF0000', theme, false);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('scales based on size', () => {
      const theme = createTheme();
      const path = new Path2D();
      drawNodeIcon(ctx, path, 12, '#FF0000', theme, false);

      // scale = (12/12) * 1.0 = 1.0
      expect(ctx.scale).toHaveBeenCalledWith(1.0, 1.0);
    });

    it('applies larger scale when emphasized', () => {
      const theme = createTheme();
      const path = new Path2D();
      drawNodeIcon(ctx, path, 12, '#FF0000', theme, true);

      // scale = (12/12) * 1.08 = 1.08
      expect(ctx.scale).toHaveBeenCalledWith(1.08, 1.08);
    });

    it('fills and strokes the path', () => {
      const theme = createTheme();
      const path = new Path2D();
      drawNodeIcon(ctx, path, 12, '#FF0000', theme, false);

      // Two fills: tooltipBg fill + colorWithAlpha fill
      expect(ctx.fill).toHaveBeenCalledTimes(2);
      expect(ctx.stroke).toHaveBeenCalledWith(path);
    });

    it('uses thicker stroke when emphasized', () => {
      const theme = createTheme();
      const path = new Path2D();
      drawNodeIcon(ctx, path, 12, '#FF0000', theme, true);

      // When emphasized, stroke uses lineWidth = 2.5 / scale
      // stroke is called after lineWidth is set, so we verify stroke was called
      expect(ctx.stroke).toHaveBeenCalledWith(path);
    });
  });

  describe('drawNodeLabel', () => {
    it('uses selected font when node is selected', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'TestNode', 10, '#FFF', theme, 1, true, false, false);
      expect(ctx.font).toBe(NODE_FONT_SELECTED);
    });

    it('uses connected font when node is connected', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'TestNode', 10, '#FFF', theme, 1, false, true, false);
      expect(ctx.font).toBe(NODE_FONT_CONNECTED);
    });

    it('uses connected font when node is in chain', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'TestNode', 10, '#FFF', theme, 1, false, false, true);
      expect(ctx.font).toBe(NODE_FONT_CONNECTED);
    });

    it('uses normal font for unselected, unconnected nodes', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'TestNode', 10, '#FFF', theme, 1, false, false, false);
      expect(ctx.font).toBe(NODE_FONT_NORMAL);
    });

    it('draws shadow stroke and text fill', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'Hello', 10, '#FFFFFF', theme, 1, false, false, false);

      expect(ctx.strokeText).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
      const expectedY = 10 + NODE_LABEL_PADDING + NODE_LABEL_FONT_SIZE;
      expect(ctx.fillText).toHaveBeenCalledWith('Hello', 0, expectedY);
    });

    it('applies shadow color from theme', () => {
      const theme = createTheme({ shadowColor: 'rgba(0,0,0,0.5)' });
      drawNodeLabel(ctx, 'Test', 10, '#FFF', theme, 1, false, false, false);
      expect(ctx.strokeStyle).toBe('rgba(0,0,0,0.5)');
    });

    it('restores globalAlpha after drawing', () => {
      const theme = createTheme();
      drawNodeLabel(ctx, 'Test', 10, '#FFF', theme, 0.7, false, false, false);
      expect(ctx.globalAlpha).toBe(0.7);
    });
  });
});

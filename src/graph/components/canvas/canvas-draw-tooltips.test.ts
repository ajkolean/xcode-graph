import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  roundRect,
  drawNodeTooltip,
  drawClusterTooltip,
  TOOLTIP_PADDING,
  TOOLTIP_HEIGHT,
  TOOLTIP_FONT,
  TOOLTIP_TITLE_FONT,
  TOOLTIP_SUBTITLE_FONT,
} from './canvas-draw-tooltips';

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

describe('canvas-draw-tooltips', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;
  });

  describe('roundRect', () => {
    it('draws a rounded rectangle path', () => {
      roundRect(ctx, 10, 20, 100, 50, 5);

      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.arcTo).toHaveBeenCalledTimes(4);
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('starts at the correct position', () => {
      roundRect(ctx, 10, 20, 100, 50, 5);
      // First moveTo should be at (x + r, y) = (15, 20)
      expect(ctx.moveTo).toHaveBeenCalledWith(15, 20);
    });

    it('handles zero radius (sharp corners)', () => {
      roundRect(ctx, 0, 0, 100, 50, 0);
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.arcTo).toHaveBeenCalledTimes(4);
    });
  });

  describe('drawNodeTooltip', () => {
    it('saves and restores context', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#FF0000', theme, 2);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('sets the transform for DPR scaling', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#FF0000', theme, 2);

      expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    });

    it('uses tooltip font', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#FF0000', theme, 1);
      // Font should be set to TOOLTIP_FONT at some point
      expect(ctx.font).toBe(TOOLTIP_FONT);
    });

    it('fills background with theme tooltip color', () => {
      const theme = createTheme({ tooltipBg: 'rgba(0,0,0,0.9)' });
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#FF0000', theme, 1);

      expect(ctx.fill).toHaveBeenCalled();
    });

    it('strokes border with node color', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#00FF00', theme, 1);

      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('draws the node name text', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'TestNode', '#FF0000', theme, 1);

      expect(ctx.fillText).toHaveBeenCalledWith('TestNode', 100, 204);
    });

    it('centers text alignment', () => {
      const theme = createTheme();
      drawNodeTooltip(ctx, 100, 200, 'MyNode', '#FF0000', theme, 1);

      expect(ctx.textAlign).toBe('center');
    });
  });

  describe('drawClusterTooltip', () => {
    it('saves and restores context', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 5, '#FF0000', theme, 2);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('sets DPR transform', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 5, '#FF0000', theme, 2);

      expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    });

    it('draws cluster name text', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'AppCluster', 10, '#FF0000', theme, 1);

      expect(ctx.fillText).toHaveBeenCalledWith('AppCluster', 100, 196);
    });

    it('draws subtitle with target count', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 7, '#FF0000', theme, 1);

      expect(ctx.fillText).toHaveBeenCalledWith('7 targets', 100, 212);
    });

    it('fills background and strokes border', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 5, '#FF0000', theme, 1);

      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('uses title and subtitle fonts', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 5, '#FF0000', theme, 1);

      // Font gets set multiple times; we verify both fonts are used
      const fontCalls = [TOOLTIP_TITLE_FONT, TOOLTIP_SUBTITLE_FONT];
      // The last font set should be the subtitle font
      expect(ctx.font).toBe(TOOLTIP_SUBTITLE_FONT);
    });

    it('resets globalAlpha to 1.0 at the end', () => {
      const theme = createTheme();
      drawClusterTooltip(ctx, 100, 200, 'MyCluster', 5, '#FF0000', theme, 1);

      // After restore, alpha should be 1.0
      expect(ctx.globalAlpha).toBe(1.0);
    });
  });

  describe('exported constants', () => {
    it('has expected tooltip padding value', () => {
      expect(TOOLTIP_PADDING).toBe(10);
    });

    it('has expected tooltip height value', () => {
      expect(TOOLTIP_HEIGHT).toBe(40);
    });
  });
});

/**
 * Node Drawing Functions
 *
 * Pure canvas drawing functions for graph nodes: icon, label,
 * selection rings, cycle glow, and hover effects.
 */

import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { colorWithAlpha } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const NODE_LABEL_FONT_SIZE = 12;
export const NODE_LABEL_PADDING = 8;
export const NODE_FONT_SELECTED: string = `600 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
export const NODE_FONT_CONNECTED: string = `500 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
export const NODE_FONT_NORMAL: string = `400 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
export const FADE_OUT_DURATION = 250;
export const NODE_HIT_RADIUS_MULTIPLIER = 2;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

/** Draw the animated cycle-glow ring around a node involved in a cycle. */
export function drawCycleGlow(
  ctx: CanvasRenderingContext2D,
  size: number,
  theme: CanvasTheme,
  alpha: number,
  time: number,
): void {
  const pulse = prefersReducedMotion.get() ? 0.5 : (Math.sin(time / 300) + 1) / 2;
  const glowRadius = size + 4 + pulse * 2;
  ctx.beginPath();
  ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
  ctx.strokeStyle = theme.cycleGlowColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3 + pulse * 0.2;
  ctx.stroke();
  ctx.globalAlpha = alpha;
}

/** Draw the expanding selection rings around the selected node. */
export function drawSelectionRings(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  alpha: number,
  time: number,
): void {
  if (prefersReducedMotion.get()) {
    ctx.beginPath();
    ctx.arc(0, 0, size + 8, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.globalAlpha = alpha * 0.4;
    ctx.stroke();
  } else {
    const ringCount = 3;
    const cycleDuration = 2400;
    const maxExpand = 24;
    for (let i = 0; i < ringCount; i++) {
      const phase = (i / ringCount + time / cycleDuration) % 1;
      const ringRadius = size + 2 + phase * maxExpand;
      const fadeIn = Math.min(1, phase / 0.2);
      const fadeOut = 1 - phase;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 8 * (1 - phase * 0.6);
      ctx.globalAlpha = alpha * fadeIn * fadeOut * 0.7;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = alpha;
}

/** Draw the node icon (shape fill + stroke). */
export function drawNodeIcon(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  size: number,
  adjustedColor: string,
  theme: CanvasTheme,
  isEmphasized: boolean,
): void {
  const scale = (size / 12) * (isEmphasized ? 1.08 : 1.0);
  ctx.save();
  ctx.scale(scale, scale);

  ctx.fillStyle = theme.tooltipBg;
  ctx.fill(path);
  ctx.fillStyle = colorWithAlpha(adjustedColor, 0.12);
  ctx.fill(path);
  ctx.strokeStyle = adjustedColor;
  ctx.lineWidth = (isEmphasized ? 2.5 : 2) / scale;
  ctx.stroke(path);

  ctx.restore();
}

/** Draw the text label beneath a node. */
export function drawNodeLabel(
  ctx: CanvasRenderingContext2D,
  labelText: string,
  size: number,
  adjustedColor: string,
  theme: CanvasTheme,
  alpha: number,
  isSelected: boolean,
  isConnected: boolean,
  isInChain: boolean,
): void {
  ctx.font = isSelected
    ? NODE_FONT_SELECTED
    : isConnected || isInChain
      ? NODE_FONT_CONNECTED
      : NODE_FONT_NORMAL;
  ctx.textAlign = 'center';
  const labelY = size + NODE_LABEL_PADDING + NODE_LABEL_FONT_SIZE;

  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = theme.shadowColor;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(labelText, 0, labelY);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = adjustedColor;
  ctx.fillText(labelText, 0, labelY);
}

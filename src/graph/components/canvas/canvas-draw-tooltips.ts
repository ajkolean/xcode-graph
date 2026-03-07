/**
 * Tooltip Drawing Functions
 *
 * Screen-space tooltip rendering for nodes and clusters.
 * Tooltips are drawn after restoring the world transform so they
 * remain at a constant pixel size regardless of zoom.
 */

import type { CanvasTheme } from '@graph/utils/canvas-theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Horizontal/vertical padding inside cluster tooltips (pixels). */
export const TOOLTIP_PADDING = 10;

/** Fixed height of cluster tooltip background (pixels). */
export const TOOLTIP_HEIGHT = 40;

export const TOOLTIP_FONT = '12px var(--fonts-body, sans-serif)';
export const TOOLTIP_TITLE_FONT = '600 13px var(--fonts-body, sans-serif)';
export const TOOLTIP_SUBTITLE_FONT = '11px var(--fonts-body, sans-serif)';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Draw a rounded rectangle path (does not fill/stroke — caller does that). */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Node tooltip
// ---------------------------------------------------------------------------

/** Draw a small tooltip above the hovered node showing its name. */
export function drawNodeTooltip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  nodeName: string,
  nodeColor: string,
  theme: CanvasTheme,
  dpr: number,
): void {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.font = TOOLTIP_FONT;
  ctx.textAlign = 'center';
  const textWidth = ctx.measureText(nodeName).width;
  const padding = 8;
  const tooltipWidth = textWidth + padding * 2;
  const tooltipHeight = 24;

  // Background
  ctx.fillStyle = theme.tooltipBg;
  ctx.strokeStyle = nodeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(
    ctx,
    screenX - tooltipWidth / 2,
    screenY - tooltipHeight / 2,
    tooltipWidth,
    tooltipHeight,
    4,
  );
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = nodeColor;
  ctx.fillText(nodeName, screenX, screenY + 4);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Cluster tooltip
// ---------------------------------------------------------------------------

/** Draw a tooltip above the hovered cluster showing its name and target count. */
export function drawClusterTooltip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  clusterName: string,
  nodeCount: number,
  clusterColor: string,
  theme: CanvasTheme,
  dpr: number,
): void {
  const subtitleText = `${nodeCount} targets`;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Measure text
  ctx.font = TOOLTIP_TITLE_FONT;
  const nameWidth = ctx.measureText(clusterName).width;
  ctx.font = TOOLTIP_SUBTITLE_FONT;
  const subtitleWidth = ctx.measureText(subtitleText).width;
  const maxWidth = Math.max(nameWidth, subtitleWidth);
  const tooltipWidth = maxWidth + TOOLTIP_PADDING * 2;
  const tooltipHeight = TOOLTIP_HEIGHT;

  // Background
  ctx.fillStyle = theme.tooltipBg;
  ctx.strokeStyle = clusterColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(
    ctx,
    screenX - tooltipWidth / 2,
    screenY - tooltipHeight / 2,
    tooltipWidth,
    tooltipHeight,
    4,
  );
  ctx.fill();
  ctx.stroke();

  // Title
  ctx.font = TOOLTIP_TITLE_FONT;
  ctx.textAlign = 'center';
  ctx.fillStyle = clusterColor;
  ctx.fillText(clusterName, screenX, screenY - 4);

  // Subtitle
  ctx.font = TOOLTIP_SUBTITLE_FONT;
  ctx.globalAlpha = 0.7;
  ctx.fillText(subtitleText, screenX, screenY + 12);
  ctx.globalAlpha = 1.0;

  ctx.restore();
}

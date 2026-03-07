/**
 * Cluster Drawing Functions
 *
 * Pure canvas drawing functions for graph clusters: radial gradient fill,
 * dashed border, and arc-text label rendering.
 */

import { hexToRgba } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { CLUSTER_LABEL_CONFIG } from '@shared/utils/zoom-config';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

// ---------------------------------------------------------------------------
// Cluster fill
// ---------------------------------------------------------------------------

/** Draw the radial gradient fill for a cluster circle. */
export function drawClusterFill(
  ctx: CanvasRenderingContext2D,
  radius: number,
  clusterColor: string,
  isActive: boolean,
  nodeCount: number,
  gradientCache: Map<string, CanvasGradient>,
  clusterId: string,
): void {
  const fillOpacity = isActive ? 0.08 : nodeCount <= 5 ? 0.06 : nodeCount <= 20 ? 0.08 : 0.1;
  const cacheKey = `${clusterId}-${Math.round(radius)}-${fillOpacity}`;
  let grad = gradientCache.get(cacheKey);
  if (!grad) {
    grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0, hexToRgba(clusterColor, fillOpacity * 1.8));
    grad.addColorStop(0.6, hexToRgba(clusterColor, fillOpacity));
    grad.addColorStop(1, hexToRgba(clusterColor, fillOpacity * 0.3));
    gradientCache.set(cacheKey, grad);
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 1.0;
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Cluster border
// ---------------------------------------------------------------------------

/** Draw the dashed border ring around a cluster. */
export function drawClusterBorder(
  ctx: CanvasRenderingContext2D,
  radius: number,
  clusterColor: string,
  isActive: boolean,
  isSelected: boolean,
  nodeCount: number,
  clusterType: string,
  zoom: number,
  time: number,
): void {
  const borderOpacity = adjustOpacityForZoom(0.85, zoom);
  const baseWidth = isActive ? 2.5 : 2;
  ctx.lineWidth = Math.max(1, Math.log2(nodeCount)) * baseWidth * 1.5;
  ctx.strokeStyle = clusterColor;
  ctx.globalAlpha = isActive ? 1.0 : borderOpacity;
  ctx.setLineDash(clusterType === 'project' ? [10, 6] : [5, 6]);

  if (isSelected && !prefersReducedMotion.get()) {
    ctx.lineDashOffset = -time / 50;
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

// ---------------------------------------------------------------------------
// Cluster label (arc text)
// ---------------------------------------------------------------------------

/** Draw the arc-text label above a cluster, using a bitmap cache for performance. */
export function drawClusterLabel(
  ctx: CanvasRenderingContext2D,
  radius: number,
  color: string,
  isActive: boolean,
  name: string,
  arcLabelBitmapCache: Map<
    string,
    { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number }
  >,
  maxArcLabelCacheSize: number,
  truncateText: (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => string,
  renderArcLabelBitmap: (
    ctx: CanvasRenderingContext2D,
    text: string,
    arcRadius: number,
    font: string,
    color: string,
  ) => { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number },
): void {
  const fontSize = CLUSTER_LABEL_CONFIG.FONT_SIZE;
  const maxTextWidth = radius * 1.6;
  const fontWeight = isActive ? 600 : 500;
  const font = `${fontWeight} ${fontSize}px var(--fonts-body, sans-serif)`;

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const displayName = truncateText(ctx, name, maxTextWidth);
  const arcRadius = radius + CLUSTER_LABEL_CONFIG.LABEL_PADDING;

  const bitmapKey = `${font}-${displayName}-${Math.round(arcRadius)}-${color}`;
  let cached = arcLabelBitmapCache.get(bitmapKey);
  if (!cached) {
    cached = renderArcLabelBitmap(ctx, displayName, arcRadius, font, color);
    if (arcLabelBitmapCache.size >= maxArcLabelCacheSize) {
      const firstKey = arcLabelBitmapCache.keys().next().value;
      if (firstKey) arcLabelBitmapCache.delete(firstKey);
    }
    arcLabelBitmapCache.set(bitmapKey, cached);
  }

  ctx.globalAlpha = isActive ? 1 : 0.85;
  ctx.drawImage(cached.canvas, -cached.width / 2, -cached.height / 2);
}

/** Truncate text with ellipsis if it exceeds maxWidth. Uses a cache for performance. */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  truncateCache: Map<string, string>,
): string {
  const cacheKey = `${ctx.font}-${text}-${Math.round(maxWidth)}`;
  const cached = truncateCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = text;
  if (ctx.measureText(text).width > maxWidth) {
    while (result.length > 1 && ctx.measureText(`${result}...`).width > maxWidth) {
      result = result.slice(0, -1);
    }
    result = `${result}...`;
  }
  truncateCache.set(cacheKey, result);
  return result;
}

/** Render arc-text label to an offscreen bitmap canvas. */
export function renderArcLabelBitmap(
  ctx: CanvasRenderingContext2D,
  text: string,
  arcRadius: number,
  font: string,
  color: string,
  arcTextCache: Map<string, { charWidths: number[]; totalWidth: number }>,
): { canvas: OffscreenCanvas; width: number; height: number; arcRadius: number } {
  const cacheKey = `${font}-${text}`;
  let measurements = arcTextCache.get(cacheKey);
  if (!measurements) {
    ctx.font = font;
    const charWidths: number[] = [];
    let totalWidth = 0;
    for (const ch of text) {
      const w = ctx.measureText(ch).width;
      charWidths.push(w);
      totalWidth += w;
    }
    measurements = { charWidths, totalWidth };
    arcTextCache.set(cacheKey, measurements);
  }

  const padding = 4;
  const bitmapSize = (arcRadius + padding) * 2;
  const canvas = new OffscreenCanvas(bitmapSize, bitmapSize);
  const offCtx = canvas.getContext('2d');
  if (!offCtx) return { canvas, width: bitmapSize, height: bitmapSize, arcRadius };

  const cx = bitmapSize / 2;
  const cy = bitmapSize / 2;
  offCtx.font = font;
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillStyle = color;

  const totalAngle = measurements.totalWidth / arcRadius;
  let angle = -Math.PI / 2 - totalAngle / 2;

  for (let i = 0; i < text.length; i++) {
    const charWidth = measurements.charWidths[i] ?? 0;
    angle += charWidth / (2 * arcRadius);

    const x = cx + arcRadius * Math.cos(angle);
    const y = cy + arcRadius * Math.sin(angle);
    const rotation = angle + Math.PI / 2;

    offCtx.save();
    offCtx.translate(x, y);
    offCtx.rotate(rotation);
    offCtx.fillText(text[i] ?? '', 0, 0);
    offCtx.restore();

    angle += charWidth / (2 * arcRadius);
  }

  return { canvas, width: bitmapSize, height: bitmapSize, arcRadius };
}

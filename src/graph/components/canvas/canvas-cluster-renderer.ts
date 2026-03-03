import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { hexToRgba } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { CLUSTER_LABEL_CONFIG, LOD_THRESHOLDS } from '@shared/utils/zoom-config';

import { generateColor } from '@ui/utils/color-generator';
import type { ViewportBounds } from '@ui/utils/viewport';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

const gradientCache = new Map<string, CanvasGradient>();

/** Cached character widths for arc text — avoids measureText() per character per frame. */
const arcTextMeasureCache = new Map<string, { charWidths: number[]; totalWidth: number }>();

/** Cached truncation results — avoids iterative measureText() calls per frame. */
const truncateResultCache = new Map<string, string>();

/** Clear all cluster rendering caches (e.g. on theme change or layout reset). */
export function clearGradientCache(): void {
  gradientCache.clear();
  arcTextMeasureCache.clear();
  truncateResultCache.clear();
}

/** Context passed to cluster rendering functions each frame. */
export interface ClusterRenderContext {
  /** 2D rendering context of the canvas element */
  ctx: CanvasRenderingContext2D;
  /** Layout controller providing cluster positions and metadata */
  layout: GraphLayoutController;
  /** Current zoom level */
  zoom: number;
  /** Current animation timestamp in milliseconds */
  time: number;
  /** Resolved canvas theme colors */
  theme: CanvasTheme;
  /** ID of the currently selected cluster, or null */
  selectedCluster: string | null;
  /** ID of the currently hovered cluster, or null */
  hoveredCluster: string | null;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
}

/**
 * Checks whether a circular cluster region intersects the visible viewport.
 * @param cx - Cluster center X in world coordinates.
 * @param cy - Cluster center Y in world coordinates.
 * @param radius - Cluster radius.
 * @param viewport - Current viewport bounds.
 * @returns True if the cluster is at least partially visible.
 */
/* v8 ignore next 13 */
function isClusterInViewport(
  cx: number,
  cy: number,
  radius: number,
  viewport: ViewportBounds,
): boolean {
  return !(
    cx + radius < viewport.minX ||
    cx - radius > viewport.maxX ||
    cy + radius < viewport.minY ||
    cy - radius > viewport.maxY
  );
}

/** Scale fill opacity based on cluster node count for visual hierarchy */
/* v8 ignore next 6 */
function getClusterFillOpacity(nodeCount: number, isActive: boolean): number {
  if (isActive) return 0.08;
  if (nodeCount <= 5) return 0.06;
  if (nodeCount <= 20) return 0.08;
  return 0.1;
}

/** Scale border width based on cluster node count for visual hierarchy */
/* v8 ignore next 4 */
function getClusterBorderWidth(nodeCount: number, isActive: boolean): number {
  const baseWidth = isActive ? 2.5 : 2;
  return Math.max(1, Math.log2(nodeCount)) * baseWidth * 1.5;
}

/** Draws a cluster's radial gradient fill and dashed border with optional selection animation. */
/* v8 ignore start -- requires Canvas2D rendering context */
function drawClusterFillAndBorder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  clusterColor: string,
  isActive: boolean,
  isSelected: boolean,
  clusterType: string,
  zoom: number,
  time: number,
  nodeCount: number,
  clusterId: string,
) {
  const borderOpacity = adjustOpacityForZoom(0.7, zoom);
  const fillOpacity = getClusterFillOpacity(nodeCount, isActive);

  // Cache radial gradient by cluster id, position, and radius (zoom excluded — canvas transform handles scaling)
  const cacheKey = `${clusterId}-${Math.round(cx)}-${Math.round(cy)}-${Math.round(radius)}`;
  let grad = gradientCache.get(cacheKey);
  if (!grad) {
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, hexToRgba(clusterColor, fillOpacity * 1.8));
    grad.addColorStop(0.6, hexToRgba(clusterColor, fillOpacity));
    grad.addColorStop(1, hexToRgba(clusterColor, fillOpacity * 0.3));
    gradientCache.set(cacheKey, grad);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 1.0;
  ctx.fill();

  ctx.lineWidth = getClusterBorderWidth(nodeCount, isActive);
  ctx.strokeStyle = clusterColor;
  ctx.globalAlpha = isActive ? 1.0 : borderOpacity;
  ctx.setLineDash(clusterType === 'project' ? [8, 8] : [3, 8]);

  if (isSelected && !prefersReducedMotion.get()) {
    ctx.lineDashOffset = -time / 50;
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}
/* v8 ignore stop */

/**
 * Truncates text with an ellipsis if it exceeds the maximum pixel width.
 * @param ctx - Canvas context used for text measurement.
 * @param text - The text to truncate.
 * @param maxWidth - Maximum allowed width in pixels.
 * @returns The original or truncated text.
 */
/* v8 ignore next 12 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const cacheKey = `${ctx.font}-${text}-${Math.round(maxWidth)}`;
  const cached = truncateResultCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = text;
  if (ctx.measureText(text).width > maxWidth) {
    while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
      result = result.slice(0, -1);
    }
    result = `${result}…`;
  }
  truncateResultCache.set(cacheKey, result);
  return result;
}

/** Returns cached character widths for arc text, measuring only on cache miss. */
/* v8 ignore start -- requires Canvas2D rendering context */
function getArcTextMeasurements(
  ctx: CanvasRenderingContext2D,
  text: string,
): { charWidths: number[]; totalWidth: number } {
  const cacheKey = `${ctx.font}-${text}`;
  const cached = arcTextMeasureCache.get(cacheKey);
  if (cached) return cached;

  const charWidths: number[] = [];
  let totalWidth = 0;
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    charWidths.push(w);
    totalWidth += w;
  }
  const entry = { charWidths, totalWidth };
  arcTextMeasureCache.set(cacheKey, entry);
  return entry;
}

function drawTextAlongArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  arcRadius: number,
) {
  const { charWidths, totalWidth } = getArcTextMeasurements(ctx, text);

  // Calculate angular span of the full text
  const totalAngle = totalWidth / arcRadius;

  // Start at top-center, offset left by half the text span
  // -π/2 is 12 o'clock; we go from left to right
  let angle = -Math.PI / 2 - totalAngle / 2;

  for (let i = 0; i < text.length; i++) {
    const charWidth = charWidths[i] ?? 0;
    // Advance by half the character width to center it on the arc position
    angle += charWidth / (2 * arcRadius);

    const x = cx + arcRadius * Math.cos(angle);
    const y = cy + arcRadius * Math.sin(angle);

    ctx.save();
    ctx.translate(x, y);
    // Rotate so the character is perpendicular to the radius
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(text[i] ?? '', 0, 0);
    ctx.restore();

    // Advance by the other half
    angle += charWidth / (2 * arcRadius);
  }
}
/* v8 ignore stop */

/** Draws a cluster's name label along an arc above the cluster circle. */
/* v8 ignore start -- requires Canvas2D rendering context */
function drawClusterLabels(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  clusterColor: string,
  isActive: boolean,
  name: string,
) {
  const nameFontSize = CLUSTER_LABEL_CONFIG.FONT_SIZE;
  const maxTextWidth = radius * 1.6;

  ctx.fillStyle = clusterColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${isActive ? 600 : 500} ${nameFontSize}px var(--fonts-body, sans-serif)`;
  const displayName = truncateText(ctx, name, maxTextWidth);
  ctx.globalAlpha = isActive ? 1 : 0.85;

  const arcRadius = radius + CLUSTER_LABEL_CONFIG.LABEL_PADDING;

  drawTextAlongArc(ctx, displayName, cx, cy, arcRadius);
}
/* v8 ignore stop */

/** Renders a single cluster's fill, border, and optional selection animation. */
/* v8 ignore start -- requires Canvas2D rendering context */
function renderSingleCluster(
  rc: ClusterRenderContext,
  cx: number,
  cy: number,
  radius: number,
  clusterColor: string,
  isActive: boolean,
  isSelected: boolean,
  clusterType: string,
  nodeCount: number,
  clusterId: string,
) {
  const { ctx, zoom, time } = rc;

  drawClusterFillAndBorder(
    ctx,
    cx,
    cy,
    radius,
    clusterColor,
    isActive,
    isSelected,
    clusterType,
    zoom,
    time,
    nodeCount,
    clusterId,
  );
}
/* v8 ignore stop */

/**
 * Renders all visible clusters with fill, border, and arc labels.
 * @param rc - Cluster rendering context with canvas, layout, theme, and interaction state.
 * @param viewport - Current viewport bounds for culling off-screen clusters.
 */
/* v8 ignore start -- requires Canvas2D rendering context */
export function renderClusters(rc: ClusterRenderContext, viewport: ViewportBounds): void {
  const { ctx, layout, selectedCluster, hoveredCluster, manualClusterPositions } = rc;

  for (const cluster of layout.clusters) {
    const layoutPos = layout.clusterPositions.get(cluster.id);
    if (!layoutPos) continue;

    const manualPos = manualClusterPositions.get(cluster.id);
    const cx = manualPos?.x ?? layoutPos.x;
    const cy = manualPos?.y ?? layoutPos.y;
    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

    if (!isClusterInViewport(cx, cy, radius, viewport)) continue;

    const clusterColor = generateColor(cluster.name, cluster.type);
    const isActive = hoveredCluster === cluster.id || selectedCluster === cluster.id;

    renderSingleCluster(
      rc,
      cx,
      cy,
      radius,
      clusterColor,
      isActive,
      selectedCluster === cluster.id,
      cluster.type,
      cluster.nodes.length,
      cluster.id,
    );

    if (rc.zoom >= LOD_THRESHOLDS.CLUSTER_LABELS) {
      drawClusterLabels(ctx, cx, cy, radius, clusterColor, isActive, cluster.name);
    }

    ctx.globalAlpha = 1.0;
  }
}
/* v8 ignore stop */

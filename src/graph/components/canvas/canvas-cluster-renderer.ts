import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { hexToRgba } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { CLUSTER_LABEL_CONFIG } from '@shared/utils/zoom-config';

/** Minimum screen-pixel size for cluster labels before they are hidden */
const MIN_LABEL_SCREEN_PX = 6;

import { generateColor } from '@ui/utils/color-generator';
import type { ViewportBounds } from '@ui/utils/viewport';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

const gradientCache = new Map<string, CanvasGradient>();

/** Clear the radial gradient cache (e.g. on theme change or layout reset). */
export function clearGradientCache(): void {
  gradientCache.clear();
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
  shouldDim: boolean,
  clusterType: string,
  zoom: number,
  time: number,
  nodeCount: number,
  clusterId: string,
) {
  const dimFactor = shouldDim ? 0.3 : 1.0;
  const borderOpacity = adjustOpacityForZoom(0.7, zoom);
  const fillOpacity = getClusterFillOpacity(nodeCount, isActive);

  // Cache radial gradient by cluster id, rounded radius, and zoom
  const cacheKey = `${clusterId}-${Math.round(radius)}-${Math.round(zoom * 10)}`;
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
  ctx.globalAlpha = dimFactor;
  ctx.fill();

  ctx.lineWidth = getClusterBorderWidth(nodeCount, isActive);
  ctx.strokeStyle = clusterColor;
  ctx.globalAlpha = (isActive ? 1.0 : borderOpacity) * dimFactor;
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
/* v8 ignore next 8 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/* v8 ignore start -- requires Canvas2D rendering context */
function drawTextAlongArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  arcRadius: number,
) {
  // Measure each character width
  const charWidths: number[] = [];
  let totalWidth = 0;
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    charWidths.push(w);
    totalWidth += w;
  }

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
  shouldDim: boolean,
  name: string,
  zoom: number,
) {
  const nameFontSize = CLUSTER_LABEL_CONFIG.FONT_SIZE;

  // Hide labels when they'd be too small to read on screen
  if (nameFontSize * zoom < MIN_LABEL_SCREEN_PX) return;

  const dimFactor = shouldDim ? 0.3 : 1.0;
  const maxTextWidth = radius * 1.6;

  ctx.fillStyle = clusterColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${isActive ? 600 : 500} ${nameFontSize}px var(--fonts-body, sans-serif)`;
  const displayName = truncateText(ctx, name, maxTextWidth);
  ctx.globalAlpha = (isActive ? 1 : 0.85) * dimFactor;

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
  shouldDim: boolean,
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
    shouldDim,
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
  const { ctx, layout, zoom, selectedCluster, hoveredCluster, manualClusterPositions } = rc;
  const activeClusterId = selectedCluster || hoveredCluster;

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
    const shouldDim = Boolean(activeClusterId && activeClusterId !== cluster.id);

    renderSingleCluster(
      rc,
      cx,
      cy,
      radius,
      clusterColor,
      isActive,
      selectedCluster === cluster.id,
      shouldDim,
      cluster.type,
      cluster.nodes.length,
      cluster.id,
    );

    // Always draw cluster labels at all zoom levels
    drawClusterLabels(ctx, cx, cy, radius, clusterColor, isActive, shouldDim, cluster.name, zoom);

    ctx.globalAlpha = 1.0;
  }
}
/* v8 ignore stop */

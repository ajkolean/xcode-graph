import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { hexToRgba } from '@graph/utils/canvas-theme';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { CLUSTER_LABEL_CONFIG } from '@shared/utils/zoom-config';
import { generateColor } from '@ui/utils/color-generator';
import type { ViewportBounds } from '@ui/utils/viewport';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

const gradientCache = new Map<string, CanvasGradient>();

/** Clear the radial gradient cache (e.g. on theme change or layout reset). */
export function clearGradientCache(): void {
  gradientCache.clear();
}

export interface ClusterRenderContext {
  ctx: CanvasRenderingContext2D;
  layout: GraphLayoutController;
  zoom: number;
  time: number;
  theme: CanvasTheme;
  selectedCluster: string | null;
  hoveredCluster: string | null;
  manualClusterPositions: Map<string, { x: number; y: number }>;
}

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
function getClusterFillOpacity(nodeCount: number, isActive: boolean): number {
  if (isActive) return 0.08;
  if (nodeCount <= 5) return 0.06;
  if (nodeCount <= 20) return 0.08;
  return 0.1;
}

/** Scale border width based on cluster node count for visual hierarchy */
function getClusterBorderWidth(nodeCount: number, isActive: boolean): number {
  const baseWidth = isActive ? 2.5 : 2;
  return Math.max(1, Math.log2(nodeCount)) * baseWidth * 1.5;
}

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

function getAdaptiveClusterFontSize(targetScreenSize: number, zoom: number): number {
  const graphSize = targetScreenSize / zoom;
  return Math.min(graphSize, CLUSTER_LABEL_CONFIG.MAX_FONT_SIZE);
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

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
  const dimFactor = shouldDim ? 0.3 : 1.0;
  const nameFontSize = getAdaptiveClusterFontSize(CLUSTER_LABEL_CONFIG.NAME_SCREEN_SIZE, zoom);
  const maxTextWidth = radius * 1.6;
  const nameY = cy - radius - nameFontSize * 0.9;

  ctx.fillStyle = clusterColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${isActive ? 600 : 500} ${nameFontSize}px var(--fonts-body, sans-serif)`;
  const displayName = truncateText(ctx, name, maxTextWidth);
  ctx.globalAlpha = (isActive ? 1 : 0.85) * dimFactor;
  ctx.fillText(displayName, cx, nameY);
}

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
    const shouldDim = !!(activeClusterId && activeClusterId !== cluster.id);

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

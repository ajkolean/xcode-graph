import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { CLUSTER_LABEL_CONFIG } from '@shared/utils/zoom-constants';
import { generateColor } from '@ui/utils/color-generator';
import type { ViewportBounds } from '@ui/utils/viewport';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

/** Convert a hex color (#RRGGBB) to an rgba() string */
function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
  if (isActive) return 0.05;
  if (nodeCount <= 5) return 0.03;
  if (nodeCount <= 20) return 0.05;
  return 0.08;
}

/** Scale border width based on cluster node count for visual hierarchy */
function getClusterBorderWidth(nodeCount: number, isActive: boolean): number {
  const baseWidth = isActive ? 2.5 : 2;
  return Math.max(1, Math.log2(nodeCount)) * baseWidth;
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
) {
  const dimFactor = shouldDim ? 0.3 : 1.0;
  const borderOpacity = adjustOpacityForZoom(0.5, zoom);
  const fillOpacity = getClusterFillOpacity(nodeCount, isActive);

  // Radial gradient fill (brighter center → fade at edges)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, hexToRgba(clusterColor, fillOpacity * 1.8));
  grad.addColorStop(0.6, hexToRgba(clusterColor, fillOpacity));
  grad.addColorStop(1, hexToRgba(clusterColor, fillOpacity * 0.3));

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.globalAlpha = dimFactor;
  ctx.fill();

  ctx.lineWidth = getClusterBorderWidth(nodeCount, isActive);
  ctx.strokeStyle = clusterColor;
  ctx.globalAlpha = (isActive ? 0.9 : borderOpacity) * dimFactor;
  ctx.setLineDash(clusterType === 'project' ? [8, 8] : [3, 8]);

  if (isSelected) {
    ctx.lineDashOffset = -time / 50;
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Hover glow border: soft ring outside the cluster
  if (isActive) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = clusterColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.08 * dimFactor;
    ctx.setLineDash([]);
    ctx.stroke();
  }
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
  ctx.globalAlpha = (isActive ? 1 : 0.7) * dimFactor;
  ctx.fillText(displayName, cx, nameY);
}

export function renderClusters(rc: ClusterRenderContext, viewport: ViewportBounds): void {
  const { ctx, layout, zoom, time, selectedCluster, hoveredCluster, manualClusterPositions } = rc;
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
    const isHighlighted = hoveredCluster === cluster.id;
    const isSelected = selectedCluster === cluster.id;
    const isActive = isHighlighted || isSelected;
    const shouldDim = !!(activeClusterId && activeClusterId !== cluster.id);

    drawClusterFillAndBorder(
      ctx,
      cx,
      cy,
      radius,
      clusterColor,
      isActive,
      isSelected,
      shouldDim,
      cluster.type,
      zoom,
      time,
      cluster.nodes.length,
    );
    drawClusterLabels(ctx, cx, cy, radius, clusterColor, isActive, shouldDim, cluster.name, zoom);

    ctx.globalAlpha = 1.0;
  }
}

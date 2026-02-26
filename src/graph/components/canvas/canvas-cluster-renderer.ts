import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { CLUSTER_LABEL_CONFIG } from '@shared/utils/zoom-constants';
import { generateColor } from '@ui/utils/color-generator';
import type { ViewportBounds } from '@ui/utils/viewport';
import { adjustOpacityForZoom } from '@ui/utils/zoom-colors';

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

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = clusterColor;
  ctx.globalAlpha = getClusterFillOpacity(nodeCount, isActive);
  ctx.fill();

  ctx.globalAlpha = dimFactor;

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

interface LabelPosition {
  nameY: number;
  nameBaseline: CanvasTextBaseline;
  subtitleY: number;
}

function getLabelPosition(
  cy: number,
  radius: number,
  nameFontSize: number,
  countFontSize: number,
  centered: boolean,
  showSubtitle: boolean,
): LabelPosition {
  if (centered) {
    const gap = nameFontSize * 0.3;
    return {
      nameY: showSubtitle ? cy - gap / 2 : cy,
      nameBaseline: showSubtitle ? 'alphabetic' : 'middle',
      subtitleY: cy + countFontSize + gap / 2,
    };
  }
  return {
    nameY: cy - radius - nameFontSize * 0.9,
    nameBaseline: 'alphabetic',
    subtitleY: cy - radius + countFontSize * 0.35,
  };
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
  nodeCount: number,
  zoom: number,
) {
  const dimFactor = shouldDim ? 0.3 : 1.0;
  const nameFontSize = getAdaptiveClusterFontSize(CLUSTER_LABEL_CONFIG.NAME_SCREEN_SIZE, zoom);
  const countFontSize = getAdaptiveClusterFontSize(CLUSTER_LABEL_CONFIG.COUNT_SCREEN_SIZE, zoom);
  const maxTextWidth = radius * 1.6;
  const centered = zoom < CLUSTER_LABEL_CONFIG.CENTER_LABEL_ZOOM;
  const showSubtitle = zoom >= CLUSTER_LABEL_CONFIG.SUBTITLE_HIDE_ZOOM;
  const pos = getLabelPosition(cy, radius, nameFontSize, countFontSize, centered, showSubtitle);

  ctx.fillStyle = clusterColor;
  ctx.textAlign = 'center';

  // Name label
  ctx.font = `${isActive ? 600 : 500} ${nameFontSize}px var(--fonts-body, sans-serif)`;
  const displayName = truncateText(ctx, name, maxTextWidth);
  ctx.globalAlpha = (isActive ? 1 : 0.7) * dimFactor;
  ctx.textBaseline = pos.nameBaseline;
  ctx.fillText(displayName, cx, pos.nameY);

  // Subtitle ("N targets")
  if (showSubtitle) {
    ctx.font = `${isActive ? 500 : 400} ${countFontSize}px var(--fonts-body, sans-serif)`;
    ctx.globalAlpha = (isActive ? 0.8 : 0.5) * dimFactor;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${nodeCount} targets`, cx, pos.subtitleY);
  }

  ctx.textBaseline = 'alphabetic';
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
    drawClusterLabels(
      ctx,
      cx,
      cy,
      radius,
      clusterColor,
      isActive,
      shouldDim,
      cluster.name,
      cluster.nodes.length,
      zoom,
    );

    ctx.globalAlpha = 1.0;
  }
}

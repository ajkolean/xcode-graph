import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
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
) {
  const dimFactor = shouldDim ? 0.3 : 1.0;
  const borderOpacity = adjustOpacityForZoom(0.5, zoom);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = clusterColor;
  ctx.globalAlpha = isActive ? 0.05 : 0.08;
  ctx.fill();

  ctx.globalAlpha = dimFactor;

  ctx.lineWidth = isActive ? 2.5 : 2;
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
) {
  const dimFactor = shouldDim ? 0.3 : 1.0;

  ctx.globalAlpha = (isActive ? 1 : 0.7) * dimFactor;
  ctx.fillStyle = clusterColor;
  ctx.font = `${isActive ? 600 : 500} 13px var(--fonts-body, sans-serif)`;
  ctx.textAlign = 'center';
  ctx.fillText(name, cx, cy - radius - 12);

  ctx.font = `${isActive ? 500 : 400} 11px var(--fonts-body, sans-serif)`;
  ctx.globalAlpha = (isActive ? 0.8 : 0.5) * dimFactor;
  ctx.fillText(`${nodeCount} targets`, cx, cy - radius + 4);
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
    );

    ctx.globalAlpha = 1.0;
  }
}

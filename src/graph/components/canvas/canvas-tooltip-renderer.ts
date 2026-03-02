import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { resolveClusterPosition, resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

/** Context passed to tooltip rendering functions. */
export interface TooltipContext {
  /** 2D rendering context of the canvas element */
  ctx: CanvasRenderingContext2D;
  /** Layout controller providing node/cluster positions */
  layout: GraphLayoutController;
  /** All visible nodes (for name lookup) */
  nodes: GraphNode[];
  /** All visible edges (for sizing calculations) */
  edges: GraphEdge[];
  /** Current zoom level */
  zoom: number;
  /** Resolved canvas theme colors */
  theme: CanvasTheme;
  /** ID of the currently hovered node, or null */
  hoveredNode: string | null;
  /** Current pan offset in screen pixels */
  pan: { x: number; y: number };
  /** Map of node ID to edge-count weight */
  nodeWeights: Map<string, number>;
  /** User-dragged node positions (relative to cluster) */
  manualNodePositions: Map<string, { x: number; y: number }>;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
  /** ID of the currently hovered cluster, or null */
  hoveredCluster: string | null;
}

/**
 * Render a tooltip above a hovered node showing its full name.
 */
export function renderNodeTooltip(tc: TooltipContext): void {
  if (!tc.hoveredNode) return;
  const node = tc.nodes.find((graphNode) => graphNode.id === tc.hoveredNode);
  if (!node) return;
  // At low zoom, always show tooltip (labels are likely hidden).
  // At higher zoom, only show if label would be truncated.
  if (tc.zoom >= 0.5 && node.name.length <= 20) return;

  const worldPos = resolveNodeWorldPosition(
    node.id,
    node.project || 'External',
    tc.layout,
    tc.manualNodePositions,
    tc.manualClusterPositions,
  );
  if (!worldPos) return;

  const size = getNodeSize(node, tc.edges, tc.nodeWeights.get(node.id));

  const screenX = worldPos.x * tc.zoom + tc.pan.x;
  const screenY = worldPos.y * tc.zoom + tc.pan.y;

  const text = node.name;
  tc.ctx.font = '12px var(--fonts-body, sans-serif)';
  const padding = 8;
  const metrics = tc.ctx.measureText(text);
  const tooltipWidth = metrics.width + padding * 2;
  const tooltipHeight = 24;

  const x = screenX - tooltipWidth / 2;
  const y = screenY - size * tc.zoom - 35;

  tc.ctx.save();
  tc.ctx.fillStyle = tc.theme.tooltipBg;
  tc.ctx.strokeStyle = adjustColorForZoom(getNodeTypeColorFromTheme(node.type, tc.theme), tc.zoom);
  tc.ctx.lineWidth = 1;

  tc.ctx.beginPath();
  tc.ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 4);
  tc.ctx.fill();
  tc.ctx.stroke();

  tc.ctx.fillStyle = tc.ctx.strokeStyle;
  tc.ctx.textAlign = 'center';
  tc.ctx.textBaseline = 'middle';
  tc.ctx.fillText(text, screenX, y + tooltipHeight / 2);
  tc.ctx.restore();
}

/**
 * Render a tooltip above a hovered cluster showing its name and node count.
 */
export function renderClusterTooltip(tc: TooltipContext): void {
  const clusterId = tc.hoveredCluster;
  if (!clusterId || tc.hoveredNode) return;

  const cluster = tc.layout.clusters.find((cl) => cl.id === clusterId);
  if (!cluster) return;
  const layoutPos = tc.layout.clusterPositions.get(clusterId);
  if (!layoutPos) return;

  const clusterWorldPos = resolveClusterPosition(clusterId, layoutPos, tc.manualClusterPositions);
  const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

  const screenX = clusterWorldPos.x * tc.zoom + tc.pan.x;
  const screenY = clusterWorldPos.y * tc.zoom + tc.pan.y;

  const name = cluster.name;
  const subtitle = `${cluster.nodes.length} targets`;
  const padding = 10;

  tc.ctx.save();
  tc.ctx.font = '600 13px var(--fonts-body, sans-serif)';
  const nameWidth = tc.ctx.measureText(name).width;
  tc.ctx.font = '400 11px var(--fonts-body, sans-serif)';
  const subtitleWidth = tc.ctx.measureText(subtitle).width;

  const tooltipWidth = Math.max(nameWidth, subtitleWidth) + padding * 2;
  const tooltipHeight = 40;
  const x = screenX - tooltipWidth / 2;
  const y = screenY - radius * tc.zoom - 20 - tooltipHeight;

  const clusterColor = generateColor(cluster.name, cluster.type);

  tc.ctx.fillStyle = tc.theme.tooltipBg;
  tc.ctx.strokeStyle = adjustColorForZoom(clusterColor, tc.zoom);
  tc.ctx.lineWidth = 1;
  tc.ctx.beginPath();
  tc.ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 4);
  tc.ctx.fill();
  tc.ctx.stroke();

  tc.ctx.textAlign = 'center';
  tc.ctx.fillStyle = tc.ctx.strokeStyle;
  tc.ctx.font = '600 13px var(--fonts-body, sans-serif)';
  tc.ctx.textBaseline = 'middle';
  tc.ctx.fillText(name, screenX, y + 14);

  tc.ctx.globalAlpha = 0.7;
  tc.ctx.font = '400 11px var(--fonts-body, sans-serif)';
  tc.ctx.fillText(subtitle, screenX, y + 28);
  tc.ctx.restore();
}

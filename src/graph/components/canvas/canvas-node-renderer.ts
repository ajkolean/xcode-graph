import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { type AnimatedValue, getAnimatedAlpha } from '@graph/utils/canvas-animation';
import { resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { colorWithAlpha } from '@graph/utils/canvas-theme';
import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { isCircleInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

/** Context passed to node rendering functions each frame. */
export interface NodeRenderContext {
  /** 2D rendering context of the canvas element */
  ctx: CanvasRenderingContext2D;
  /** Layout controller providing node/cluster positions */
  layout: GraphLayoutController;
  /** Nodes to render */
  nodes: GraphNode[];
  /** Edges used for weight and connectivity calculations */
  edges: GraphEdge[];
  /** Current zoom level */
  zoom: number;
  /** Current animation timestamp in milliseconds */
  time: number;
  /** Resolved canvas theme colors */
  theme: CanvasTheme;
  /** Currently selected node, or null */
  selectedNode: GraphNode | null;
  /** ID of the currently selected cluster, or null */
  selectedCluster: string | null;
  /** ID of the currently hovered node, or null */
  hoveredNode: string | null;
  /** ID of the currently hovered cluster, or null */
  hoveredCluster: string | null;
  /** Active search query string */
  searchQuery: string;
  /** Current view mode (e.g. cluster or flat) */
  viewMode: ViewMode;
  /** Transitive dependency chain from the selected node */
  transitiveDeps: TransitiveResult | undefined;
  /** Transitive dependent chain from the selected node */
  transitiveDependents: TransitiveResult | undefined;
  /** Preview filter being hovered in the sidebar */
  previewFilter: PreviewFilter | undefined;
  /** Pre-computed set of node IDs that should appear dimmed */
  dimmedNodeIds: Set<string>;
  /** Map of node ID to edge-count weight */
  nodeWeights: Map<string, number>;
  /** User-dragged node positions (relative to cluster) */
  manualNodePositions: Map<string, { x: number; y: number }>;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
  /** Returns the cached Path2D icon shape for a node */
  getPathForNode: (node: GraphNode) => Path2D;
  /** Set of node IDs connected to the selected node */
  connectedNodes: Set<string>;
  /** Minimum weight for a node to be considered a hub */
  hubWeightThreshold: number;
  /** Animated alpha values per node for fade transitions */
  nodeAlphaMap: Map<string, AnimatedValue>;
  /** Whether direct dependencies are highlighted */
  showDirectDeps: boolean;
  /** Whether transitive dependencies are highlighted */
  showTransitiveDeps: boolean;
  /** Whether direct dependents are highlighted */
  showDirectDependents: boolean;
  /** Whether transitive dependents are highlighted */
  showTransitiveDependents: boolean;
}

/**
 * Check if a node should be dimmed.
 *
 * Search, selection/highlight-toggle, and preview-filter dimming are
 * pre-computed in the `dimmedNodeIds` signal (O(1) Set lookup).
 * Cluster dimming stays per-frame because `hoveredCluster`/`selectedCluster`
 * are local interaction state in GraphCanvas, not signals.
 */
function isNodeDimmed(
  node: GraphNode,
  clusterDim: boolean | '' | null,
  rc: NodeRenderContext,
): boolean {
  return rc.dimmedNodeIds.has(node.id) || Boolean(clusterDim);
}

function drawNodeEffects(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  adjustedColor: string,
  alpha: number,
  isSelected: boolean,
  isCycleNode: boolean,
  isDimmed: boolean,
  chainAlpha: number,
  time: number,
  theme: CanvasTheme,
) {
  if (isCycleNode && !isDimmed && chainAlpha > 0.3) {
    const pulse = prefersReducedMotion.get() ? 0.5 : (Math.sin(time / 300) + 1) / 2;
    const glowRadius = size + 6 + pulse * 3;

    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.strokeStyle = theme.cycleGlowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + pulse * 0.3;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }

  if (isSelected) {
    // Solid selection ring
    const ringRadius = size + 5;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = adjustedColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }
}

function drawNodeIcon(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  x: number,
  y: number,
  size: number,
  adjustedColor: string,
  isSelected: boolean,
  isHovered: boolean,
  getPathForNode: (node: GraphNode) => Path2D,
  theme: CanvasTheme,
) {
  const scale = (size / 12) * (isHovered || isSelected ? 1.08 : 1.0);

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const path = getPathForNode(node);
  ctx.fillStyle = theme.tooltipBg;
  ctx.fill(path);

  ctx.fillStyle = colorWithAlpha(adjustedColor, 0.12);
  ctx.fill(path);

  ctx.strokeStyle = adjustedColor;
  ctx.lineWidth = (isSelected ? 2.5 : 2) / scale;
  ctx.stroke(path);

  ctx.scale(1 / scale, 1 / scale);
  ctx.translate(-x, -y);
}

/** Fixed node label font size in graph-space pixels */
const NODE_LABEL_FONT_SIZE = 12;
/** Fixed gap between node icon and label in graph-space pixels */
const NODE_LABEL_PADDING = 8;

function drawNodeLabel(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  x: number,
  y: number,
  size: number,
  adjustedColor: string,
  alpha: number,
  isSelected: boolean,
  isHovered: boolean,
  isConnected: boolean | null,
  isInChain: boolean,
  theme: CanvasTheme,
) {
  const labelText =
    node.name.length > 20 && !isHovered && !isConnected
      ? `${node.name.substring(0, 20)}...`
      : node.name;

  const fontSize = NODE_LABEL_FONT_SIZE;
  ctx.font = `${isSelected ? '600' : isConnected || isInChain ? '500' : '400'} ${fontSize}px var(--fonts-body, sans-serif)`;
  ctx.textAlign = 'center';
  ctx.fillStyle = adjustedColor;

  const labelY = y + size + NODE_LABEL_PADDING + fontSize;

  // Dark halo pass: draw text in shadow color at small offsets for readability
  ctx.globalAlpha = alpha * 0.7;
  ctx.fillStyle = theme.shadowColor;
  const offsets = [-1.5, 0, 1.5];
  for (const ox of offsets) {
    for (const oy of offsets) {
      if (ox === 0 && oy === 0) continue;
      ctx.fillText(labelText, x + ox, labelY + oy);
    }
  }

  // Clean text on top
  ctx.globalAlpha = alpha;
  ctx.fillStyle = adjustedColor;
  ctx.fillText(labelText, x, labelY);
}

function isHubNode(nodeId: string, rc: NodeRenderContext): boolean {
  const weight = rc.nodeWeights.get(nodeId) ?? 0;
  return weight >= rc.hubWeightThreshold && weight > 0;
}

function shouldShowNodeLabel(
  isHovered: boolean,
  isSelected: boolean,
  isConnected: boolean | GraphNode | null,
  nodeId: string,
  rc: NodeRenderContext,
): boolean {
  if (rc.zoom >= 0.3 || isHovered || isSelected || isConnected) return true;
  // Always show labels for hub nodes regardless of zoom
  if (isHubNode(nodeId, rc)) return true;
  return false;
}

interface NodeVisualState {
  size: number;
  isHovered: boolean;
  isSelected: boolean;
  isConnected: boolean | null;
  adjustedColor: string;
  isDimmed: boolean;
  alpha: number;
  isCycleNode: boolean;
  isInChain: boolean;
}

function resolveNodeVisualState(
  node: GraphNode,
  size: number,
  connectedNodes: Set<string>,
  rc: NodeRenderContext,
): NodeVisualState {
  const { selectedNode, hoveredNode, zoom, theme } = rc;
  const isHovered = hoveredNode === node.id;
  const isSelected = selectedNode?.id === node.id;
  const isConnected = selectedNode && connectedNodes.has(node.id);

  const color = getNodeTypeColorFromTheme(node.type, theme);
  const adjustedColor = adjustColorForZoom(color, zoom);
  const clusterId = node.project || 'External';
  const clusterDim =
    (rc.hoveredCluster && clusterId !== rc.hoveredCluster) ||
    (rc.selectedCluster && clusterId !== rc.selectedCluster);

  const isDimmed = isNodeDimmed(node, clusterDim, rc);
  const alpha = prefersReducedMotion.get()
    ? (rc.nodeAlphaMap.get(node.id)?.target ?? 1.0)
    : getAnimatedAlpha(rc.nodeAlphaMap, node.id);
  const isCycleNode = rc.layout.cycleNodes?.has(node.id) ?? false;
  const isInChain =
    (rc.transitiveDeps?.nodes.has(node.id) ?? false) ||
    (rc.transitiveDependents?.nodes.has(node.id) ?? false) ||
    isSelected;

  return {
    size,
    isHovered,
    isSelected,
    isConnected,
    adjustedColor,
    isDimmed,
    alpha,
    isCycleNode,
    isInChain,
  };
}

function renderSingleNode(
  node: GraphNode,
  x: number,
  y: number,
  size: number,
  connectedNodes: Set<string>,
  rc: NodeRenderContext,
) {
  const { ctx, theme, time } = rc;
  const vs = resolveNodeVisualState(node, size, connectedNodes, rc);
  ctx.globalAlpha = vs.alpha;

  drawNodeEffects(
    ctx,
    x,
    y,
    vs.size,
    vs.adjustedColor,
    vs.alpha,
    vs.isSelected,
    vs.isCycleNode,
    vs.isDimmed,
    1.0,
    time,
    theme,
  );
  drawNodeIcon(
    ctx,
    node,
    x,
    y,
    vs.size,
    vs.adjustedColor,
    vs.isSelected,
    vs.isHovered,
    rc.getPathForNode,
    theme,
  );

  if (shouldShowNodeLabel(vs.isHovered, vs.isSelected, vs.isConnected, node.id, rc)) {
    drawNodeLabel(
      ctx,
      node,
      x,
      y,
      vs.size,
      vs.adjustedColor,
      vs.alpha,
      vs.isSelected,
      vs.isHovered,
      vs.isConnected,
      vs.isInChain,
      theme,
    );
  }
}

export function renderNodes(rc: NodeRenderContext, viewport: ViewportBounds): void {
  const { ctx, nodes, edges, nodeWeights, connectedNodes } = rc;

  for (const node of nodes) {
    const pos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      rc.layout,
      rc.manualNodePositions,
      rc.manualClusterPositions,
    );
    if (!pos) continue;

    const { x, y } = pos;
    const size = getNodeSize(node, edges, nodeWeights.get(node.id));
    if (!isCircleInViewport({ x, y }, size, viewport)) continue;

    renderSingleNode(node, x, y, size, connectedNodes, rc);
  }
  ctx.globalAlpha = 1.0;
}

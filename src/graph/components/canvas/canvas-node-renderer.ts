import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { type AnimatedValue, getAnimatedAlpha } from '@graph/utils/canvas-animation';
import { colorWithAlpha } from '@graph/utils/canvas-colors';
import { resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { isCircleInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

export interface NodeRenderContext {
  ctx: CanvasRenderingContext2D;
  layout: GraphLayoutController;
  nodes: GraphNode[];
  edges: GraphEdge[];
  zoom: number;
  time: number;
  theme: CanvasTheme;
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredNode: string | null;
  hoveredCluster: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  transitiveDeps: TransitiveResult | undefined;
  transitiveDependents: TransitiveResult | undefined;
  previewFilter: PreviewFilter | undefined;
  nodeWeights: Map<string, number>;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  getPathForNode: (node: GraphNode) => Path2D;
  connectedNodes: Set<string>;
  hubWeightThreshold: number;
  nodeAlphaMap: Map<string, AnimatedValue>;
  showDirectDeps: boolean;
  showTransitiveDeps: boolean;
  showDirectDependents: boolean;
  showTransitiveDependents: boolean;
}

function isSearchDimmed(node: GraphNode, searchQuery: string): boolean {
  return !!searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase());
}

function isSelectionDimmed(
  node: GraphNode,
  isSelected: boolean,
  isChainActive: boolean | GraphNode | null,
  selectedNode: GraphNode | null,
  rc: NodeRenderContext,
): boolean {
  if (!selectedNode || isSelected) return false;
  // When toggles are active, dim nodes not in any active chain
  if (isChainActive) {
    return !isNodeInActiveChain(node.id, rc);
  }
  // No toggles active: don't dim anything
  return false;
}

/** Check if a node belongs to any currently-toggled chain.
 *  Node depths: 0 = selected node itself, 1 = direct neighbor, >=2 = transitive */
function isNodeInActiveChain(nodeId: string, rc: NodeRenderContext): boolean {
  if (rc.transitiveDeps?.nodes.has(nodeId)) {
    const depth = rc.transitiveDeps.nodeDepths?.get(nodeId) ?? 0;
    if (depth <= 1 ? rc.showDirectDeps : rc.showTransitiveDeps) return true;
  }
  if (rc.transitiveDependents?.nodes.has(nodeId)) {
    const depth = rc.transitiveDependents.nodeDepths?.get(nodeId) ?? 0;
    if (depth <= 1 ? rc.showDirectDependents : rc.showTransitiveDependents) return true;
  }
  return false;
}

function isPreviewDimmed(node: GraphNode, previewFilter: PreviewFilter | undefined): boolean {
  if (!previewFilter) return false;
  switch (previewFilter.type) {
    case 'nodeType':
      return node.type !== previewFilter.value;
    case 'platform':
      return node.platform !== previewFilter.value;
    case 'origin':
      return node.origin !== previewFilter.value;
    case 'project':
      return node.project !== previewFilter.value;
    case 'package':
      return !(node.type === NodeType.Package && node.name === previewFilter.value);
    default:
      return false;
  }
}

function isNodeDimmed(
  node: GraphNode,
  isSelected: boolean,
  isChainActive: boolean | GraphNode | null,
  clusterDim: boolean | '' | null,
  rc: NodeRenderContext,
): boolean {
  return (
    isSearchDimmed(node, rc.searchQuery) ||
    isSelectionDimmed(node, isSelected, isChainActive, rc.selectedNode, rc) ||
    isPreviewDimmed(node, rc.previewFilter) ||
    !!clusterDim
  );
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
    const pulse = (Math.sin(time / 300) + 1) / 2;
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

/** Compute adaptive font size that maintains readable screen-apparent size at low zoom */
function getAdaptiveNodeFontSize(zoom: number): number {
  const targetScreenSize = 12;
  if (zoom >= 0.5) return targetScreenSize;
  // Scale inversely with zoom to maintain readable screen size, capped
  const graphSize = targetScreenSize / zoom;
  return Math.min(graphSize, 200);
}

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
  zoom: number,
) {
  const labelText =
    node.name.length > 20 && !isHovered && !isConnected
      ? `${node.name.substring(0, 20)}...`
      : node.name;

  const fontSize = getAdaptiveNodeFontSize(zoom);
  ctx.font = `${isSelected ? '600' : isConnected || isInChain ? '500' : '400'} ${fontSize}px var(--fonts-body, sans-serif)`;
  ctx.textAlign = 'center';
  ctx.fillStyle = adjustedColor;

  const labelY = y + size + fontSize * 1.8;

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
  isChainActive: boolean | GraphNode | null,
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

  const isDimmed = isNodeDimmed(node, isSelected, isChainActive, clusterDim, rc);
  const alpha = getAnimatedAlpha(rc.nodeAlphaMap, node.id);
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
  isChainActive: boolean | GraphNode | null,
  connectedNodes: Set<string>,
  rc: NodeRenderContext,
) {
  const { ctx, theme, time } = rc;
  const vs = resolveNodeVisualState(node, size, isChainActive, connectedNodes, rc);
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
      rc.zoom,
    );
  }
}

export function renderNodes(rc: NodeRenderContext, viewport: ViewportBounds): void {
  const { ctx, nodes, edges, selectedNode, nodeWeights, connectedNodes } = rc;

  // Skip individual node rendering at extreme zoom-out; centroid dots handle visibility
  if (rc.zoom < 0.15) {
    return;
  }

  const isChainActive =
    rc.showDirectDeps ||
    rc.showTransitiveDeps ||
    rc.showDirectDependents ||
    rc.showTransitiveDependents;

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

    renderSingleNode(node, x, y, size, isChainActive, connectedNodes, rc);
  }
  ctx.globalAlpha = 1.0;
}

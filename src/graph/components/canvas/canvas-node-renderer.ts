import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType } from '@shared/schemas/graph.schema';
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
  chainDisplay: string;
  transitiveDeps: TransitiveResult | undefined;
  transitiveDependents: TransitiveResult | undefined;
  previewFilter: PreviewFilter | undefined;
  nodeWeights: Map<string, number>;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  getPathForNode: (node: GraphNode) => Path2D;
  connectedNodes: Set<string>;
}

function getNodeWorldPosition(
  node: GraphNode,
  rc: NodeRenderContext,
): { x: number; y: number } | null {
  const layoutPos = rc.layout.nodePositions.get(node.id);
  const layoutClusterPos = rc.layout.clusterPositions.get(node.project || 'External');
  if (!layoutPos || !layoutClusterPos) return null;

  const clusterId = node.project || 'External';
  const manualClusterPos = rc.manualClusterPositions.get(clusterId);
  const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
  const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;

  const manualPos = rc.manualNodePositions.get(node.id);
  return {
    x: clusterX + (manualPos?.x ?? layoutPos.x),
    y: clusterY + (manualPos?.y ?? layoutPos.y),
  };
}

function isSearchDimmed(node: GraphNode, searchQuery: string): boolean {
  return !!searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase());
}

function isSelectionDimmed(
  isSelected: boolean,
  isConnected: boolean | GraphNode | null,
  isChainActive: boolean | GraphNode | null,
  selectedNode: GraphNode | null,
): boolean {
  return !isChainActive && !!selectedNode && !isSelected && !isConnected;
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
  isConnected: boolean | GraphNode | null,
  isChainActive: boolean | GraphNode | null,
  clusterDim: boolean | '' | null,
  rc: NodeRenderContext,
): boolean {
  return (
    isSearchDimmed(node, rc.searchQuery) ||
    isSelectionDimmed(isSelected, isConnected, isChainActive, rc.selectedNode) ||
    isPreviewDimmed(node, rc.previewFilter) ||
    !!clusterDim
  );
}

/** Parse an rgba/rgb color string and return it with a new alpha value */
function colorWithAlpha(rgbaColor: string, newAlpha: number): string {
  const match = rgbaColor.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
  if (match) {
    return `rgba(${match[1]},${match[2]},${match[3]},${newAlpha})`;
  }
  // Hex color fallback: parse #RRGGBB
  const hexMatch = rgbaColor.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (hexMatch) {
    const r = Number.parseInt(hexMatch[1]!, 16);
    const g = Number.parseInt(hexMatch[2]!, 16);
    const b = Number.parseInt(hexMatch[3]!, 16);
    return `rgba(${r},${g},${b},${newAlpha})`;
  }
  return rgbaColor;
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
    const pulse1 = (Math.sin(time / 800) + 1) / 2;
    const pulse2 = (Math.sin(time / 1200 + 1.5) + 1) / 2;
    const pulse3 = (Math.sin(time / 200) + 1) / 2;

    // Outer glow: radial gradient, slow pulse
    const outerRadius = size + 20 + pulse1 * 6;
    const outerGrad = ctx.createRadialGradient(x, y, size * 0.5, x, y, outerRadius);
    outerGrad.addColorStop(0, colorWithAlpha(adjustedColor, 0.15));
    outerGrad.addColorStop(1, colorWithAlpha(adjustedColor, 0));
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = outerGrad;
    ctx.globalAlpha = alpha;
    ctx.fill();

    // Mid glow: radial gradient, offset phase
    const midRadius = size + 12 + pulse2 * 4;
    const midGrad = ctx.createRadialGradient(x, y, size * 0.3, x, y, midRadius);
    midGrad.addColorStop(0, colorWithAlpha(adjustedColor, 0.25));
    midGrad.addColorStop(1, colorWithAlpha(adjustedColor, 0));
    ctx.beginPath();
    ctx.arc(x, y, midRadius, 0, Math.PI * 2);
    ctx.fillStyle = midGrad;
    ctx.globalAlpha = alpha;
    ctx.fill();

    // Inner ring: thin stroke, higher opacity
    const innerRadius = size + 5 + pulse3 * 2;
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = adjustedColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = alpha * (0.4 + pulse3 * 0.2);
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
  if (isHovered || isSelected) {
    ctx.shadowColor = adjustedColor;
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  const scale = (size / 12) * (isHovered || isSelected ? 1.08 : 1.0);
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const path = getPathForNode(node);
  ctx.fillStyle = theme.tooltipBg;
  ctx.fill(path);

  ctx.strokeStyle = adjustedColor;
  ctx.lineWidth = (isSelected ? 2.5 : 2) / scale;
  ctx.stroke(path);

  ctx.scale(1 / scale, 1 / scale);
  ctx.translate(-x, -y);
  ctx.shadowBlur = 0;
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

  ctx.globalAlpha = alpha * 0.9;
  ctx.shadowColor = theme.shadowColor;
  ctx.shadowBlur = 8;
  ctx.fillText(labelText, x, labelY);

  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillText(labelText, x, labelY);
}

function getNodeChainAlpha(
  nodeId: string,
  isSelected: boolean,
  isInDepsChain: boolean,
  isInDependentsChain: boolean,
  transitiveDeps: TransitiveResult | undefined,
  transitiveDependents: TransitiveResult | undefined,
): number {
  if (isSelected) return 1.0;
  if (!isInDepsChain && !isInDependentsChain) return 0.08;

  let depth = Number.POSITIVE_INFINITY;
  let maxDepth = 1;

  if (isInDepsChain && transitiveDeps) {
    const d = transitiveDeps.nodeDepths.get(nodeId) ?? 0;
    if (d < depth) depth = d;
    maxDepth = Math.max(maxDepth, transitiveDeps.maxDepth);
  }
  if (isInDependentsChain && transitiveDependents) {
    const d = transitiveDependents.nodeDepths.get(nodeId) ?? 0;
    if (d < depth) depth = d;
    maxDepth = Math.max(maxDepth, transitiveDependents.maxDepth);
  }
  if (!Number.isFinite(depth)) depth = 0;

  return 1.0 - (depth / maxDepth) * 0.6;
}

function resolveChainAlpha(
  node: GraphNode,
  isSelected: boolean,
  isChainActive: boolean | GraphNode | null,
  rc: NodeRenderContext,
): number | null {
  if (!isChainActive) return 1.0;

  const isInDepsChain = rc.transitiveDeps?.nodes.has(node.id) ?? false;
  const isInDependentsChain = rc.transitiveDependents?.nodes.has(node.id) ?? false;
  const isInChain = isSelected || isInDepsChain || isInDependentsChain;

  if (rc.chainDisplay === 'direct' && !isInChain) return null;
  if (rc.chainDisplay === 'highlight') {
    return getNodeChainAlpha(
      node.id,
      isSelected,
      isInDepsChain,
      isInDependentsChain,
      rc.transitiveDeps,
      rc.transitiveDependents,
    );
  }
  return 1.0;
}

/** Threshold: top-weighted nodes are considered "hub" nodes */
const HUB_WEIGHT_PERCENTILE = 0.9;

function isHubNode(nodeId: string, rc: NodeRenderContext): boolean {
  if (rc.nodeWeights.size === 0) return false;
  const weight = rc.nodeWeights.get(nodeId) ?? 0;
  const weights = Array.from(rc.nodeWeights.values()).sort((a, b) => a - b);
  const threshold = weights[Math.floor(weights.length * HUB_WEIGHT_PERCENTILE)] ?? 0;
  return weight >= threshold && weight > 0;
}

function shouldShowNodeLabel(
  isHovered: boolean,
  isSelected: boolean,
  isConnected: boolean | GraphNode | null,
  isChainActive: boolean | GraphNode | null,
  chainAlpha: number,
  nodeId: string,
  rc: NodeRenderContext,
): boolean {
  if (rc.zoom >= 0.3 || isHovered || isSelected || isConnected) return true;
  // Always show labels for hub nodes regardless of zoom
  if (isHubNode(nodeId, rc)) return true;
  if (!isChainActive) return false;

  const isInDepsChain = rc.transitiveDeps?.nodes.has(nodeId) ?? false;
  const isInDependentsChain = rc.transitiveDependents?.nodes.has(nodeId) ?? false;
  const isInChain = isSelected || isInDepsChain || isInDependentsChain;
  return isInChain && chainAlpha > 0.3;
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
  isChainActive: boolean | GraphNode | null,
  connectedNodes: Set<string>,
  chainAlpha: number,
  rc: NodeRenderContext,
): NodeVisualState {
  const { edges, nodeWeights, selectedNode, hoveredNode, zoom, theme } = rc;
  const size = getNodeSize(node, edges, nodeWeights.get(node.id));
  const isHovered = hoveredNode === node.id;
  const isSelected = selectedNode?.id === node.id;
  const isConnected = selectedNode && connectedNodes.has(node.id);

  const color = getNodeTypeColorFromTheme(node.type, theme);
  const adjustedColor = adjustColorForZoom(color, zoom);
  const clusterId = node.project || 'External';
  const clusterDim =
    (rc.hoveredCluster && clusterId !== rc.hoveredCluster) ||
    (rc.selectedCluster && clusterId !== rc.selectedCluster);

  const isDimmed = isNodeDimmed(node, isSelected, isConnected, isChainActive, clusterDim, rc);
  const alpha = (isDimmed ? 0.3 : 1.0) * chainAlpha;
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
  isChainActive: boolean | GraphNode | null,
  connectedNodes: Set<string>,
  chainAlpha: number,
  rc: NodeRenderContext,
) {
  const { ctx, theme, time } = rc;
  const vs = resolveNodeVisualState(node, isChainActive, connectedNodes, chainAlpha, rc);
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
    chainAlpha,
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

  if (
    shouldShowNodeLabel(
      vs.isHovered,
      vs.isSelected,
      vs.isConnected,
      isChainActive,
      chainAlpha,
      node.id,
      rc,
    )
  ) {
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
  const { ctx, nodes, edges, selectedNode, viewMode, nodeWeights, connectedNodes } = rc;

  const isChainActive = selectedNode && viewMode !== 'full' && viewMode !== 'path';

  for (const node of nodes) {
    const pos = getNodeWorldPosition(node, rc);
    if (!pos) continue;

    const { x, y } = pos;
    const size = getNodeSize(node, edges, nodeWeights.get(node.id));
    if (!isCircleInViewport({ x, y }, size, viewport)) continue;

    const isSelected = selectedNode?.id === node.id;
    const chainAlpha = resolveChainAlpha(node, isSelected, isChainActive, rc);
    if (chainAlpha === null) continue;

    renderSingleNode(node, x, y, isChainActive, connectedNodes, chainAlpha, rc);
  }
  ctx.globalAlpha = 1.0;
}

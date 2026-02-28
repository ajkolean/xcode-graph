import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { type AnimatedValue, getAnimatedAlpha } from '@graph/utils/canvas-animation';
import { colorWithAlpha } from '@graph/utils/canvas-colors';
import { resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
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

/** Cache for pre-rendered glow bitmaps keyed by color+size */
const glowCache = new Map<string, OffscreenCanvas>();
const GLOW_CACHE_MAX = 64;

function getGlowBitmap(color: string, radius: number): OffscreenCanvas {
  const key = `${color}:${Math.round(radius)}`;
  let cached = glowCache.get(key);
  if (cached) return cached;

  // Evict oldest entries if cache is full
  if (glowCache.size >= GLOW_CACHE_MAX) {
    const firstKey = glowCache.keys().next().value;
    if (firstKey) glowCache.delete(firstKey);
  }

  const dim = Math.ceil(radius * 2);
  cached = new OffscreenCanvas(dim, dim);
  const octx = cached.getContext('2d')!;
  const cx = dim / 2;
  const grad = octx.createRadialGradient(cx, cx, 0, cx, cx, radius);
  grad.addColorStop(0, colorWithAlpha(color, 0.5));
  grad.addColorStop(0.5, colorWithAlpha(color, 0.15));
  grad.addColorStop(1, colorWithAlpha(color, 0));
  octx.fillStyle = grad;
  octx.fillRect(0, 0, dim, dim);
  glowCache.set(key, cached);
  return cached;
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
    const pulse3 = (Math.sin(time / 200) + 1) / 2;

    // Combined outer+mid glow: single radial gradient with 3 stops
    const outerRadius = size + 20 + pulse1 * 6;
    const glowGrad = ctx.createRadialGradient(x, y, size * 0.3, x, y, outerRadius);
    glowGrad.addColorStop(0, colorWithAlpha(adjustedColor, 0.25));
    glowGrad.addColorStop(0.5, colorWithAlpha(adjustedColor, 0.12));
    glowGrad.addColorStop(1, colorWithAlpha(adjustedColor, 0));
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
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
  const scale = (size / 12) * (isHovered || isSelected ? 1.08 : 1.0);

  // Draw pre-rendered glow behind the icon for hovered/selected nodes
  if (isHovered || isSelected) {
    const glowRadius = size * 2;
    const glow = getGlowBitmap(adjustedColor, glowRadius);
    ctx.drawImage(glow, x - glowRadius, y - glowRadius);
  }

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

function resolveChainAlpha(
  _node: GraphNode,
  _isSelected: boolean,
  _isChainActive: boolean | GraphNode | null,
  _rc: NodeRenderContext,
): number {
  return 1.0;
}

function isHubNode(nodeId: string, rc: NodeRenderContext): boolean {
  const weight = rc.nodeWeights.get(nodeId) ?? 0;
  return weight >= rc.hubWeightThreshold && weight > 0;
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
  size: number,
  isChainActive: boolean | GraphNode | null,
  connectedNodes: Set<string>,
  chainAlpha: number,
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

  const isDimmed = isNodeDimmed(node, isSelected, isConnected, isChainActive, clusterDim, rc);
  const dimAlpha = getAnimatedAlpha(rc.nodeAlphaMap, node.id);
  const alpha = dimAlpha * chainAlpha;
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
  chainAlpha: number,
  rc: NodeRenderContext,
) {
  const { ctx, theme, time } = rc;
  const vs = resolveNodeVisualState(node, size, isChainActive, connectedNodes, chainAlpha, rc);
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

    const isSelected = selectedNode?.id === node.id;
    const chainAlpha = resolveChainAlpha(node, isSelected, isChainActive, rc);

    renderSingleNode(node, x, y, size, isChainActive, connectedNodes, chainAlpha, rc);
  }
  ctx.globalAlpha = 1.0;
}

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
  /** User-dragged node positions (relative to cluster) */
  manualNodePositions: Map<string, { x: number; y: number }>;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
  /** Returns the cached Path2D icon shape for a node */
  getPathForNode: (node: GraphNode) => Path2D;
  /** Set of node IDs connected to the selected node */
  connectedNodes: Set<string>;
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
 */
function isNodeDimmed(node: GraphNode, rc: NodeRenderContext): boolean {
  return rc.dimmedNodeIds.has(node.id);
}

/** Draws cycle glow and selection ring effects behind a node. */
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
  /* v8 ignore start -- cycle glow animation; tested via canvas mock with cycle nodes */
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
  /* v8 ignore stop */

  if (isSelected) {
    // Pulsing glow rings that radiate outward from the selected node
    const ringCount = 3;
    const cycleDuration = 2400; // ms for a full ring cycle
    const maxExpand = 24; // max pixels a ring expands beyond the node

    if (prefersReducedMotion.get()) {
      // Static glow for reduced motion
      const glowRadius = size + 8;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.strokeStyle = adjustedColor;
      ctx.lineWidth = 6;
      ctx.globalAlpha = alpha * 0.4;
      ctx.stroke();
    } else {
      for (let i = 0; i < ringCount; i++) {
        const phase = (i / ringCount + time / cycleDuration) % 1;
        const ringRadius = size + 2 + phase * maxExpand;
        // Fade in briefly then fade out — peak at ~20% of cycle
        const fadeIn = Math.min(1, phase / 0.2);
        const fadeOut = 1 - phase;
        const ringAlpha = fadeIn * fadeOut * 0.7;
        // Thick glow band that thins as it expands
        const width = 8 * (1 - phase * 0.6);

        ctx.beginPath();
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = adjustedColor;
        ctx.lineWidth = width;
        ctx.globalAlpha = alpha * ringAlpha;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = alpha;
  }
}

/** Draws the scaled Path2D icon shape for a node with fill and stroke. */
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

/** Pre-computed font strings to avoid per-node string allocation */
const NODE_FONT_SELECTED = `600 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
const NODE_FONT_CONNECTED = `500 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;
const NODE_FONT_NORMAL = `400 ${NODE_LABEL_FONT_SIZE}px var(--fonts-body, sans-serif)`;

/** Draws the text label below a node with a dark halo for readability. */
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

  ctx.font = isSelected
    ? NODE_FONT_SELECTED
    : isConnected || isInChain
      ? NODE_FONT_CONNECTED
      : NODE_FONT_NORMAL;
  ctx.textAlign = 'center';
  ctx.fillStyle = adjustedColor;

  const labelY = y + size + NODE_LABEL_PADDING + NODE_LABEL_FONT_SIZE;

  // Dark halo pass: single strokeText for readability (replaces 8-offset fillText)
  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = theme.shadowColor;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(labelText, x, labelY);

  // Clean text on top
  ctx.globalAlpha = alpha;
  ctx.fillStyle = adjustedColor;
  ctx.fillText(labelText, x, labelY);
}

/** Node labels are always shown regardless of zoom level. */
export function shouldShowNodeLabel(_zoom: number): boolean {
  return true;
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

/** Computes the full visual state for a node including color, opacity, dimming, and chain membership. */
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

  const isDimmed = isNodeDimmed(node, rc);
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

/** Renders a single node with its effects, icon, and optional label. */
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

  if (shouldShowNodeLabel(rc.zoom)) {
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

/** Renders all visible nodes onto the canvas, skipping those outside the viewport. */
export function renderNodes(rc: NodeRenderContext, viewport: ViewportBounds): void {
  const { ctx, nodes, connectedNodes } = rc;

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
    const size = getNodeSize(node);
    if (!isCircleInViewport({ x, y }, size, viewport)) continue;

    renderSingleNode(node, x, y, size, connectedNodes, rc);
  }
  ctx.globalAlpha = 1.0;
}

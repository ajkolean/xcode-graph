/**
 * Edge Drawing Functions
 *
 * Pure canvas drawing functions for graph edges: batched cluster arteries,
 * individual bezier/line edges, arrowheads, glow effects, and style helpers.
 */

import { resolveClusterPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphNode } from '@shared/schemas/graph.types';
import { LOD_THRESHOLDS } from '@shared/utils/zoom-config';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { generateBezierPath } from '@ui/utils/paths';
import { isLineInViewportRaw, type ViewportBounds } from '@ui/utils/viewport';
import type { SceneConfig } from './canvas-scene';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pre-computed per-edge metadata to avoid redundant calculations per frame. */
export interface EdgeMeta {
  key: string;
  isCycle: boolean;
  isHighlighted: boolean;
  inChain: boolean;
  isSpecial: boolean;
  /** True when either endpoint is dimmed — skip rendering entirely. */
  isHidden: boolean;
  endpoints: {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
}

/** Maximum number of cached bezier Path2D objects. */
export const MAX_BEZIER_CACHE_SIZE = 2500;

// ---------------------------------------------------------------------------
// Edge color / opacity helpers
// ---------------------------------------------------------------------------

/** Determine the stroke color for an edge. */
export function resolveEdgeColor(
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isEmphasized: boolean,
  isCycle: boolean,
  theme: CanvasTheme,
  selectedNode: GraphNode | null,
): string {
  if (isCycle) return theme.cycleEdgeColor;
  if (!isEmphasized) return theme.edgeDefault;
  const colorNode = selectedNode && sourceNode.id === selectedNode.id ? targetNode : sourceNode;
  return getNodeTypeColorFromTheme(colorNode.type, theme);
}

/** Determine the global alpha for an edge. */
export function resolveEdgeOpacity(
  edgeKey: string,
  isHighlighted: boolean,
  cycleEdge: boolean,
  inChain: boolean,
  getChainEdgeDepth: (edgeKey: string) => number,
): number {
  if (inChain) {
    return getChainEdgeDepth(edgeKey) === 0 ? 1.0 : 0.5;
  }
  const baseOpacity = isHighlighted ? 1.0 : 0.4;
  return cycleEdge ? Math.max(baseOpacity, 0.8) : baseOpacity;
}

// ---------------------------------------------------------------------------
// Edge glow
// ---------------------------------------------------------------------------

/** Draw a soft glow behind an emphasized edge. */
export function drawEdgeGlow(
  ctx: CanvasRenderingContext2D,
  endpoints: {
    sourceNode: GraphNode;
    targetNode: GraphNode;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  },
  cycleEdge: boolean,
  inChain: boolean,
  isHighlighted: boolean,
  edgeKey: string,
  zoom: number,
  theme: CanvasTheme,
  selectedNode: GraphNode | null,
  getChainEdgeDepth: (edgeKey: string) => number,
  drawEdgePath: (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => void,
): void {
  const glowColor = resolveEdgeColor(
    endpoints.sourceNode,
    endpoints.targetNode,
    true,
    cycleEdge,
    theme,
    selectedNode,
  );
  ctx.save();
  ctx.strokeStyle = glowColor;
  const glowAlpha =
    inChain && !isHighlighted ? (getChainEdgeDepth(edgeKey) === 0 ? 0.15 : 0.08) : 0.15;
  ctx.globalAlpha = glowAlpha;
  ctx.lineWidth = 6 / zoom;
  ctx.setLineDash([]);
  drawEdgePath(ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Edge style
// ---------------------------------------------------------------------------

/** Apply stroke style, dash pattern, and line width for an edge. */
export function applyEdgeStyle(
  ctx: CanvasRenderingContext2D,
  endpoints: { sourceNode: GraphNode; targetNode: GraphNode },
  edgeKey: string,
  isEmphasized: boolean,
  isHighlighted: boolean,
  cycleEdge: boolean,
  inChain: boolean,
  animatedDashOffset: number,
  zoom: number,
  theme: CanvasTheme,
  selectedNode: GraphNode | null,
  getChainEdgeDepth: (edgeKey: string) => number,
): void {
  ctx.strokeStyle = resolveEdgeColor(
    endpoints.sourceNode,
    endpoints.targetNode,
    isEmphasized,
    cycleEdge,
    theme,
    selectedNode,
  );
  ctx.globalAlpha = resolveEdgeOpacity(
    edgeKey,
    isHighlighted,
    cycleEdge,
    inChain,
    getChainEdgeDepth,
  );
  ctx.lineWidth = (isEmphasized ? 2.5 : cycleEdge ? 2 : 1.2) / zoom;

  if (cycleEdge) {
    ctx.setLineDash([4, 4]);
  } else if (isEmphasized) {
    ctx.setLineDash([6, 3]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.lineDashOffset = isEmphasized ? animatedDashOffset : 0;
}

// ---------------------------------------------------------------------------
// Arrowhead
// ---------------------------------------------------------------------------

/** Draw a triangular arrowhead at the target end of an edge. */
export function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  endpoints: { x1: number; y1: number; x2: number; y2: number },
  isEmphasized: boolean,
  zoom: number,
): void {
  const arrowSize = (isEmphasized ? 7 : 5) / zoom;
  const angle = Math.atan2(endpoints.y2 - endpoints.y1, endpoints.x2 - endpoints.x1);
  ctx.save();
  ctx.translate(endpoints.x2, endpoints.y2);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-arrowSize, arrowSize * 0.5);
  ctx.lineTo(-arrowSize, -arrowSize * 0.5);
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Edge path (line or bezier)
// ---------------------------------------------------------------------------

/** Draw an edge path, using a cached bezier Path2D for long edges. */
export function drawEdgePath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bezierPathCache: Map<string, Path2D>,
): void {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  if (distance > 150) {
    const rx1 = Math.round(x1);
    const ry1 = Math.round(y1);
    const rx2 = Math.round(x2);
    const ry2 = Math.round(y2);
    const numericKey = `${rx1},${ry1},${rx2},${ry2}`;
    let path = bezierPathCache.get(numericKey);
    if (!path) {
      const pathStr = generateBezierPath(x1, y1, x2, y2);
      path = new Path2D(pathStr);
      if (bezierPathCache.size >= MAX_BEZIER_CACHE_SIZE) {
        const firstKey = bezierPathCache.keys().next().value;
        if (firstKey) bezierPathCache.delete(firstKey);
      }
      bezierPathCache.set(numericKey, path);
    }
    ctx.stroke(path);
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Cluster arteries (low-zoom aggregated edges)
// ---------------------------------------------------------------------------

/** Draw aggregated cluster-to-cluster artery lines at low zoom. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: flat loop with early-exit guards, not genuinely complex
export function drawClusterArteries(
  ctx: CanvasRenderingContext2D,
  config: SceneConfig,
  viewport: ViewportBounds,
): void {
  const clusterEdges = config.layout.clusterEdges;
  if (!clusterEdges || clusterEdges.length === 0) return;

  const { zoom } = config;
  const hasDimmed = config.dimmedNodeIds.size > 0;

  // Pre-compute which clusters are fully dimmed (all member nodes dimmed)
  let fullyDimmedClusters: Set<string> | null = null;
  if (hasDimmed && config.layout.clusters) {
    fullyDimmedClusters = new Set();
    for (const cluster of config.layout.clusters) {
      if (cluster.nodes.length > 0 && cluster.nodes.every((n) => config.dimmedNodeIds.has(n.id))) {
        fullyDimmedClusters.add(cluster.id);
      }
    }
  }

  ctx.save();
  ctx.strokeStyle = config.theme.edgeDefault;
  ctx.setLineDash([]);

  for (const edge of clusterEdges) {
    const sLayout = config.layout.clusterPositions.get(edge.source);
    const tLayout = config.layout.clusterPositions.get(edge.target);
    if (!sLayout || !tLayout) continue;

    const sPos = resolveClusterPosition(edge.source, sLayout, config.manualClusterPositions);
    const sx = sPos.x;
    const sy = sPos.y;
    const tPos = resolveClusterPosition(edge.target, tLayout, config.manualClusterPositions);
    const tx = tPos.x;
    const ty = tPos.y;

    if (!isLineInViewportRaw(sx, sy, tx, ty, viewport)) continue;

    // Hide artery if either endpoint cluster is fully dimmed
    if (fullyDimmedClusters) {
      if (fullyDimmedClusters.has(edge.source) || fullyDimmedClusters.has(edge.target)) continue;
    }
    ctx.globalAlpha = 0.4;

    ctx.lineWidth = Math.min(6, 1 + Math.log2(edge.weight)) / zoom;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Single edge render
// ---------------------------------------------------------------------------

/** Render a single edge with glow, style, path, and optional arrowhead. */
export function renderSingleEdge(
  ctx: CanvasRenderingContext2D,
  meta: EdgeMeta,
  viewport: ViewportBounds,
  animatedDashOffset: number,
  zoom: number,
  theme: CanvasTheme,
  selectedNode: GraphNode | null,
  getChainEdgeDepthFn: (edgeKey: string) => number,
  drawEdgePathFn: (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => void,
): void {
  const { endpoints, key: edgeKey, isHighlighted, inChain, isCycle: cycleEdge } = meta;
  if (!endpoints) return;
  if (!isLineInViewportRaw(endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2, viewport))
    return;

  const isEmphasized = isHighlighted || inChain;

  if (isEmphasized) {
    drawEdgeGlow(
      ctx,
      endpoints,
      cycleEdge,
      inChain,
      isHighlighted,
      edgeKey,
      zoom,
      theme,
      selectedNode,
      getChainEdgeDepthFn,
      drawEdgePathFn,
    );
  }

  applyEdgeStyle(
    ctx,
    endpoints,
    edgeKey,
    isEmphasized,
    isHighlighted,
    cycleEdge,
    inChain,
    animatedDashOffset,
    zoom,
    theme,
    selectedNode,
    getChainEdgeDepthFn,
  );

  drawEdgePathFn(ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);

  if (zoom >= LOD_THRESHOLDS.ARROWHEADS) {
    drawArrowhead(ctx, endpoints, isEmphasized, zoom);
  }

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { resolveClusterPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { LOD_THRESHOLDS } from '@shared/utils/zoom-config';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { generateBezierPath } from '@ui/utils/paths';
import { isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';

/** Context passed to edge rendering functions each frame. */
export interface EdgeRenderContext {
  /** 2D rendering context of the canvas element */
  ctx: CanvasRenderingContext2D;
  /** Layout controller providing node/cluster positions */
  layout: GraphLayoutController;
  /** All visible nodes (for endpoint resolution) */
  nodes: GraphNode[];
  /** All visible edges to render */
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
  /** ID of the currently hovered cluster, or null */
  hoveredCluster: string | null;
  /** Current view mode (e.g. cluster or flat) */
  viewMode: ViewMode;
  /** Transitive dependency chain from the selected node */
  transitiveDeps: TransitiveResult | undefined;
  /** Transitive dependent chain from the selected node */
  transitiveDependents: TransitiveResult | undefined;
  /** User-dragged node positions (relative to cluster) */
  manualNodePositions: Map<string, { x: number; y: number }>;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
  /** Fast lookup map from node ID to GraphNode */
  nodeMap: Map<string, GraphNode>;
  /** Cached Path2D objects keyed by edge key */
  edgePathCache: Map<string, Path2D>;
  /** Whether direct dependencies are highlighted */
  showDirectDeps: boolean;
  /** Whether transitive dependencies are highlighted */
  showTransitiveDeps: boolean;
  /** Whether direct dependents are highlighted */
  showDirectDependents: boolean;
  /** Whether transitive dependents are highlighted */
  showTransitiveDependents: boolean;
}

/** Resolves source and target world-space coordinates for an edge. */
function resolveEdgeEndpoints(
  edge: GraphEdge,
  rc: EdgeRenderContext,
): {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  sourceLayout: NodePosition;
  targetLayout: NodePosition;
  sourceClusterId: string;
  targetClusterId: string;
  sClusterX: number;
  sClusterY: number;
  tClusterX: number;
  tClusterY: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} | null {
  const sourceNode = rc.nodeMap.get(edge.source);
  const targetNode = rc.nodeMap.get(edge.target);
  if (!sourceNode || !targetNode) return null;

  const sourceLayout = rc.layout.nodePositions.get(edge.source);
  const targetLayout = rc.layout.nodePositions.get(edge.target);
  if (!sourceLayout || !targetLayout) return null;

  const sourceClusterId = sourceNode.project || 'External';
  const targetClusterId = targetNode.project || 'External';
  const sClusterLayout = rc.layout.clusterPositions.get(sourceClusterId);
  const tClusterLayout = rc.layout.clusterPositions.get(targetClusterId);
  if (!sClusterLayout || !tClusterLayout) return null;

  const sCluster = resolveClusterPosition(
    sourceClusterId,
    sClusterLayout,
    rc.manualClusterPositions,
  );
  const tCluster = resolveClusterPosition(
    targetClusterId,
    tClusterLayout,
    rc.manualClusterPositions,
  );

  const sManual = rc.manualNodePositions.get(edge.source);
  const tManual = rc.manualNodePositions.get(edge.target);

  return {
    sourceNode,
    targetNode,
    sourceLayout,
    targetLayout,
    sourceClusterId,
    targetClusterId,
    sClusterX: sCluster.x,
    sClusterY: sCluster.y,
    tClusterX: tCluster.x,
    tClusterY: tCluster.y,
    x1: sCluster.x + (sManual?.x ?? sourceLayout.x),
    y1: sCluster.y + (sManual?.y ?? sourceLayout.y),
    x2: tCluster.x + (tManual?.x ?? targetLayout.x),
    y2: tCluster.y + (tManual?.y ?? targetLayout.y),
  };
}

/** Returns true if the edge connects two nodes in the same strongly-connected component. */
function isCycleEdge(edge: GraphEdge, layout: GraphLayoutController): boolean {
  const sourceScc = layout.nodeSccId?.get(edge.source);
  const targetScc = layout.nodeSccId?.get(edge.target);
  return (
    sourceScc !== undefined &&
    targetScc !== undefined &&
    sourceScc === targetScc &&
    (layout.sccSizes?.get(sourceScc) ?? 0) > 1
  );
}

/** Determines the stroke color for an edge based on cycle state, emphasis, and selection. */
function resolveEdgeColor(
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isEmphasized: boolean,
  isCycle: boolean,
  selectedNode: GraphNode | null,
  theme: CanvasTheme,
): string {
  if (isCycle) return theme.cycleEdgeColor;

  // Non-emphasized edges use a neutral gray so they don't dominate the canvas
  if (!isEmphasized) return theme.edgeDefault;

  const colorNode = selectedNode && sourceNode.id === selectedNode.id ? targetNode : sourceNode;
  return getNodeTypeColorFromTheme(colorNode.type, theme);
}

/** Get the minimum edge depth across active chains (deps/dependents) */
function getChainEdgeDepth(edgeKey: string, rc: EdgeRenderContext): number {
  let depth = Number.POSITIVE_INFINITY;
  if (rc.transitiveDeps?.edges.has(edgeKey)) {
    depth = Math.min(depth, rc.transitiveDeps.edgeDepths.get(edgeKey) ?? 0);
  }
  /* v8 ignore start -- transitive dependents depth lookup; tested in edge renderer tests */
  if (rc.transitiveDependents?.edges.has(edgeKey)) {
    depth = Math.min(depth, rc.transitiveDependents.edgeDepths.get(edgeKey) ?? 0);
  }
  /* v8 ignore stop */
  return Number.isFinite(depth) ? depth : 0;
}

/** Computes the final opacity for an edge considering highlight, chain depth, and cycle state. */
function computeEdgeOpacity(
  edgeKey: string,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  isCycle: boolean,
  rc: EdgeRenderContext,
): number {
  // Chain edges: direct (depth 0) = full opacity, transitive (depth >= 1) = 50%
  if (isChainActive && inChain) {
    const depth = getChainEdgeDepth(edgeKey, rc);
    return depth === 0 ? 1.0 : 0.5;
  }

  const baseOpacity = isHighlighted ? 1.0 : 0.25;
  return isCycle ? Math.max(baseOpacity, 0.8) : baseOpacity;
}

/** Draws a triangular arrowhead at the target end of an edge. */
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fromX: number,
  fromY: number,
  zoom: number,
  highlighted = true,
) {
  const arrowSize = (highlighted ? 7 : 5) / zoom;
  const angle = Math.atan2(y - fromY, x - fromX);
  ctx.save();
  ctx.translate(x, y);
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

/** Draws an intra-cluster edge as a bezier curve (long distances) or straight line (short). */
function drawDirectEdgePath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  edgeKey: string,
  edgePathCache: Map<string, Path2D>,
) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  if (distance > 150) {
    /* v8 ignore start -- bezier path for long edges; tested via canvas mock */
    let path = edgePathCache.get(edgeKey);
    if (!path) {
      path = new Path2D(generateBezierPath(x1, y1, x2, y2));
      edgePathCache.set(edgeKey, path);
    }
    ctx.stroke(path);
    /* v8 ignore stop */
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/** Configures the canvas stroke style, opacity, line width, and dash pattern for an edge. */
function applyEdgeStyle(
  ctx: CanvasRenderingContext2D,
  edgeKey: string,
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  cycleEdge: boolean,
  animatedDashOffset: number,
  rc: EdgeRenderContext,
) {
  const isEmphasized = isHighlighted || (isChainActive && inChain);
  ctx.strokeStyle = resolveEdgeColor(
    sourceNode,
    targetNode,
    isEmphasized,
    cycleEdge,
    rc.selectedNode,
    rc.theme,
  );
  ctx.globalAlpha = computeEdgeOpacity(
    edgeKey,
    isHighlighted,
    isChainActive,
    inChain,
    cycleEdge,
    rc,
  );
  ctx.lineWidth = (isEmphasized ? 2.5 : cycleEdge ? 2 : 1) / rc.zoom;
  const animateEdge = isEmphasized;

  if (cycleEdge) {
    ctx.setLineDash([4, 4]);
  } else if (animateEdge) {
    ctx.setLineDash([6, 3]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.lineDashOffset = animateEdge ? animatedDashOffset : 0;
}

/** Checks whether an edge is within the viewport. */
function isEdgeVisible(
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  viewport: ViewportBounds,
): boolean {
  return isLineInViewport(
    { x: endpoints.x1, y: endpoints.y1 },
    { x: endpoints.x2, y: endpoints.y2 },
    viewport,
  );
}

/** Draws an edge path as a direct bezier curve or straight line. */
function drawEdgePath(
  edgeKey: string,
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  rc: EdgeRenderContext,
) {
  drawDirectEdgePath(
    rc.ctx,
    endpoints.x1,
    endpoints.y1,
    endpoints.x2,
    endpoints.y2,
    edgeKey,
    rc.edgePathCache,
  );
}

/** Renders a single edge with glow, style, path, and arrowhead passes. */
function renderSingleEdge(
  edge: GraphEdge,
  edgeKey: string,
  viewport: ViewportBounds,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  animatedDashOffset: number,
  rc: EdgeRenderContext,
) {
  const isEmphasized = isHighlighted || (isChainActive && inChain);

  const endpoints = resolveEdgeEndpoints(edge, rc);
  if (!endpoints) return;
  if (!isEdgeVisible(endpoints, viewport)) return;

  const cycleEdge = isCycleEdge(edge, rc.layout);

  // Glow pass behind emphasized edges (highlighted or chain)
  if (isEmphasized) {
    const glowColor = resolveEdgeColor(
      endpoints.sourceNode,
      endpoints.targetNode,
      true,
      cycleEdge,
      rc.selectedNode,
      rc.theme,
    );
    rc.ctx.save();
    rc.ctx.strokeStyle = glowColor;
    // Chain edges scale glow with their opacity (direct=full, transitive=dimmer)
    const glowAlpha =
      isChainActive && inChain && !isHighlighted
        ? getChainEdgeDepth(edgeKey, rc) === 0
          ? 0.15
          : 0.08
        : 0.15;
    rc.ctx.globalAlpha = glowAlpha;
    rc.ctx.lineWidth = 6 / rc.zoom;
    rc.ctx.setLineDash([]);
    drawEdgePath(edgeKey, endpoints, rc);
    rc.ctx.restore();
  }

  applyEdgeStyle(
    rc.ctx,
    edgeKey,
    endpoints.sourceNode,
    endpoints.targetNode,
    isHighlighted,
    isChainActive,
    inChain,
    cycleEdge,
    animatedDashOffset,
    rc,
  );

  drawEdgePath(edgeKey, endpoints, rc);

  // Draw arrowhead at target end (skip at low zoom — too small to see)
  if (rc.zoom >= LOD_THRESHOLDS.ARROWHEADS) {
    drawArrowhead(
      rc.ctx,
      endpoints.x2,
      endpoints.y2,
      endpoints.x1,
      endpoints.y1,
      rc.zoom,
      isEmphasized,
    );
  }

  rc.ctx.setLineDash([]);
  rc.ctx.lineDashOffset = 0;
}

/** Check if a chain result matches a toggle pair (direct / transitive) */
function matchesToggle(
  chain: TransitiveResult | undefined,
  edgeKey: string,
  showDirect: boolean,
  showTransitive: boolean,
): boolean {
  if (!chain?.edges.has(edgeKey)) return false;
  const depth = chain.edgeDepths.get(edgeKey) ?? 0;
  return depth === 0 ? showDirect : showTransitive;
}

/** Check if a specific edge should be highlighted based on per-toggle logic */
function isEdgeInActiveChain(edgeKey: string, rc: EdgeRenderContext): boolean {
  return (
    matchesToggle(rc.transitiveDeps, edgeKey, rc.showDirectDeps, rc.showTransitiveDeps) ||
    matchesToggle(
      rc.transitiveDependents,
      edgeKey,
      rc.showDirectDependents,
      rc.showTransitiveDependents,
    )
  );
}

/** Zoom threshold below which non-emphasized edges are hidden to reduce visual noise. */
const EDGE_HIDE_ZOOM_THRESHOLD = 0.3;

/** Renders all visible edges onto the canvas, applying highlight and chain logic. */
export function renderEdges(rc: EdgeRenderContext, viewport: ViewportBounds): void {
  const { ctx, edges } = rc;

  const isChainActive =
    rc.showDirectDeps ||
    rc.showTransitiveDeps ||
    rc.showDirectDependents ||
    rc.showTransitiveDependents;

  // Cache per-frame values to avoid recomputing per-edge
  const reducedMotion = prefersReducedMotion.get();
  const animatedDashOffset = reducedMotion ? 0 : rc.time / 20;
  const hideNonEmphasized = rc.zoom < EDGE_HIDE_ZOOM_THRESHOLD;

  ctx.lineWidth = 1;

  for (const edge of edges) {
    const edgeKey = `${edge.source}->${edge.target}`;
    const inChain = isChainActive && isEdgeInActiveChain(edgeKey, rc);

    const isHighlighted =
      rc.selectedCluster != null &&
      ((rc.showDirectDeps && rc.nodeMap.get(edge.source)?.project === rc.selectedCluster) ||
        (rc.showDirectDependents && rc.nodeMap.get(edge.target)?.project === rc.selectedCluster));

    // Skip non-emphasized edges when zoomed out far to reduce visual noise
    if (hideNonEmphasized && !isHighlighted && !(isChainActive && inChain)) continue;

    renderSingleEdge(
      edge,
      edgeKey,
      viewport,
      isHighlighted,
      isChainActive,
      inChain,
      animatedDashOffset,
      rc,
    );
  }
}

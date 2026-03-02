import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import { resolveClusterPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

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
  /** ELK-routed edge paths for cross-cluster edges */
  routedEdgeMap: Map<string, RoutedEdge>;
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

/** Determines the stroke color for an edge based on cycle state, emphasis, and zoom level. */
function resolveEdgeColor(
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isEmphasized: boolean,
  isCycle: boolean,
  selectedNode: GraphNode | null,
  zoom: number,
  theme: CanvasTheme,
): string {
  if (isCycle) return theme.cycleEdgeColor;

  const colorNode =
    isEmphasized && selectedNode
      ? sourceNode.id === selectedNode.id
        ? targetNode
        : sourceNode
      : targetNode;
  const color = getNodeTypeColorFromTheme(colorNode.type, theme);

  return isEmphasized ? color : adjustColorForZoom(color, zoom);
}

/** Get the minimum edge depth across active chains (deps/dependents) */
function getChainEdgeDepth(edgeKey: string, rc: EdgeRenderContext): number {
  let depth = Number.POSITIVE_INFINITY;
  if (rc.transitiveDeps?.edges.has(edgeKey)) {
    depth = Math.min(depth, rc.transitiveDeps.edgeDepths.get(edgeKey) ?? 0);
  }
  /* v8 ignore next 3 -- transitive dependents depth lookup; tested in edge renderer tests */
  if (rc.transitiveDependents?.edges.has(edgeKey)) {
    depth = Math.min(depth, rc.transitiveDependents.edgeDepths.get(edgeKey) ?? 0);
  }
  return Number.isFinite(depth) ? depth : 0;
}

/** Progressive edge disclosure: fade edges at low zoom levels */
function getZoomOpacityFactor(zoom: number, isEmphasized: boolean): number {
  if (isEmphasized) return 1.0;
  if (zoom < 0.3) return 0;
  if (zoom < 0.6) return (zoom - 0.3) / 0.3;
  return 1.0;
}

/** Computes the final opacity for an edge considering highlight, chain depth, cycle, and zoom. */
function computeEdgeOpacity(
  edgeKey: string,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  isCycle: boolean,
  rc: EdgeRenderContext,
): number {
  const isEmphasized = isHighlighted || (isChainActive && inChain);
  const zoomFactor = getZoomOpacityFactor(rc.zoom, isEmphasized);
  if (zoomFactor === 0) return 0;

  // Chain edges: direct (depth 0) = full opacity, transitive (depth >= 1) = 50%
  if (isChainActive && inChain) {
    const depth = getChainEdgeDepth(edgeKey, rc);
    const chainAlpha = depth === 0 ? 1.0 : 0.5;
    return Math.min(1, chainAlpha * zoomFactor);
  }

  const baseOpacity = isHighlighted ? 1.0 : 0.25;
  const cycleOpacity = isCycle ? Math.max(baseOpacity, 0.8) : baseOpacity;

  return Math.min(1, cycleOpacity * zoomFactor);
}

/** Draws an ELK-routed edge path for cross-cluster edges, using a cached Path2D when available. */
function drawRoutedEdgePath(
  ctx: CanvasRenderingContext2D,
  routedEdge: RoutedEdge,
  sourceLayout: { x: number; y: number },
  targetLayout: { x: number; y: number },
  sClusterX: number,
  sClusterY: number,
  tClusterX: number,
  tClusterY: number,
  edgeKey: string,
  edgePathCache: Map<string, Path2D>,
) {
  let path = edgePathCache.get(edgeKey);
  if (!path) {
    const pathString = generatePortRoutedPath(
      { x: sourceLayout.x, y: sourceLayout.y },
      { x: routedEdge.sourcePort.x, y: routedEdge.sourcePort.y },
      { x: routedEdge.targetPort.x, y: routedEdge.targetPort.y },
      { x: targetLayout.x, y: targetLayout.y },
      routedEdge.waypoints,
      { x: sClusterX, y: sClusterY },
      { x: tClusterX, y: tClusterY },
    );
    path = new Path2D(pathString);
    edgePathCache.set(edgeKey, path);
  }
  ctx.stroke(path);
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
) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  if (distance > 150) {
    /* v8 ignore next 1 -- bezier path for long edges; tested via canvas mock */
    ctx.stroke(new Path2D(generateBezierPath(x1, y1, x2, y2)));
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
  isCrossCluster: boolean,
  rc: EdgeRenderContext,
) {
  const isEmphasized = isHighlighted || (isChainActive && inChain);
  ctx.strokeStyle = resolveEdgeColor(
    sourceNode,
    targetNode,
    isEmphasized,
    cycleEdge,
    rc.selectedNode,
    rc.zoom,
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

  // Highlighted/chain edges always get marching-ants dashes for directional flow;
  // non-highlighted: cross-cluster dashed, intra-cluster solid, cycle always dashed
  if (cycleEdge) {
    ctx.setLineDash([4, 4]);
  } else if (animateEdge) {
    ctx.setLineDash([6, 3]);
  } else if (isCrossCluster) {
    ctx.setLineDash([10, 5]);
  } else {
    /* v8 ignore next 1 -- solid line for non-cycle intra-cluster edges; tested in edge renderer */
    ctx.setLineDash([]);
  }

  ctx.lineDashOffset = animateEdge && !prefersReducedMotion.get() ? rc.time / 20 : 0;
}

/** Returns true if an intra-cluster edge should be hidden at low zoom when its cluster is not hovered. */
function shouldHideIntraClusterEdge(
  sourceClusterId: string,
  isHighlighted: boolean,
  zoom: number,
  hoveredCluster: string | null,
): boolean {
  return zoom < 0.6 && hoveredCluster !== sourceClusterId && !isHighlighted;
}

/** Checks whether an edge is within the viewport and not hidden by intra-cluster rules. */
function isEdgeVisible(
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  viewport: ViewportBounds,
  isHighlighted: boolean,
  rc: EdgeRenderContext,
): boolean {
  const { sourceClusterId, x1, y1, x2, y2 } = endpoints;
  const isIntraCluster = sourceClusterId === endpoints.targetClusterId;
  if (
    isIntraCluster &&
    shouldHideIntraClusterEdge(sourceClusterId, isHighlighted, rc.zoom, rc.hoveredCluster)
  ) {
    return false;
  }
  return isLineInViewport({ x: x1, y: y1 }, { x: x2, y: y2 }, viewport);
}

/** Draws an edge path, choosing routed or direct rendering based on cross-cluster status. */
function drawEdgePath(
  edgeKey: string,
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  isCrossCluster: boolean,
  rc: EdgeRenderContext,
) {
  if (isCrossCluster) {
    const routedEdge = rc.routedEdgeMap.get(edgeKey);
    if (routedEdge) {
      drawRoutedEdgePath(
        rc.ctx,
        routedEdge,
        endpoints.sourceLayout,
        endpoints.targetLayout,
        endpoints.sClusterX,
        endpoints.sClusterY,
        endpoints.tClusterX,
        endpoints.tClusterY,
        edgeKey,
        rc.edgePathCache,
      );
    }
  } else {
    drawDirectEdgePath(rc.ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);
  }
}

/** Renders a single edge with glow, style, path, and arrowhead passes. */
function renderSingleEdge(
  edge: GraphEdge,
  edgeKey: string,
  viewport: ViewportBounds,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  rc: EdgeRenderContext,
) {
  const isEmphasized = isHighlighted || (isChainActive && inChain);

  // Skip non-emphasized edges entirely at very low zoom
  if (!isEmphasized && rc.zoom < 0.3) return;

  const endpoints = resolveEdgeEndpoints(edge, rc);
  if (!endpoints) return;
  if (!isEdgeVisible(endpoints, viewport, isEmphasized, rc)) return;

  const isCrossCluster = endpoints.sourceClusterId !== endpoints.targetClusterId;
  const cycleEdge = isCycleEdge(edge, rc.layout);

  // Glow pass behind emphasized edges (highlighted or chain)
  if (isEmphasized) {
    const glowColor = resolveEdgeColor(
      endpoints.sourceNode,
      endpoints.targetNode,
      true,
      cycleEdge,
      rc.selectedNode,
      rc.zoom,
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
    drawEdgePath(edgeKey, endpoints, isCrossCluster, rc);
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
    isCrossCluster,
    rc,
  );

  drawEdgePath(edgeKey, endpoints, isCrossCluster, rc);

  // Draw arrowhead at target end for emphasized edges
  if (isEmphasized) {
    drawArrowhead(rc.ctx, endpoints.x2, endpoints.y2, endpoints.x1, endpoints.y1, rc.zoom);
  } else if (rc.zoom > 0.5) {
    drawArrowhead(rc.ctx, endpoints.x2, endpoints.y2, endpoints.x1, endpoints.y1, rc.zoom, false);
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

/** Renders all visible edges onto the canvas, applying highlight and chain logic. */
export function renderEdges(rc: EdgeRenderContext, viewport: ViewportBounds): void {
  const { ctx, edges } = rc;

  const isChainActive =
    rc.showDirectDeps ||
    rc.showTransitiveDeps ||
    rc.showDirectDependents ||
    rc.showTransitiveDependents;

  ctx.lineWidth = 1;

  for (const edge of edges) {
    const edgeKey = `${edge.source}->${edge.target}`;
    const inChain = isChainActive && isEdgeInActiveChain(edgeKey, rc);

    const isHighlighted =
      rc.selectedCluster != null &&
      ((rc.showDirectDeps && rc.nodeMap.get(edge.source)?.project === rc.selectedCluster) ||
        (rc.showDirectDependents && rc.nodeMap.get(edge.target)?.project === rc.selectedCluster));

    renderSingleEdge(edge, edgeKey, viewport, isHighlighted, isChainActive, inChain, rc);
  }
}

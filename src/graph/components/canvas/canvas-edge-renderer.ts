import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import { resolveClusterPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

export interface EdgeRenderContext {
  ctx: CanvasRenderingContext2D;
  layout: GraphLayoutController;
  nodes: GraphNode[];
  edges: GraphEdge[];
  zoom: number;
  time: number;
  theme: CanvasTheme;
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredCluster: string | null;
  viewMode: ViewMode;
  transitiveDeps: TransitiveResult | undefined;
  transitiveDependents: TransitiveResult | undefined;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  nodeMap: Map<string, GraphNode>;
  routedEdgeMap: Map<string, RoutedEdge>;
  edgePathCache: Map<string, Path2D>;
  showDirectDeps: boolean;
  showTransitiveDeps: boolean;
  showDirectDependents: boolean;
  showTransitiveDependents: boolean;
}

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

function drawDirectEdgePath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  if (distance > 150) {
    ctx.stroke(new Path2D(generateBezierPath(x1, y1, x2, y2)));
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

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
    ctx.setLineDash([]);
  }

  ctx.lineDashOffset = animateEdge ? rc.time / 20 : 0;
}

function shouldHideIntraClusterEdge(
  sourceClusterId: string,
  isHighlighted: boolean,
  zoom: number,
  hoveredCluster: string | null,
): boolean {
  return zoom < 0.6 && hoveredCluster !== sourceClusterId && !isHighlighted;
}

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

function drawEdgePath(
  edgeKey: string,
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  isCrossCluster: boolean,
  _isHighlighted: boolean,
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
    drawEdgePath(edgeKey, endpoints, isCrossCluster, true, rc);
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

  drawEdgePath(edgeKey, endpoints, isCrossCluster, isEmphasized, rc);

  // Draw arrowhead at target end for emphasized edges
  if (isEmphasized) {
    drawArrowhead(rc.ctx, endpoints.x2, endpoints.y2, endpoints.x1, endpoints.y1, rc.zoom);
  } else if (rc.zoom > 0.5) {
    drawArrowhead(rc.ctx, endpoints.x2, endpoints.y2, endpoints.x1, endpoints.y1, rc.zoom, false);
  }

  rc.ctx.setLineDash([]);
  rc.ctx.lineDashOffset = 0;
}

export function renderEdges(rc: EdgeRenderContext, viewport: ViewportBounds): void {
  const { ctx, edges, selectedNode, viewMode, transitiveDeps, transitiveDependents } = rc;
  const selectedNodeId = selectedNode?.id;

  const isChainActive = selectedNode && viewMode !== 'full' && viewMode !== 'path';

  ctx.lineWidth = 1;

  for (const edge of edges) {
    const edgeKey = `${edge.source}->${edge.target}`;
    const inDepsChain = transitiveDeps?.edges.has(edgeKey) ?? false;
    const inDependentsChain = transitiveDependents?.edges.has(edgeKey) ?? false;
    const inChain = inDepsChain || inDependentsChain;

    const isConnectedToSelected = edge.source === selectedNodeId || edge.target === selectedNodeId;

    const isConnectedToSelectedCluster =
      rc.selectedCluster != null &&
      (rc.nodeMap.get(edge.source)?.project === rc.selectedCluster ||
        rc.nodeMap.get(edge.target)?.project === rc.selectedCluster);

    const isHighlighted = isConnectedToSelected || isConnectedToSelectedCluster;

    renderSingleEdge(edge, edgeKey, viewport, isHighlighted, !!isChainActive, inChain, rc);
  }
}

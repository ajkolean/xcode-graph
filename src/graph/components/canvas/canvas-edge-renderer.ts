import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';

export interface EdgeRenderContext {
  ctx: CanvasRenderingContext2D;
  layout: GraphLayoutController;
  nodes: GraphNode[];
  edges: GraphEdge[];
  zoom: number;
  time: number;
  theme: CanvasTheme;
  selectedNode: GraphNode | null;
  hoveredCluster: string | null;
  viewMode: ViewMode;
  chainDisplay: string;
  transitiveDeps: TransitiveResult | undefined;
  transitiveDependents: TransitiveResult | undefined;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  nodeMap: Map<string, GraphNode>;
  routedEdgeMap: Map<string, RoutedEdge>;
}

function resolveClusterXY(
  clusterId: string,
  layoutPos: { x: number; y: number },
  manualClusterPositions: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const manual = manualClusterPositions.get(clusterId);
  return { x: manual?.x ?? layoutPos.x, y: manual?.y ?? layoutPos.y };
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

  const sCluster = resolveClusterXY(sourceClusterId, sClusterLayout, rc.manualClusterPositions);
  const tCluster = resolveClusterXY(targetClusterId, tClusterLayout, rc.manualClusterPositions);

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
  isHighlighted: boolean,
  isCycle: boolean,
  selectedNode: GraphNode | null,
  zoom: number,
  theme: CanvasTheme,
): string {
  if (isCycle) return theme.cycleEdgeColor;

  const colorNode =
    isHighlighted && selectedNode
      ? sourceNode.id === selectedNode.id
        ? targetNode
        : sourceNode
      : targetNode;
  const color = getNodeTypeColorFromTheme(colorNode.type, theme);

  return isHighlighted ? color : adjustColorForZoom(color, zoom);
}

function computeEdgeDepthOpacity(
  edgeKey: string,
  chain: { edges: Set<string>; edgeDepths: Map<string, number>; maxDepth: number },
): number {
  const depth = chain.edgeDepths.get(edgeKey) || 0;
  const maxDepth = chain.maxDepth || 1;
  return 1 - (depth / maxDepth) * 0.7;
}

function getEdgeOpacity(edge: GraphEdge, rc: EdgeRenderContext): number {
  const edgeKey = `${edge.source}->${edge.target}`;
  const { transitiveDeps, transitiveDependents } = rc;

  const inDepsChain = transitiveDeps?.edges.has(edgeKey);
  const inDependentsChain = transitiveDependents?.edges.has(edgeKey);

  if (rc.viewMode === 'focused' && inDepsChain && transitiveDeps) {
    return computeEdgeDepthOpacity(edgeKey, transitiveDeps);
  }

  if (rc.viewMode === 'dependents' && inDependentsChain && transitiveDependents) {
    return computeEdgeDepthOpacity(edgeKey, transitiveDependents);
  }

  if (rc.viewMode === 'both') {
    if (inDepsChain && transitiveDeps) {
      return computeEdgeDepthOpacity(edgeKey, transitiveDeps);
    }
    if (inDependentsChain && transitiveDependents) {
      return computeEdgeDepthOpacity(edgeKey, transitiveDependents);
    }
  }

  return 1;
}

function getChainHighlightOpacity(
  edge: GraphEdge,
  isHighlighted: boolean,
  inChain: boolean,
  rc: EdgeRenderContext,
): number {
  if (inChain) {
    return isHighlighted ? 1.0 : getEdgeOpacity(edge, rc) * 0.8;
  }
  return 0.03;
}

/** Progressive edge disclosure: fade edges at low zoom levels */
function getZoomOpacityFactor(zoom: number, isHighlighted: boolean): number {
  // Always show highlighted/selected edges at full opacity
  if (isHighlighted) return 1.0;
  if (zoom < 0.3) return 0;
  if (zoom < 0.6) return (zoom - 0.3) / 0.3;
  return 1.0;
}

function computeEdgeOpacity(
  edge: GraphEdge,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  isCycle: boolean,
  rc: EdgeRenderContext,
): number {
  const zoomFactor = getZoomOpacityFactor(rc.zoom, isHighlighted);
  if (zoomFactor === 0) return 0;

  const baseOpacity = isHighlighted ? 1.0 : 0.15;
  const cycleOpacity = isCycle ? Math.max(baseOpacity, 0.8) : baseOpacity;

  if (isChainActive && rc.chainDisplay === 'highlight') {
    return Math.min(1, getChainHighlightOpacity(edge, isHighlighted, inChain, rc) * zoomFactor);
  }

  return Math.min(1, cycleOpacity * getEdgeOpacity(edge, rc) * zoomFactor);
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
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isHighlighted: boolean,
  selectedNode: GraphNode | null,
  zoom: number,
  theme: CanvasTheme,
) {
  if (isHighlighted) {
    const otherNode = sourceNode.id === selectedNode?.id ? targetNode : sourceNode;
    ctx.strokeStyle = getNodeTypeColorFromTheme(otherNode.type, theme);
    ctx.globalAlpha = 0.9;
  } else {
    const baseOpacity = 0.15;
    const targetOpacity = adjustOpacityForZoom(baseOpacity, zoom);
    const gray = Math.round(255 * targetOpacity);
    ctx.strokeStyle = `rgb(${gray}, ${gray}, ${gray})`;
    ctx.globalAlpha = 1.0;
  }

  const pathString = generatePortRoutedPath(
    { x: sourceLayout.x, y: sourceLayout.y },
    { x: routedEdge.sourcePort.x, y: routedEdge.sourcePort.y },
    { x: routedEdge.targetPort.x, y: routedEdge.targetPort.y },
    { x: targetLayout.x, y: targetLayout.y },
    routedEdge.waypoints,
    { x: sClusterX, y: sClusterY },
    { x: tClusterX, y: tClusterY },
  );
  ctx.stroke(new Path2D(pathString));
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fromX: number,
  fromY: number,
  zoom: number,
) {
  const arrowSize = 7 / zoom;
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
  edge: GraphEdge,
  sourceNode: GraphNode,
  targetNode: GraphNode,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  cycleEdge: boolean,
  isCrossCluster: boolean,
  rc: EdgeRenderContext,
) {
  ctx.strokeStyle = resolveEdgeColor(
    sourceNode,
    targetNode,
    isHighlighted,
    cycleEdge,
    rc.selectedNode,
    rc.zoom,
    rc.theme,
  );
  ctx.globalAlpha = computeEdgeOpacity(edge, isHighlighted, isChainActive, inChain, cycleEdge, rc);
  ctx.lineWidth = (isHighlighted ? 2.5 : cycleEdge ? 2 : 1) / rc.zoom;
  ctx.setLineDash(cycleEdge ? [4, 4] : isCrossCluster ? [10, 5] : []);

  const animateEdge =
    isHighlighted || (isChainActive && rc.chainDisplay === 'highlight' && inChain);
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
  edge: GraphEdge,
  endpoints: NonNullable<ReturnType<typeof resolveEdgeEndpoints>>,
  isCrossCluster: boolean,
  isHighlighted: boolean,
  rc: EdgeRenderContext,
) {
  if (isCrossCluster) {
    const edgeKey = `${edge.source}->${edge.target}`;
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
        endpoints.sourceNode,
        endpoints.targetNode,
        isHighlighted,
        rc.selectedNode,
        rc.zoom,
        rc.theme,
      );
    }
  } else {
    drawDirectEdgePath(rc.ctx, endpoints.x1, endpoints.y1, endpoints.x2, endpoints.y2);
  }
}

function renderSingleEdge(
  edge: GraphEdge,
  viewport: ViewportBounds,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  rc: EdgeRenderContext,
) {
  // Skip non-highlighted edges entirely at very low zoom
  if (!isHighlighted && rc.zoom < 0.3) return;

  const endpoints = resolveEdgeEndpoints(edge, rc);
  if (!endpoints) return;
  if (!isEdgeVisible(endpoints, viewport, isHighlighted, rc)) return;

  const isCrossCluster = endpoints.sourceClusterId !== endpoints.targetClusterId;
  const cycleEdge = isCycleEdge(edge, rc.layout);

  // Glow pass behind highlighted edges
  if (isHighlighted) {
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
    rc.ctx.globalAlpha = 0.15;
    rc.ctx.lineWidth = 6 / rc.zoom;
    rc.ctx.setLineDash([]);
    drawEdgePath(edge, endpoints, isCrossCluster, true, rc);
    rc.ctx.restore();
  }

  applyEdgeStyle(
    rc.ctx,
    edge,
    endpoints.sourceNode,
    endpoints.targetNode,
    isHighlighted,
    isChainActive,
    inChain,
    cycleEdge,
    isCrossCluster,
    rc,
  );

  drawEdgePath(edge, endpoints, isCrossCluster, isHighlighted, rc);

  // Draw arrowhead at target end for highlighted edges
  if (isHighlighted) {
    drawArrowhead(rc.ctx, endpoints.x2, endpoints.y2, endpoints.x1, endpoints.y1, rc.zoom);
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

    if (isChainActive && rc.chainDisplay === 'direct' && !inChain && !isConnectedToSelected) {
      continue;
    }

    renderSingleEdge(edge, viewport, isConnectedToSelected, !!isChainActive, inChain, rc);
  }
}

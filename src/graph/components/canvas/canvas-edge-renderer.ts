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
  const sourceNode = rc.nodes.find((n) => n.id === edge.source);
  const targetNode = rc.nodes.find((n) => n.id === edge.target);
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

function computeEdgeOpacity(
  edge: GraphEdge,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  isCycle: boolean,
  rc: EdgeRenderContext,
): number {
  let opacity = isHighlighted ? 1.0 : 0.1;

  if (isCycle) {
    opacity = Math.max(opacity, 0.8);
  }

  if (isChainActive && rc.chainDisplay === 'highlight') {
    if (inChain) {
      const depthOpacity = getEdgeOpacity(edge, rc);
      opacity = isHighlighted ? 1.0 : depthOpacity * 0.8;
    } else {
      opacity = 0.03;
    }
  } else {
    opacity *= getEdgeOpacity(edge, rc);
  }

  return Math.min(1, opacity);
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
  ctx.setLineDash(cycleEdge ? [4, 4] : isCrossCluster ? [10, 5] : [4, 2]);

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

function renderSingleEdge(
  edge: GraphEdge,
  viewport: ViewportBounds,
  isHighlighted: boolean,
  isChainActive: boolean,
  inChain: boolean,
  routedEdgeMap: Map<string, RoutedEdge> | undefined,
  rc: EdgeRenderContext,
) {
  const endpoints = resolveEdgeEndpoints(edge, rc);
  if (!endpoints) return;

  const {
    sourceNode,
    targetNode,
    sourceLayout,
    targetLayout,
    sourceClusterId,
    targetClusterId,
    sClusterX,
    sClusterY,
    tClusterX,
    tClusterY,
    x1,
    y1,
    x2,
    y2,
  } = endpoints;

  const isIntraCluster = sourceClusterId === targetClusterId;
  if (
    isIntraCluster &&
    shouldHideIntraClusterEdge(sourceClusterId, isHighlighted, rc.zoom, rc.hoveredCluster)
  )
    return;
  if (!isLineInViewport({ x: x1, y: y1 }, { x: x2, y: y2 }, viewport)) return;

  const cycleEdge = isCycleEdge(edge, rc.layout);
  const isCrossCluster = !isIntraCluster;

  applyEdgeStyle(
    rc.ctx,
    edge,
    sourceNode,
    targetNode,
    isHighlighted,
    isChainActive,
    inChain,
    cycleEdge,
    isCrossCluster,
    rc,
  );

  const edgeKey = `${edge.source}->${edge.target}`;
  const routedEdge = isCrossCluster ? routedEdgeMap?.get(edgeKey) : undefined;

  if (routedEdge) {
    drawRoutedEdgePath(
      rc.ctx,
      routedEdge,
      sourceLayout,
      targetLayout,
      sClusterX,
      sClusterY,
      tClusterX,
      tClusterY,
      sourceNode,
      targetNode,
      isHighlighted,
      rc.selectedNode,
      rc.zoom,
      rc.theme,
    );
  } else if (!isCrossCluster) {
    drawDirectEdgePath(rc.ctx, x1, y1, x2, y2);
  }

  rc.ctx.setLineDash([]);
  rc.ctx.lineDashOffset = 0;
}

export function renderEdges(rc: EdgeRenderContext, viewport: ViewportBounds): void {
  const { ctx, edges, selectedNode, viewMode, layout, transitiveDeps, transitiveDependents } = rc;
  const selectedNodeId = selectedNode?.id;

  const isChainActive = selectedNode && viewMode !== 'full' && viewMode !== 'path';

  const routedEdgeMap = new Map<string, RoutedEdge>();
  if (layout.routedEdges) {
    for (const re of layout.routedEdges) {
      routedEdgeMap.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
    }
  }

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

    renderSingleEdge(
      edge,
      viewport,
      isConnectedToSelected,
      !!isChainActive,
      inChain,
      routedEdgeMap,
      rc,
    );
  }
}

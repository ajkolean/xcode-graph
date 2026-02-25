import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { getNodeSize } from '@ui/utils/sizing';
import { ZOOM_CONFIG } from '@ui/utils/zoom-constants';

export interface InteractionState {
  pan: { x: number; y: number };
  zoom: number;
  isDragging: boolean;
  draggedNodeId: string | null;
  draggedClusterId: string | null;
  lastMousePos: { x: number; y: number };
  clickedEmptySpace: boolean;
  hasMoved: boolean;
  hoveredNode: string | null;
  hoveredCluster: string | null;
}

export interface InteractionContext {
  state: InteractionState;
  layout: GraphLayoutController;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  nodeWeights: Map<string, number>;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  getMousePos: (e: MouseEvent) => { x: number; y: number };
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  dispatchCanvasEvent: (name: string, detail?: unknown) => void;
  dispatchZoomChange: (zoom: number) => void;
}

function hitTestCluster(
  worldPos: { x: number; y: number },
  ctx: InteractionContext,
): string | null {
  for (const cluster of ctx.layout.clusters) {
    const layoutPos = ctx.layout.clusterPositions.get(cluster.id);
    if (!layoutPos) continue;

    const manualPos = ctx.manualClusterPositions.get(cluster.id);
    const cx = manualPos?.x ?? layoutPos.x;
    const cy = manualPos?.y ?? layoutPos.y;
    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

    const dx = worldPos.x - cx;
    const dy = worldPos.y - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      return cluster.id;
    }
  }
  return null;
}

function hitTestNode(
  worldPos: { x: number; y: number },
  ctx: InteractionContext,
): GraphNode | null {
  for (let i = ctx.nodes.length - 1; i >= 0; i--) {
    const node = ctx.nodes[i];
    if (!node) continue;
    const layoutPos = ctx.layout.nodePositions.get(node.id);
    const clusterPos = ctx.layout.clusterPositions.get(node.project || 'External');

    if (!layoutPos || !clusterPos) continue;

    const manualClusterPos = ctx.manualClusterPositions.get(node.project || 'External');
    const clusterX = manualClusterPos?.x ?? clusterPos.x;
    const clusterY = manualClusterPos?.y ?? clusterPos.y;

    const manualPos = ctx.manualNodePositions.get(node.id);
    const wx = clusterX + (manualPos?.x ?? layoutPos.x);
    const wy = clusterY + (manualPos?.y ?? layoutPos.y);
    const size = getNodeSize(node, ctx.edges, ctx.nodeWeights.get(node.id));

    const dx = worldPos.x - wx;
    const dy = worldPos.y - wy;

    if (dx * dx + dy * dy <= size * size) {
      return node;
    }
  }
  return null;
}

export function handleMouseDown(e: MouseEvent, ctx: InteractionContext): void {
  const { state } = ctx;
  state.isDragging = true;
  state.hasMoved = false;
  state.clickedEmptySpace = false;
  state.lastMousePos = { x: e.clientX, y: e.clientY };

  const { x, y } = ctx.getMousePos(e);
  const worldPos = ctx.screenToWorld(x, y);

  if (e.shiftKey || e.metaKey) {
    const clusterId = hitTestCluster(worldPos, ctx);
    if (clusterId) {
      state.draggedClusterId = clusterId;
      ctx.dispatchCanvasEvent('cluster-select', { clusterId });
      state.isDragging = false;
      return;
    }
  }

  const hitNode = hitTestNode(worldPos, ctx);
  if (hitNode) {
    state.draggedNodeId = hitNode.id;
    const newSelection = ctx.selectedNode?.id === hitNode.id ? null : hitNode;
    ctx.dispatchCanvasEvent('node-select', { node: newSelection });
    state.isDragging = false;
    return;
  }

  const clusterId = hitTestCluster(worldPos, ctx);
  if (clusterId) {
    ctx.dispatchCanvasEvent('cluster-select', { clusterId });
    return;
  }

  state.clickedEmptySpace = true;
}

function handleDragNode(worldPos: { x: number; y: number }, ctx: InteractionContext): void {
  const { state } = ctx;
  state.hasMoved = true;
  const dragNode = ctx.nodes.find((n) => n.id === state.draggedNodeId);
  if (!dragNode) return;

  const layoutClusterPos = ctx.layout.clusterPositions.get(dragNode.project || 'External');
  if (!layoutClusterPos) return;

  const manualClusterPos = ctx.manualClusterPositions.get(dragNode.project || 'External');
  const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
  const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;
  ctx.manualNodePositions.set(dragNode.id, {
    x: worldPos.x - clusterX,
    y: worldPos.y - clusterY,
  });
}

function handleHoverDetection(worldPos: { x: number; y: number }, ctx: InteractionContext): void {
  const { state } = ctx;
  const hitNode = hitTestNode(worldPos, ctx);
  const hitNodeId = hitNode?.id ?? null;
  const hitNodeCluster = hitNode ? hitNode.project || 'External' : null;

  if (hitNodeId !== state.hoveredNode) {
    state.hoveredNode = hitNodeId;
    ctx.dispatchCanvasEvent('node-hover', { nodeId: hitNodeId });
  }

  const hitClusterId = hitNodeCluster ?? hitTestCluster(worldPos, ctx);
  if (hitClusterId !== state.hoveredCluster) {
    state.hoveredCluster = hitClusterId;
    ctx.dispatchCanvasEvent('cluster-hover', { clusterId: hitClusterId });
  }
}

export function handleMouseMove(e: MouseEvent, ctx: InteractionContext): void {
  const { state } = ctx;
  const { x, y } = ctx.getMousePos(e);
  const worldPos = ctx.screenToWorld(x, y);

  if (state.draggedClusterId) {
    state.hasMoved = true;
    ctx.manualClusterPositions.set(state.draggedClusterId, {
      x: worldPos.x,
      y: worldPos.y,
    });
  } else if (state.draggedNodeId) {
    handleDragNode(worldPos, ctx);
  } else if (state.isDragging) {
    const dx = e.clientX - state.lastMousePos.x;
    const dy = e.clientY - state.lastMousePos.y;
    state.pan = { x: state.pan.x + dx, y: state.pan.y + dy };
    state.lastMousePos = { x: e.clientX, y: e.clientY };
    state.hasMoved = true;
  } else {
    handleHoverDetection(worldPos, ctx);
  }
}

export function handleMouseUp(e: MouseEvent | undefined, ctx: InteractionContext): void {
  const { state } = ctx;

  if (state.clickedEmptySpace && !state.hasMoved) {
    ctx.dispatchCanvasEvent('node-select', { node: null });
    ctx.dispatchCanvasEvent('cluster-select', { clusterId: null });
  }

  state.isDragging = false;
  state.clickedEmptySpace = false;
  state.draggedNodeId = null;
  state.draggedClusterId = null;
  setTimeout(() => {
    state.hasMoved = false;
  }, 0);

  if (e?.type === 'mouseleave') {
    if (state.hoveredNode) {
      state.hoveredNode = null;
      ctx.dispatchCanvasEvent('node-hover', { nodeId: null });
    }
    if (state.hoveredCluster) {
      state.hoveredCluster = null;
      ctx.dispatchCanvasEvent('cluster-hover', { clusterId: null });
    }
  }
}

export function handleWheel(e: WheelEvent, ctx: InteractionContext): void {
  e.preventDefault();
  const { state } = ctx;

  const zoomSensitivity = 0.001;
  const delta = -e.deltaY * zoomSensitivity;
  const newZoom = Math.min(
    Math.max(ZOOM_CONFIG.MIN_ZOOM, state.zoom + delta),
    ZOOM_CONFIG.MAX_ZOOM,
  );

  if (newZoom !== state.zoom) {
    const { x, y } = ctx.getMousePos(e);
    const worldPos = ctx.screenToWorld(x, y);

    state.zoom = newZoom;
    state.pan = {
      x: x - worldPos.x * state.zoom,
      y: y - worldPos.y * state.zoom,
    };

    ctx.dispatchZoomChange(state.zoom);
  }
}

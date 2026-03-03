import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { resolveClusterPosition, resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { ZOOM_CONFIG } from '@shared/utils/zoom-config';
import { getNodeSize } from '@ui/utils/sizing';

/** Map of canvas custom event names to their detail payloads. */
export interface CanvasEventMap {
  /** Fired when a node is selected or deselected */
  'node-select': { node: GraphNode | null };
  /** Fired when a cluster is selected or deselected */
  'cluster-select': { clusterId: string | null };
  /** Fired when a node is hovered or unhovered */
  'node-hover': { nodeId: string | null };
  /** Fired when a cluster is hovered or unhovered */
  'cluster-hover': { clusterId: string | null };
}

/** Mutable state tracking pan, zoom, drag, and hover for canvas interactions. */
export interface InteractionState {
  /** Current pan offset in screen pixels */
  pan: { x: number; y: number };
  /** Current zoom level */
  zoom: number;
  /** Whether the user is currently dragging (panning) */
  isDragging: boolean;
  /** ID of the node being dragged, or null */
  draggedNodeId: string | null;
  /** ID of the cluster being dragged, or null */
  draggedClusterId: string | null;
  /** Last recorded mouse position in screen coordinates */
  lastMousePos: { x: number; y: number };
  /** Whether the mousedown occurred on empty canvas space */
  clickedEmptySpace: boolean;
  /** Whether the mouse has moved since the last mousedown */
  hasMoved: boolean;
  /** ID of the currently hovered node, or null */
  hoveredNode: string | null;
  /** ID of the currently hovered cluster, or null */
  hoveredCluster: string | null;
}

/** Dependencies and callbacks required by canvas interaction handlers. */
export interface InteractionContext {
  /** Mutable interaction state */
  state: InteractionState;
  /** Layout controller for hit testing positions */
  layout: GraphLayoutController;
  /** Current visible nodes */
  nodes: GraphNode[];
  /** Current visible edges */
  edges: GraphEdge[];
  /** Currently selected node, or null */
  selectedNode: GraphNode | null;
  /** User-dragged node positions (relative to cluster) */
  manualNodePositions: Map<string, { x: number; y: number }>;
  /** User-dragged cluster positions (world coordinates) */
  manualClusterPositions: Map<string, { x: number; y: number }>;
  /** Converts a MouseEvent to canvas-relative screen coordinates */
  getMousePos: (e: MouseEvent) => { x: number; y: number };
  /** Converts screen coordinates to world (graph) coordinates */
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  /** Dispatches a typed canvas custom event */
  dispatchCanvasEvent: <K extends keyof CanvasEventMap>(name: K, detail: CanvasEventMap[K]) => void;
  /** Notifies the host of a zoom level change */
  dispatchZoomChange: (zoom: number) => void;
  /** Clears cached edge Path2D objects so they are recomputed on next render */
  invalidateEdgePathCache: () => void;
}

/** Returns the ID of the cluster under the given world position, or null if none. */
function hitTestCluster(
  worldPos: { x: number; y: number },
  ctx: InteractionContext,
): string | null {
  for (const cluster of ctx.layout.clusters) {
    const layoutPos = ctx.layout.clusterPositions.get(cluster.id);
    if (!layoutPos) continue;

    const pos = resolveClusterPosition(cluster.id, layoutPos, ctx.manualClusterPositions);
    const radius = Math.max(layoutPos.width, layoutPos.height) / 2;

    const dx = worldPos.x - pos.x;
    const dy = worldPos.y - pos.y;
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
  // Scale hit radius inversely at high zoom to prevent overlapping hit areas
  const zoom = ctx.state.zoom;
  const hitScale = zoom > 2 ? 2 / zoom : 1;

  for (let i = ctx.nodes.length - 1; i >= 0; i--) {
    const node = ctx.nodes[i];
    if (!node) continue;

    const pos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      ctx.layout,
      ctx.manualNodePositions,
      ctx.manualClusterPositions,
    );
    if (!pos) continue;

    const size = getNodeSize(node);
    const hitRadius = size * 2 * hitScale;

    const dx = worldPos.x - pos.x;
    const dy = worldPos.y - pos.y;

    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return node;
    }
  }
  return null;
}

/** Handles mousedown events for node/cluster selection and pan initiation. */
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

/** Updates the manual position of a dragged node relative to its cluster. */
function handleDragNode(worldPos: { x: number; y: number }, ctx: InteractionContext): void {
  const { state } = ctx;
  state.hasMoved = true;
  const dragNode = ctx.nodes.find((node) => node.id === state.draggedNodeId);
  if (!dragNode) return;

  const clusterId = dragNode.project || 'External';
  const layoutClusterPos = ctx.layout.clusterPositions.get(clusterId);
  if (!layoutClusterPos) return;

  const clusterPos = resolveClusterPosition(
    clusterId,
    layoutClusterPos,
    ctx.manualClusterPositions,
  );
  ctx.manualNodePositions.set(dragNode.id, {
    x: worldPos.x - clusterPos.x,
    y: worldPos.y - clusterPos.y,
  });
  ctx.invalidateEdgePathCache();
}

/** Detects node and cluster hover state changes and dispatches the corresponding events. */
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

/** Handles mousemove events for dragging nodes/clusters, panning, and hover detection. */
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
    ctx.invalidateEdgePathCache();
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

/** Handles mouseup and mouseleave events, clearing drag state and deselecting on empty-space clicks. */
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

/**
 * Normalizes wheel delta across input devices and deltaMode values.
 * Based on D3-zoom's battle-tested approach:
 * - deltaMode 0 (pixels): standard scroll, factor 0.002
 * - deltaMode 1 (lines): Firefox line-based scroll, factor 0.05
 * - deltaMode 2 (pages): rare page-based scroll, factor 1
 * - ctrlKey: macOS trackpad pinch fires wheel events with ctrlKey=true
 *   and very small deltaY — the 10x multiplier compensates.
 */
function normalizeWheelDelta(e: WheelEvent): number {
  const modeFactor = e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002;
  const pinchFactor = e.ctrlKey ? 10 : 1;
  return -e.deltaY * modeFactor * pinchFactor;
}

/** Handles wheel events for zooming, adjusting pan to keep the cursor position stable. */
export function handleWheel(e: WheelEvent, ctx: InteractionContext): void {
  e.preventDefault();
  const { state } = ctx;

  const delta = normalizeWheelDelta(e);
  const newZoom = Math.min(
    Math.max(ZOOM_CONFIG.MIN_ZOOM, state.zoom * 2 ** delta),
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

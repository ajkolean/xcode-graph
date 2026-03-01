/**
 * Canvas Interaction Handler Tests
 *
 * Verifies mouse/wheel interaction logic: hit testing, panning, dragging, hover detection.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { ZOOM_CONFIG } from '@shared/utils/zoom-constants';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  type InteractionContext,
  type InteractionState,
} from './canvas-interaction-handler';

function createDefaultState(overrides: Partial<InteractionState> = {}): InteractionState {
  return {
    pan: { x: 0, y: 0 },
    zoom: 1.0,
    isDragging: false,
    draggedNodeId: null,
    draggedClusterId: null,
    lastMousePos: { x: 0, y: 0 },
    clickedEmptySpace: false,
    hasMoved: false,
    hoveredNode: null,
    hoveredCluster: null,
    ...overrides,
  };
}

function createTestNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'node1',
    name: 'AppModule',
    type: NodeType.App,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'ProjectA',
    ...overrides,
  };
}

function createMockContext(overrides: Partial<InteractionContext> = {}): InteractionContext {
  const node = createTestNode();

  // Position the node at world (100, 100):
  // clusterPos (50, 50) + nodeLocalPos (50, 50) = world (100, 100)
  const clusterPositions = new Map([
    ['ProjectA', { id: 'ProjectA', x: 50, y: 50, vx: 0, vy: 0, width: 200, height: 200 }],
  ]);
  const nodePositions = new Map([
    ['node1', { id: 'node1', x: 50, y: 50, vx: 0, vy: 0, clusterId: 'ProjectA', radius: 18 }],
  ]);
  const clusters = [
    {
      id: 'ProjectA',
      name: 'ProjectA',
      type: 'project',
      origin: Origin.Local,
      nodes: [node],
      anchors: [],
      metadata: new Map(),
    },
  ];

  const layout = {
    nodePositions,
    clusterPositions,
    clusters,
  } as unknown as GraphLayoutController;

  return {
    state: createDefaultState(),
    layout,
    nodes: [node],
    edges: [] as GraphEdge[],
    selectedNode: null,
    nodeWeights: new Map(),
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    getMousePos: vi.fn().mockReturnValue({ x: 100, y: 100 }),
    screenToWorld: vi.fn().mockReturnValue({ x: 100, y: 100 }),
    dispatchCanvasEvent: vi.fn(),
    dispatchZoomChange: vi.fn(),
    ...overrides,
  };
}

function createMouseEvent(overrides: Partial<MouseEvent> = {}): MouseEvent {
  return {
    clientX: 100,
    clientY: 100,
    shiftKey: false,
    metaKey: false,
    type: 'mousedown',
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as MouseEvent;
}

function createWheelEvent(overrides: Partial<WheelEvent> = {}): WheelEvent {
  return {
    clientX: 400,
    clientY: 300,
    deltaY: -100,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as WheelEvent;
}

describe('canvas-interaction-handler', () => {
  describe('handleMouseDown', () => {
    it('should set draggedNodeId and dispatch node-select on node hit', () => {
      const ctx = createMockContext();
      const e = createMouseEvent();

      handleMouseDown(e, ctx);

      expect(ctx.state.draggedNodeId).toBe('node1');
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', {
        node: expect.objectContaining({ id: 'node1' }),
      });
      expect(ctx.state.isDragging).toBe(false);
    });

    it('should toggle off selection when clicking already-selected node', () => {
      const node = createTestNode();
      const ctx = createMockContext({ selectedNode: node });
      const e = createMouseEvent();

      handleMouseDown(e, ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node: null });
    });

    it('should dispatch cluster-select on shift+click cluster hit', () => {
      // No node at mouse position, but cluster is at position
      const ctx = createMockContext();
      // Make screenToWorld return the cluster center (50, 50)
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 50, y: 50 });
      // Remove node positions so node hit test fails
      ctx.layout.nodePositions.clear();

      const e = createMouseEvent({ shiftKey: true });

      handleMouseDown(e, ctx);

      expect(ctx.state.draggedClusterId).toBe('ProjectA');
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-select', {
        clusterId: 'ProjectA',
      });
      expect(ctx.state.isDragging).toBe(false);
    });

    it('should dispatch cluster-select on non-shift cluster hit (no node)', () => {
      const ctx = createMockContext();
      // Position at cluster center but not on a node
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 50, y: 50 });
      ctx.layout.nodePositions.clear();

      const e = createMouseEvent();

      handleMouseDown(e, ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-select', {
        clusterId: 'ProjectA',
      });
    });

    it('should set clickedEmptySpace when clicking empty space', () => {
      const ctx = createMockContext();
      // Return a position far away from any node or cluster
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 9999, y: 9999 });

      const e = createMouseEvent();

      handleMouseDown(e, ctx);

      expect(ctx.state.clickedEmptySpace).toBe(true);
      expect(ctx.state.isDragging).toBe(true);
    });

    it('should set isDragging=true and hasMoved=false on mousedown', () => {
      const ctx = createMockContext();
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 9999, y: 9999 });

      const e = createMouseEvent();

      handleMouseDown(e, ctx);

      expect(ctx.state.hasMoved).toBe(false);
    });

    it('should record lastMousePos from event clientX/clientY', () => {
      const ctx = createMockContext();
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 9999, y: 9999 });

      const e = createMouseEvent({ clientX: 250, clientY: 350 });

      handleMouseDown(e, ctx);

      expect(ctx.state.lastMousePos).toEqual({ x: 250, y: 350 });
    });
  });

  describe('handleMouseMove', () => {
    it('should pan when isDragging with no dragged node or cluster', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          isDragging: true,
          lastMousePos: { x: 100, y: 100 },
        }),
      });

      const e = createMouseEvent({ clientX: 120, clientY: 130 });

      handleMouseMove(e, ctx);

      expect(ctx.state.pan).toEqual({ x: 20, y: 30 });
      expect(ctx.state.lastMousePos).toEqual({ x: 120, y: 130 });
      expect(ctx.state.hasMoved).toBe(true);
    });

    it('should update manualNodePositions when dragging a node', () => {
      const ctx = createMockContext({
        state: createDefaultState({ draggedNodeId: 'node1' }),
      });
      // The drag destination in world coords
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 200, y: 250 });

      const e = createMouseEvent();

      handleMouseMove(e, ctx);

      expect(ctx.state.hasMoved).toBe(true);
      // manualNodePositions should be set: world(200,250) - clusterPos(50,50) = (150, 200)
      const pos = ctx.manualNodePositions.get('node1');
      expect(pos).toEqual({ x: 150, y: 200 });
    });

    it('should update manualClusterPositions when dragging a cluster', () => {
      const ctx = createMockContext({
        state: createDefaultState({ draggedClusterId: 'ProjectA' }),
      });
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 300, y: 400 });

      const e = createMouseEvent();

      handleMouseMove(e, ctx);

      expect(ctx.state.hasMoved).toBe(true);
      const pos = ctx.manualClusterPositions.get('ProjectA');
      expect(pos).toEqual({ x: 300, y: 400 });
    });

    it('should dispatch node-hover when hovering over a node', () => {
      const ctx = createMockContext();
      // Not dragging, so hover detection runs
      const e = createMouseEvent();

      handleMouseMove(e, ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-hover', { nodeId: 'node1' });
    });

    it('should dispatch node-hover with null when moving off a node', () => {
      const ctx = createMockContext({
        state: createDefaultState({ hoveredNode: 'node1' }),
      });
      // Move to empty space
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 9999, y: 9999 });

      const e = createMouseEvent();

      handleMouseMove(e, ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-hover', { nodeId: null });
    });

    it('should dispatch cluster-hover when hovering a cluster', () => {
      const ctx = createMockContext();
      // Hover over node which is in cluster ProjectA
      const e = createMouseEvent();

      handleMouseMove(e, ctx);

      // Hovering a node also hovers its cluster
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-hover', {
        clusterId: 'ProjectA',
      });
    });
  });

  describe('handleMouseUp', () => {
    it('should dispatch node-select:null and cluster-select:null on empty space click without move', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          clickedEmptySpace: true,
          hasMoved: false,
          isDragging: true,
        }),
      });

      handleMouseUp(createMouseEvent({ type: 'mouseup' }), ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node: null });
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-select', {
        clusterId: null,
      });
    });

    it('should not deselect if user moved after clicking empty space', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          clickedEmptySpace: true,
          hasMoved: true,
          isDragging: true,
        }),
      });

      handleMouseUp(createMouseEvent({ type: 'mouseup' }), ctx);

      expect(ctx.dispatchCanvasEvent).not.toHaveBeenCalled();
    });

    it('should clear drag state on mouseup', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          isDragging: true,
          draggedNodeId: 'node1',
          draggedClusterId: 'ProjectA',
          clickedEmptySpace: true,
        }),
      });

      handleMouseUp(createMouseEvent({ type: 'mouseup' }), ctx);

      expect(ctx.state.isDragging).toBe(false);
      expect(ctx.state.draggedNodeId).toBeNull();
      expect(ctx.state.draggedClusterId).toBeNull();
      expect(ctx.state.clickedEmptySpace).toBe(false);
    });

    it('should clear hover state on mouseleave', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          hoveredNode: 'node1',
          hoveredCluster: 'ProjectA',
        }),
      });

      handleMouseUp(createMouseEvent({ type: 'mouseleave' }), ctx);

      expect(ctx.state.hoveredNode).toBeNull();
      expect(ctx.state.hoveredCluster).toBeNull();
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-hover', { nodeId: null });
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-hover', {
        clusterId: null,
      });
    });

    it('should not dispatch hover events on mouseleave when nothing is hovered', () => {
      const ctx = createMockContext({
        state: createDefaultState({
          hoveredNode: null,
          hoveredCluster: null,
        }),
      });

      handleMouseUp(createMouseEvent({ type: 'mouseleave' }), ctx);

      expect(ctx.dispatchCanvasEvent).not.toHaveBeenCalled();
    });

    it('should handle undefined event gracefully', () => {
      const ctx = createMockContext({
        state: createDefaultState({ isDragging: true }),
      });

      handleMouseUp(undefined, ctx);

      expect(ctx.state.isDragging).toBe(false);
    });
  });

  describe('handleWheel', () => {
    it('should zoom in on negative deltaY (scroll up)', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: 1.0 }),
      });
      const e = createWheelEvent({ deltaY: -100 });

      handleWheel(e, ctx);

      expect(ctx.state.zoom).toBeGreaterThan(1.0);
      expect(ctx.dispatchZoomChange).toHaveBeenCalledWith(ctx.state.zoom);
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('should zoom out on positive deltaY (scroll down)', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: 1.0 }),
      });
      const e = createWheelEvent({ deltaY: 100 });

      handleWheel(e, ctx);

      expect(ctx.state.zoom).toBeLessThan(1.0);
      expect(ctx.dispatchZoomChange).toHaveBeenCalledWith(ctx.state.zoom);
    });

    it('should clamp zoom to ZOOM_CONFIG.MAX_ZOOM', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: ZOOM_CONFIG.MAX_ZOOM }),
      });
      const e = createWheelEvent({ deltaY: -1000 });

      handleWheel(e, ctx);

      expect(ctx.state.zoom).toBeLessThanOrEqual(ZOOM_CONFIG.MAX_ZOOM);
    });

    it('should clamp zoom to ZOOM_CONFIG.MIN_ZOOM', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: ZOOM_CONFIG.MIN_ZOOM }),
      });
      const e = createWheelEvent({ deltaY: 1000 });

      handleWheel(e, ctx);

      // Zoom should not go below MIN_ZOOM; since zoom is already at MIN, no change
      expect(ctx.state.zoom).toBeGreaterThanOrEqual(ZOOM_CONFIG.MIN_ZOOM);
    });

    it('should not dispatch zoom change if zoom did not change', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: ZOOM_CONFIG.MAX_ZOOM }),
      });
      // deltaY = 0 means no scroll
      const e = createWheelEvent({ deltaY: 0 });

      handleWheel(e, ctx);

      expect(ctx.dispatchZoomChange).not.toHaveBeenCalled();
    });

    it('should adjust pan to keep world position under cursor stable', () => {
      const ctx = createMockContext({
        state: createDefaultState({ zoom: 1.0, pan: { x: 0, y: 0 } }),
      });
      (ctx.getMousePos as ReturnType<typeof vi.fn>).mockReturnValue({ x: 400, y: 300 });
      (ctx.screenToWorld as ReturnType<typeof vi.fn>).mockReturnValue({ x: 400, y: 300 });

      const e = createWheelEvent({ deltaY: -100 });

      handleWheel(e, ctx);

      // Pan should be adjusted so world pos under cursor is stable
      const newZoom = ctx.state.zoom;
      expect(ctx.state.pan.x).toBeCloseTo(400 - 400 * newZoom);
      expect(ctx.state.pan.y).toBeCloseTo(300 - 300 * newZoom);
    });
  });
});

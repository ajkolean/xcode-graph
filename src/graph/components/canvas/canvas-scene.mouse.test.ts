import { NodeType, Origin, Platform } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasScene, type SceneCallbacks, type SceneConfig } from './canvas-scene';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createNode(id: string, project = 'TestProject'): GraphNode {
  return {
    id,
    name: `Node-${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    project,
    deploymentTargets: {},
    buildSettings: {},
  };
}

function createCallbacks(): SceneCallbacks {
  return {
    onNodeSelect: vi.fn(),
    onClusterSelect: vi.fn(),
    onNodeHover: vi.fn(),
    onClusterHover: vi.fn(),
    onZoomChange: vi.fn(),
    onRenderRequest: vi.fn(),
    onInvalidateEdgePathCache: vi.fn(),
  };
}

function createMinimalConfig(overrides?: Partial<SceneConfig>): SceneConfig {
  return {
    nodes: [],
    edges: [],
    layout: {
      clusters: [],
      clusterPositions: new Map(),
      nodePositions: new Map(),
    } as unknown as SceneConfig['layout'],
    theme: { canvasBg: '#000' } as unknown as SceneConfig['theme'],
    selectedNode: null,
    selectedCluster: null,
    hoveredNode: null,
    hoveredCluster: null,
    searchQuery: '',
    viewMode: 'graph' as SceneConfig['viewMode'],
    transitiveDeps: undefined,
    transitiveDependents: undefined,
    showDirectDeps: false,
    showTransitiveDeps: false,
    showDirectDependents: false,
    showTransitiveDependents: false,
    previewFilter: undefined,
    dimmedNodeIds: new Set<string>(),
    connectedNodes: new Set<string>(),
    nodeAlphaMap: new Map(),
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    zoom: 1,
    time: 0,
    ...overrides,
  };
}

function mouseEvent(type: string, opts: Partial<MouseEventInit> = {}): MouseEvent {
  return new MouseEvent(type, {
    clientX: 100,
    clientY: 100,
    bubbles: true,
    cancelable: true,
    ...opts,
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('canvas-scene mouse interactions', () => {
  let container: HTMLDivElement;
  let scene: CanvasScene;
  let callbacks: SceneCallbacks;
  // skipcq: JS-0323 — test-only access to private members
  // biome-ignore lint/suspicious/noExplicitAny: test access to private members
  let sceneAny: any;

  beforeEach(() => {
    container = document.createElement('div');
    callbacks = createCallbacks();
    scene = new CanvasScene(container, callbacks);
    sceneAny = scene as unknown as Record<string, unknown>;
    // Set config so handlers don't bail early
    sceneAny.config = createMinimalConfig();
  });

  afterEach(() => {
    scene.destroy();
  });

  // -----------------------------------------------------------------------
  // handleMouseDown — node hit
  // -----------------------------------------------------------------------
  describe('handleMouseDown — node hit', () => {
    it('sets draggedNodeId, isDragging and calls onNodeSelect', () => {
      const node = createNode('A');
      // Stub hitTestNode to return the node
      sceneAny.hitTestNode = () => node;
      sceneAny.hitTestCluster = () => null;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown'));

      expect(sceneAny.draggedNodeId).toBe('A');
      expect(sceneAny.isDragging).toBe(true);
      expect(callbacks.onNodeSelect).toHaveBeenCalledWith(node);
    });

    it('keeps node selected when clicking already-selected node', () => {
      const node = createNode('A');
      sceneAny.config = createMinimalConfig({ selectedNode: node });
      sceneAny.hitTestNode = () => node;
      sceneAny.hitTestCluster = () => null;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown'));

      expect(callbacks.onNodeSelect).toHaveBeenCalledWith(node);
    });
  });

  // -----------------------------------------------------------------------
  // handleMouseDown — cluster hit with shift/meta
  // -----------------------------------------------------------------------
  describe('handleMouseDown — cluster hit', () => {
    it('sets draggedClusterId with shift key and calls onClusterSelect', () => {
      sceneAny.hitTestNode = () => null;
      sceneAny.hitTestCluster = () => 'ClusterA';

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown', { shiftKey: true }));

      expect(sceneAny.draggedClusterId).toBe('ClusterA');
      expect(sceneAny.isDragging).toBe(true);
      expect(callbacks.onClusterSelect).toHaveBeenCalledWith('ClusterA');
    });

    it('sets draggedClusterId with meta key and calls onClusterSelect', () => {
      sceneAny.hitTestNode = () => null;
      sceneAny.hitTestCluster = () => 'ClusterA';

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown', { metaKey: true }));

      expect(sceneAny.draggedClusterId).toBe('ClusterA');
      expect(sceneAny.isDragging).toBe(true);
      expect(callbacks.onClusterSelect).toHaveBeenCalledWith('ClusterA');
    });

    it('selects cluster without dragging when no modifier key', () => {
      sceneAny.hitTestNode = () => null;
      sceneAny.hitTestCluster = () => 'ClusterA';

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown'));

      expect(sceneAny.draggedClusterId).toBeNull();
      expect(sceneAny.isDragging).toBe(false);
      expect(callbacks.onClusterSelect).toHaveBeenCalledWith('ClusterA');
    });
  });

  // -----------------------------------------------------------------------
  // handleMouseDown — empty space → panning
  // -----------------------------------------------------------------------
  describe('handleMouseDown — empty space', () => {
    it('sets isPanning to true when clicking empty space', () => {
      sceneAny.hitTestNode = () => null;
      sceneAny.hitTestCluster = () => null;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown'));

      expect(sceneAny.isPanning).toBe(true);
    });

    it('stores lastMousePos', () => {
      sceneAny.hitTestNode = () => null;
      sceneAny.hitTestCluster = () => null;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousedown', { clientX: 42, clientY: 84 }));

      expect(sceneAny.lastMousePos).toEqual({ x: 42, y: 84 });
    });
  });

  // -----------------------------------------------------------------------
  // handleDragCluster
  // -----------------------------------------------------------------------
  describe('handleDragCluster', () => {
    it('updates manualClusterPositions and fires callbacks', () => {
      const config = createMinimalConfig();
      sceneAny.config = config;
      sceneAny.draggedClusterId = 'ClusterA';
      sceneAny.isDragging = true;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousemove', { clientX: 200, clientY: 200 }));

      expect(config.manualClusterPositions.has('ClusterA')).toBe(true);
      expect(callbacks.onRenderRequest).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleDragNode
  // -----------------------------------------------------------------------
  describe('handleDragNode', () => {
    it('updates manualNodePositions and fires callbacks', () => {
      const node = createNode('N1', 'MyProject');
      const config = createMinimalConfig({ nodes: [node] });
      // Set up layout clusterPositions so the handler doesn't bail
      (config.layout.clusterPositions as Map<string, unknown>).set('MyProject', {
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      });
      sceneAny.config = config;
      // Populate nodeMap (normally done via updateCaches)
      sceneAny.nodeMap.set('N1', node);
      sceneAny.draggedNodeId = 'N1';
      sceneAny.isDragging = true;

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousemove', { clientX: 150, clientY: 150 }));

      expect(config.manualNodePositions.has('N1')).toBe(true);
      expect(callbacks.onRenderRequest).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handlePan
  // -----------------------------------------------------------------------
  describe('handlePan', () => {
    it('updates pan position and requests render', () => {
      sceneAny.isPanning = true;
      sceneAny.lastMousePos = { x: 100, y: 100 };

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mousemove', { clientX: 120, clientY: 130 }));

      expect(sceneAny.pan).toEqual({ x: 20, y: 30 });
      expect(sceneAny.lastMousePos).toEqual({ x: 120, y: 130 });
      expect(callbacks.onRenderRequest).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // handleMouseUp
  // -----------------------------------------------------------------------
  describe('handleMouseUp', () => {
    it('resets drag and pan state', () => {
      sceneAny.isPanning = true;
      sceneAny.isDragging = true;
      sceneAny.draggedNodeId = 'N1';
      sceneAny.draggedClusterId = 'C1';

      const canvas: HTMLCanvasElement = sceneAny.canvas;
      canvas.dispatchEvent(mouseEvent('mouseup'));

      expect(sceneAny.isPanning).toBe(false);
      expect(sceneAny.isDragging).toBe(false);
      expect(sceneAny.draggedNodeId).toBeNull();
      expect(sceneAny.draggedClusterId).toBeNull();
    });
  });
});

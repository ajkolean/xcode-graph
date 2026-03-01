/**
 * Canvas Node Renderer Tests
 *
 * Verifies that renderNodes draws expected canvas primitives using vitest-canvas-mock.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { type NodeRenderContext, renderNodes } from './canvas-node-renderer';

function createTestTheme(): CanvasTheme {
  return {
    nodeApp: 'rgba(240, 176, 64, 1)',
    nodeFramework: 'rgba(100, 181, 246, 1)',
    nodeLibrary: 'rgba(129, 199, 132, 1)',
    nodeTest: 'rgba(240, 120, 170, 1)',
    nodeCli: 'rgba(120, 160, 246, 1)',
    nodePackage: 'rgba(234, 196, 72, 1)',
    canvasBg: '#161617',
    tooltipBg: 'rgba(24, 24, 28, 0.95)',
    shadowColor: 'rgba(24, 24, 28, 0.9)',
    cycleEdgeColor: 'rgba(239, 68, 68, 0.8)',
    cycleGlowColor: 'rgba(239, 68, 68, 0.6)',
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

function createMockLayout(
  nodePositions: Map<string, { x: number; y: number }>,
  clusterPositions: Map<string, { x: number; y: number }>,
): GraphLayoutController {
  return {
    nodePositions,
    clusterPositions,
    cycleNodes: new Set<string>(),
  } as unknown as GraphLayoutController;
}

function createRenderContext(overrides: Partial<NodeRenderContext> = {}): NodeRenderContext {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const nodes: GraphNode[] = [createTestNode()];
  const edges: GraphEdge[] = [];

  const nodePositions = new Map([['node1', { x: 50, y: 50 }]]);
  const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

  return {
    ctx,
    layout: createMockLayout(nodePositions, clusterPositions),
    nodes,
    edges,
    zoom: 1.0,
    time: 0,
    theme: createTestTheme(),
    selectedNode: null,
    selectedCluster: null,
    hoveredNode: null,
    hoveredCluster: null,
    searchQuery: '',
    viewMode: 'overview' as NodeRenderContext['viewMode'],
    transitiveDeps: undefined,
    transitiveDependents: undefined,
    previewFilter: undefined,
    nodeWeights: new Map(),
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    getPathForNode: () => new Path2D(),
    connectedNodes: new Set<string>(),
    hubWeightThreshold: 5,
    nodeAlphaMap: new Map(),
    showDirectDeps: false,
    showTransitiveDeps: false,
    showDirectDependents: false,
    showTransitiveDependents: false,
    ...overrides,
  };
}

describe('canvas-node-renderer', () => {
  it('should call canvas drawing methods when rendering nodes', () => {
    const rc = createRenderContext();
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    // vitest-canvas-mock tracks calls via __getEvents
    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    expect(events.length).to.be.greaterThan(0);
  });

  it('should skip rendering at very low zoom levels', () => {
    const rc = createRenderContext({ zoom: 0.1 });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    // Only globalAlpha reset or nothing - no draw calls for nodes
    expect(events.length).to.equal(0);
  });

  it('should skip nodes outside the viewport', () => {
    const nodePositions = new Map([['node1', { x: 5000, y: 5000 }]]);
    const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);
    const rc = createRenderContext({
      layout: createMockLayout(nodePositions, clusterPositions),
    });
    const viewport = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

    renderNodes(rc, viewport);

    // Node is far outside viewport, so only globalAlpha reset should appear
    const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
    // No arc/fill calls for the node
    const arcCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'arc');
    expect(arcCalls.length).to.equal(0);
  });

  it('should render multiple nodes', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'node1', name: 'App', project: 'ProjectA' }),
      createTestNode({
        id: 'node2',
        name: 'Framework',
        type: NodeType.Framework,
        project: 'ProjectA',
      }),
    ];
    const nodePositions = new Map([
      ['node1', { x: 50, y: 50 }],
      ['node2', { x: 100, y: 100 }],
    ]);
    const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

    const rc = createRenderContext({
      nodes,
      layout: createMockLayout(nodePositions, clusterPositions),
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    expect(events.length).to.be.greaterThan(0);
  });

  it('should set globalAlpha based on node alpha map', () => {
    const nodeAlphaMap = new Map([['node1', { current: 0.5, target: 0.5 }]]);
    const rc = createRenderContext({ nodeAlphaMap });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    // Should have set globalAlpha to 0.5 at some point
    const alphaEvents = events.filter(
      (e: unknown) =>
        (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
        (e as { type: string; props?: { value?: number } }).props?.value === 0.5,
    );
    expect(alphaEvents.length).to.be.greaterThan(0);
  });

  it('should reset globalAlpha to 1.0 after rendering', () => {
    const rc = createRenderContext();
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    // After renderNodes, globalAlpha should be reset to 1.0
    expect(rc.ctx.globalAlpha).to.equal(1.0);
  });
});

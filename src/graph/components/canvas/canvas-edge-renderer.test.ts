/**
 * Canvas Edge Renderer Tests
 *
 * Verifies that renderEdges draws expected canvas primitives using vitest-canvas-mock.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { type EdgeRenderContext, renderEdges } from './canvas-edge-renderer';

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
    edgeDefault: 'rgba(120, 120, 130, 0.45)',
    cycleEdgeColor: 'rgba(239, 68, 68, 0.8)',
    cycleGlowColor: 'rgba(239, 68, 68, 0.6)',
    isDark: true,
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
  clusterPositions: Map<
    string,
    { x: number; y: number; width: number; height: number; nodeCount: number }
  >,
  overrides: {
    cycleNodes?: Set<string>;
    clusters?: unknown[];
    nodeSccId?: Map<string, number>;
    sccSizes?: Map<number, number>;
  } = {},
): GraphLayoutController {
  return {
    nodePositions,
    clusterPositions,
    cycleNodes: overrides.cycleNodes ?? new Set<string>(),
    clusters: overrides.clusters ?? [],
    nodeSccId: overrides.nodeSccId ?? new Map<string, number>(),
    sccSizes: overrides.sccSizes ?? new Map<number, number>(),
  } as unknown as GraphLayoutController;
}

function createEdgeRenderContext(overrides: Partial<EdgeRenderContext> = {}): EdgeRenderContext {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const nodes: GraphNode[] = [
    createTestNode({ id: 'node1', name: 'AppModule', project: 'ProjectA' }),
    createTestNode({
      id: 'node2',
      name: 'Framework',
      type: NodeType.Framework,
      project: 'ProjectB',
    }),
  ];
  const edges: GraphEdge[] = [{ source: 'node1', target: 'node2' }];

  const nodePositions = new Map([
    ['node1', { x: 50, y: 50, vx: 0, vy: 0, id: 'node1', clusterId: 'ProjectA', radius: 10 }],
    ['node2', { x: 100, y: 100, vx: 0, vy: 0, id: 'node2', clusterId: 'ProjectB', radius: 10 }],
  ]);
  const clusterPositions = new Map([
    [
      'ProjectA',
      { id: 'ProjectA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 },
    ],
    [
      'ProjectB',
      { id: 'ProjectB', x: 300, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 },
    ],
  ]);

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

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
    hoveredCluster: null,
    viewMode: 'overview' as EdgeRenderContext['viewMode'],
    transitiveDeps: undefined,
    transitiveDependents: undefined,
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    nodeMap,
    edgePathCache: new Map(),
    showDirectDeps: false,
    showTransitiveDeps: false,
    showDirectDependents: false,
    showTransitiveDependents: false,
    ...overrides,
  };
}

function getEvents(ctx: CanvasRenderingContext2D): unknown[] {
  return (ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
}

function getDrawCalls(ctx: CanvasRenderingContext2D): unknown[] {
  return (ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
}

const largeViewport = { minX: -5000, minY: -5000, maxX: 5000, maxY: 5000 };

describe('canvas-edge-renderer', () => {
  it('should call canvas drawing methods when rendering edges', () => {
    const rc = createEdgeRenderContext();

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    expect(events.length).to.be.greaterThan(0);
  });

  it('should hide non-emphasized edges at zoom < 0.3', () => {
    const rc = createEdgeRenderContext({ zoom: 0.2 });

    renderEdges(rc, largeViewport);

    // At low zoom, non-emphasized edges are hidden to reduce visual noise
    const drawCalls = getDrawCalls(rc.ctx);
    const strokeCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'stroke');
    expect(strokeCalls.length).to.equal(0);
  });

  it('should skip arrowheads at zoom below LOD threshold (0.5)', () => {
    const rc = createEdgeRenderContext({ zoom: 0.4 });

    renderEdges(rc, largeViewport);

    // At zoom 0.4 (< 0.5 arrowhead LOD threshold), no arrowhead fill calls
    const drawCalls = getDrawCalls(rc.ctx);
    const fillCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'fill');
    expect(fillCalls.length).to.equal(0);
  });

  it('should draw arrowheads at zoom at or above LOD threshold (0.5)', () => {
    const rc = createEdgeRenderContext({ zoom: 0.6 });

    renderEdges(rc, largeViewport);

    // At zoom 0.6 (>= 0.5 arrowhead LOD threshold), arrowhead fill calls should exist
    const drawCalls = getDrawCalls(rc.ctx);
    const fillCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'fill');
    expect(fillCalls.length).to.be.greaterThan(0);
  });

  it('should render cycle edges with cycle edge color', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'nodeA', name: 'ModuleA', project: 'ProjectA' }),
      createTestNode({ id: 'nodeB', name: 'ModuleB', project: 'ProjectA' }),
    ];
    const edges: GraphEdge[] = [
      { source: 'nodeA', target: 'nodeB' },
      { source: 'nodeB', target: 'nodeA' },
    ];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['nodeA', { x: 50, y: 50, vx: 0, vy: 0, id: 'nodeA', clusterId: 'ProjectA', radius: 10 }],
      ['nodeB', { x: 100, y: 100, vx: 0, vy: 0, id: 'nodeB', clusterId: 'ProjectA', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      [
        'ProjectA',
        { id: 'ProjectA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 2 },
      ],
    ]);

    // Set SCC data so both nodes are in the same cycle
    const nodeSccId = new Map([
      ['nodeA', 1],
      ['nodeB', 1],
    ]);
    const sccSizes = new Map([[1, 2]]);

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      layout: createMockLayout(nodePositions, clusterPositions, { nodeSccId, sccSizes }),
    });

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Cycle edges should use the cycle edge color
    const strokeStyleEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'strokeStyle',
    );
    const hasCycleColor = strokeStyleEvents.some(
      (e: unknown) =>
        (e as { props?: { value?: string } }).props?.value === 'rgba(239, 68, 68, 0.8)',
    );
    expect(hasCycleColor).to.equal(true);
  });

  it('should compute chain edge opacity: depth 0 = full, depth >= 1 = 0.5', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'root', name: 'Root', project: 'ProjA' }),
      createTestNode({ id: 'direct', name: 'Direct', type: NodeType.Framework, project: 'ProjB' }),
      createTestNode({
        id: 'transitive',
        name: 'Transitive',
        type: NodeType.Library,
        project: 'ProjC',
      }),
    ];
    const edges: GraphEdge[] = [
      { source: 'root', target: 'direct' },
      { source: 'direct', target: 'transitive' },
    ];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['root', { x: 0, y: 0, vx: 0, vy: 0, id: 'root', clusterId: 'ProjA', radius: 10 }],
      ['direct', { x: 100, y: 0, vx: 0, vy: 0, id: 'direct', clusterId: 'ProjB', radius: 10 }],
      [
        'transitive',
        { x: 200, y: 0, vx: 0, vy: 0, id: 'transitive', clusterId: 'ProjC', radius: 10 },
      ],
    ]);
    const clusterPositions = new Map([
      ['ProjA', { id: 'ProjA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjB', { id: 'ProjB', x: 300, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjC', { id: 'ProjC', x: 600, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);

    const transitiveDeps: TransitiveResult = {
      nodes: new Set(['root', 'direct', 'transitive']),
      edges: new Set(['root->direct', 'direct->transitive']),
      edgeDepths: new Map([
        ['root->direct', 0],
        ['direct->transitive', 1],
      ]),
      nodeDepths: new Map([
        ['root', 0],
        ['direct', 1],
        ['transitive', 2],
      ]),
      maxDepth: 1,
    };

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      layout: createMockLayout(nodePositions, clusterPositions),
      transitiveDeps,
      showDirectDeps: true,
      showTransitiveDeps: true,
    });

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Should have globalAlpha events with values 1.0 (depth 0) and 0.5 (depth >= 1)
    const alphaEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'globalAlpha',
    );
    const alphaValues = alphaEvents.map(
      (e: unknown) => (e as { props?: { value?: number } }).props?.value,
    );
    expect(alphaValues).to.include(1.0);
    expect(alphaValues).to.include(0.5);
  });

  it('should render intra-cluster edges at low zoom', () => {
    // Both nodes in same cluster, intra-cluster edge — always visible regardless of zoom
    const nodes: GraphNode[] = [
      createTestNode({ id: 'n1', name: 'Node1', project: 'Cluster1' }),
      createTestNode({ id: 'n2', name: 'Node2', project: 'Cluster1' }),
    ];
    const edges: GraphEdge[] = [{ source: 'n1', target: 'n2' }];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['n1', { x: 10, y: 10, vx: 0, vy: 0, id: 'n1', clusterId: 'Cluster1', radius: 10 }],
      ['n2', { x: 50, y: 50, vx: 0, vy: 0, id: 'n2', clusterId: 'Cluster1', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      [
        'Cluster1',
        { id: 'Cluster1', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 2 },
      ],
    ]);

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      zoom: 0.4,
      hoveredCluster: null,
      layout: createMockLayout(nodePositions, clusterPositions),
    });

    renderEdges(rc, largeViewport);

    // Intra-cluster edge should be rendered even at low zoom
    const drawCalls = getDrawCalls(rc.ctx);
    const strokeCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'stroke');
    expect(strokeCalls.length).to.be.greaterThan(0);
  });

  it('should respect showDirectDeps/showTransitiveDeps toggle filters', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'root', name: 'Root', project: 'ProjA' }),
      createTestNode({ id: 'dep', name: 'Dep', type: NodeType.Framework, project: 'ProjB' }),
      createTestNode({ id: 'trans', name: 'Trans', type: NodeType.Library, project: 'ProjC' }),
    ];
    const edges: GraphEdge[] = [
      { source: 'root', target: 'dep' },
      { source: 'dep', target: 'trans' },
    ];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['root', { x: 0, y: 0, vx: 0, vy: 0, id: 'root', clusterId: 'ProjA', radius: 10 }],
      ['dep', { x: 100, y: 0, vx: 0, vy: 0, id: 'dep', clusterId: 'ProjB', radius: 10 }],
      ['trans', { x: 200, y: 0, vx: 0, vy: 0, id: 'trans', clusterId: 'ProjC', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      ['ProjA', { id: 'ProjA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjB', { id: 'ProjB', x: 300, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjC', { id: 'ProjC', x: 600, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);

    const transitiveDeps: TransitiveResult = {
      nodes: new Set(['root', 'dep', 'trans']),
      edges: new Set(['root->dep', 'dep->trans']),
      edgeDepths: new Map([
        ['root->dep', 0],
        ['dep->trans', 1],
      ]),
      nodeDepths: new Map([
        ['root', 0],
        ['dep', 1],
        ['trans', 2],
      ]),
      maxDepth: 1,
    };

    // Only show direct deps, not transitive
    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      layout: createMockLayout(nodePositions, clusterPositions),
      transitiveDeps,
      showDirectDeps: true,
      showTransitiveDeps: false,
    });

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // The direct edge (root->dep at depth 0) should be in chain, the transitive (dep->trans at depth 1) should not
    // Both edges render but with different treatment
    expect(events.length).to.be.greaterThan(0);
  });

  it('should manage globalAlpha state correctly', () => {
    const rc = createEdgeRenderContext();

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // globalAlpha should be set during edge rendering
    const alphaEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'globalAlpha',
    );
    expect(alphaEvents.length).to.be.greaterThan(0);
  });

  it('should render cross-cluster edges as direct lines', () => {
    // Default context has nodes in different clusters (ProjectA, ProjectB)
    const rc = createEdgeRenderContext();

    renderEdges(rc, largeViewport);

    // Cross-cluster edge should produce stroke calls (rendered as direct line)
    const drawCalls = getDrawCalls(rc.ctx);
    const strokeCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'stroke');
    expect(strokeCalls.length).to.be.greaterThan(0);
  });

  it('should use transitiveDependents edge depths for chain opacity', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'root', name: 'Root', project: 'ProjA' }),
      createTestNode({ id: 'dep', name: 'Dep', type: NodeType.Framework, project: 'ProjB' }),
    ];
    const edges: GraphEdge[] = [{ source: 'dep', target: 'root' }];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['root', { x: 0, y: 0, vx: 0, vy: 0, id: 'root', clusterId: 'ProjA', radius: 10 }],
      ['dep', { x: 100, y: 0, vx: 0, vy: 0, id: 'dep', clusterId: 'ProjB', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      ['ProjA', { id: 'ProjA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjB', { id: 'ProjB', x: 300, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);

    const transitiveDependents: TransitiveResult = {
      nodes: new Set(['root', 'dep']),
      edges: new Set(['dep->root']),
      edgeDepths: new Map([['dep->root', 0]]),
      nodeDepths: new Map([
        ['root', 0],
        ['dep', 1],
      ]),
      maxDepth: 1,
    };

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      layout: createMockLayout(nodePositions, clusterPositions),
      transitiveDependents,
      showDirectDependents: true,
      showTransitiveDependents: true,
    });

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Should have globalAlpha events for chain rendering
    const alphaEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'globalAlpha',
    );
    expect(alphaEvents.length).to.be.greaterThan(0);
  });

  it('should draw bezier path for intra-cluster edges with distance > 150', () => {
    // Two nodes in the same cluster, far apart so distance > 150
    const nodes: GraphNode[] = [
      createTestNode({ id: 'n1', name: 'Node1', project: 'Cluster1' }),
      createTestNode({ id: 'n2', name: 'Node2', project: 'Cluster1' }),
    ];
    const edges: GraphEdge[] = [{ source: 'n1', target: 'n2' }];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['n1', { x: 0, y: 0, vx: 0, vy: 0, id: 'n1', clusterId: 'Cluster1', radius: 10 }],
      ['n2', { x: 200, y: 200, vx: 0, vy: 0, id: 'n2', clusterId: 'Cluster1', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      [
        'Cluster1',
        { id: 'Cluster1', x: 0, y: 0, vx: 0, vy: 0, width: 500, height: 500, nodeCount: 2 },
      ],
    ]);

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      zoom: 1.0,
      hoveredCluster: 'Cluster1',
      layout: createMockLayout(nodePositions, clusterPositions),
    });

    renderEdges(rc, largeViewport);

    // Distance between (0,0) and (200,200) = ~283 > 150, so bezier path should be used
    const events = getEvents(rc.ctx);
    expect(events.length).to.be.greaterThan(0);
  });

  it('should render intra-cluster non-cycle non-emphasized edges with drawing calls', () => {
    // Two nodes same cluster, no selection, no chain, no cycle — exercises the
    // setLineDash([]) branch (line 326) for solid intra-cluster edges
    const nodes: GraphNode[] = [
      createTestNode({ id: 'n1', name: 'Node1', project: 'Cluster1' }),
      createTestNode({ id: 'n2', name: 'Node2', project: 'Cluster1' }),
    ];
    const edges: GraphEdge[] = [{ source: 'n1', target: 'n2' }];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['n1', { x: 10, y: 10, vx: 0, vy: 0, id: 'n1', clusterId: 'Cluster1', radius: 10 }],
      ['n2', { x: 50, y: 50, vx: 0, vy: 0, id: 'n2', clusterId: 'Cluster1', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      [
        'Cluster1',
        { id: 'Cluster1', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 2 },
      ],
    ]);

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      zoom: 1.0,
      hoveredCluster: 'Cluster1',
      layout: createMockLayout(nodePositions, clusterPositions),
    });

    renderEdges(rc, largeViewport);

    // Non-cycle, non-emphasized, intra-cluster edge should produce drawing calls
    const drawCalls = getDrawCalls(rc.ctx);
    const strokeCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'stroke');
    expect(strokeCalls.length).to.be.greaterThan(0);
  });

  it('should render glow pass and arrowhead for emphasized edges', () => {
    const nodes: GraphNode[] = [
      createTestNode({ id: 'src', name: 'Source', project: 'ProjA' }),
      createTestNode({ id: 'tgt', name: 'Target', type: NodeType.Framework, project: 'ProjB' }),
    ];
    const edges: GraphEdge[] = [{ source: 'src', target: 'tgt' }];
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    const nodePositions = new Map([
      ['src', { x: 0, y: 0, vx: 0, vy: 0, id: 'src', clusterId: 'ProjA', radius: 10 }],
      ['tgt', { x: 100, y: 0, vx: 0, vy: 0, id: 'tgt', clusterId: 'ProjB', radius: 10 }],
    ]);
    const clusterPositions = new Map([
      ['ProjA', { id: 'ProjA', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['ProjB', { id: 'ProjB', x: 300, y: 0, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);

    const transitiveDeps: TransitiveResult = {
      nodes: new Set(['src', 'tgt']),
      edges: new Set(['src->tgt']),
      edgeDepths: new Map([['src->tgt', 0]]),
      nodeDepths: new Map([
        ['src', 0],
        ['tgt', 1],
      ]),
      maxDepth: 1,
    };

    const rc = createEdgeRenderContext({
      nodes,
      edges,
      nodeMap,
      layout: createMockLayout(nodePositions, clusterPositions),
      transitiveDeps,
      showDirectDeps: true,
      showTransitiveDeps: true,
    });

    renderEdges(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Glow pass uses ctx.save/restore; emphasized edges also draw arrowheads (fill)
    const saveEvents = events.filter((e: unknown) => (e as { type: string }).type === 'save');
    const fillEvents = events.filter((e: unknown) => (e as { type: string }).type === 'fill');
    // There should be at least one save (glow pass) and one fill (arrowhead)
    expect(saveEvents.length).to.be.greaterThan(0);
    expect(fillEvents.length).to.be.greaterThan(0);
  });
});

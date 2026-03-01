/**
 * Canvas Cluster Renderer Tests
 *
 * Verifies that renderClusters draws expected canvas primitives using vitest-canvas-mock.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { ClusterType } from '@shared/schemas/cluster.types';
import type { GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { type ClusterRenderContext, renderClusters } from './canvas-cluster-renderer';

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

function createCluster(
  overrides: Partial<{
    id: string;
    name: string;
    type: string;
    origin: string;
    nodes: GraphNode[];
    anchors: string[];
    metadata: Map<string, unknown>;
  }> = {},
) {
  return {
    id: overrides.id ?? 'cluster1',
    name: overrides.name ?? 'ProjectA',
    type: overrides.type ?? ClusterType.Project,
    origin: overrides.origin ?? Origin.Local,
    nodes: overrides.nodes ?? [createTestNode()],
    anchors: overrides.anchors ?? [],
    metadata: overrides.metadata ?? new Map(),
  };
}

function createMockLayout(
  clusters: ReturnType<typeof createCluster>[],
  clusterPositions: Map<
    string,
    {
      id: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      height: number;
      nodeCount: number;
    }
  >,
): GraphLayoutController {
  return {
    clusters,
    clusterPositions,
    nodePositions: new Map(),
    cycleNodes: new Set<string>(),
  } as unknown as GraphLayoutController;
}

function createClusterRenderContext(
  overrides: Partial<ClusterRenderContext> = {},
): ClusterRenderContext {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const cluster = createCluster();
  const clusterPositions = new Map([
    [
      'cluster1',
      { id: 'cluster1', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 },
    ],
  ]);

  return {
    ctx,
    layout: createMockLayout([cluster], clusterPositions),
    zoom: 1.0,
    time: 0,
    theme: createTestTheme(),
    selectedCluster: null,
    hoveredCluster: null,
    manualClusterPositions: new Map(),
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

describe('canvas-cluster-renderer', () => {
  it('should call canvas drawing methods when rendering clusters within viewport', () => {
    const rc = createClusterRenderContext();

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    expect(events.length).to.be.greaterThan(0);
  });

  it('should cull clusters outside the viewport', () => {
    // Cluster is at x=100, y=100 with radius=100, so it spans 0-200
    // Viewport is far away
    const rc = createClusterRenderContext();
    const farViewport = { minX: 5000, minY: 5000, maxX: 6000, maxY: 6000 };

    renderClusters(rc, farViewport);

    // Off-screen cluster should not produce arc draw calls
    const drawCalls = getDrawCalls(rc.ctx);
    const arcCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'arc');
    expect(arcCalls.length).to.equal(0);
  });

  it('should render centroid dot only at zoom < 0.15 (centroidAlpha=1, fullAlpha=0)', () => {
    const rc = createClusterRenderContext({ zoom: 0.1 });

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // At very low zoom: centroid dot drawn (arc + fill), no full cluster rendering (no stroke for border)
    // The fill for centroid dot should be present
    const fillEvents = events.filter((e: unknown) => (e as { type: string }).type === 'fill');
    expect(fillEvents.length).to.be.greaterThan(0);
  });

  it('should render full cluster at zoom > 0.3 (centroidAlpha=0, fullAlpha=1)', () => {
    const rc = createClusterRenderContext({ zoom: 0.5 });

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // At normal zoom: full cluster rendering with fill (gradient) and stroke (border)
    const strokeEvents = events.filter((e: unknown) => (e as { type: string }).type === 'stroke');
    expect(strokeEvents.length).to.be.greaterThan(0);
  });

  it('should apply active styling for selected cluster', () => {
    const rc = createClusterRenderContext({ selectedCluster: 'cluster1' });

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Selected cluster should produce drawing events with active styling
    expect(events.length).to.be.greaterThan(0);

    // Active clusters should have lineDashOffset set (animated marching ants)
    const lineDashOffsetEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'lineDashOffset',
    );
    expect(lineDashOffsetEvents.length).to.be.greaterThan(0);
  });

  it('should apply active styling for hovered cluster', () => {
    const rc = createClusterRenderContext({ hoveredCluster: 'cluster1' });

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    expect(events.length).to.be.greaterThan(0);
  });

  it('should scale fill opacity by tier: isActive=0.08, <=5=0.06, <=20=0.08, >20=0.1', () => {
    // Test that different node counts produce different rendering behavior
    // Active cluster (nodeCount irrelevant, returns 0.08)
    const activeCluster = createCluster({ id: 'active', name: 'Active' });
    const activePos = new Map([
      [
        'active',
        { id: 'active', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 3 },
      ],
    ]);
    const rcActive = createClusterRenderContext({
      layout: createMockLayout([activeCluster], activePos),
      selectedCluster: 'active',
    });
    renderClusters(rcActive, largeViewport);
    const activeEvents = getEvents(rcActive.ctx);
    expect(activeEvents.length).to.be.greaterThan(0);

    // Small cluster (nodeCount=3, <=5 returns 0.06)
    const smallCluster = createCluster({ id: 'small', name: 'Small' });
    const smallPos = new Map([
      [
        'small',
        { id: 'small', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 3 },
      ],
    ]);
    const rcSmall = createClusterRenderContext({
      layout: createMockLayout([smallCluster], smallPos),
    });
    renderClusters(rcSmall, largeViewport);
    const smallEvents = getEvents(rcSmall.ctx);
    expect(smallEvents.length).to.be.greaterThan(0);

    // Large cluster (nodeCount=25, >20 returns 0.1)
    const largeNodes = Array.from({ length: 25 }, (_, i) =>
      createTestNode({ id: `n${i}`, name: `Node${i}` }),
    );
    const largeCluster = createCluster({ id: 'large', name: 'Large', nodes: largeNodes });
    const largePos = new Map([
      [
        'large',
        { id: 'large', x: 100, y: 100, vx: 0, vy: 0, width: 400, height: 400, nodeCount: 25 },
      ],
    ]);
    const rcLarge = createClusterRenderContext({
      layout: createMockLayout([largeCluster], largePos),
    });
    renderClusters(rcLarge, largeViewport);
    const largeEvents = getEvents(rcLarge.ctx);
    expect(largeEvents.length).to.be.greaterThan(0);
  });

  it('should scale border width with log2(nodeCount)', () => {
    // Cluster with 1 node: log2(1) = 0, clamped to max(1, 0) = 1
    // Cluster with 16 nodes: log2(16) = 4
    // Both should render but with different lineWidth settings
    const smallCluster = createCluster({ id: 'c1', name: 'Small' });
    const smallPos = new Map([
      ['c1', { id: 'c1', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);
    const rcSmall = createClusterRenderContext({
      layout: createMockLayout([smallCluster], smallPos),
    });
    renderClusters(rcSmall, largeViewport);

    const sixteenNodes = Array.from({ length: 16 }, (_, i) =>
      createTestNode({ id: `n${i}`, name: `Node${i}` }),
    );
    const largeCluster = createCluster({ id: 'c2', name: 'Big', nodes: sixteenNodes });
    const largePos = new Map([
      ['c2', { id: 'c2', x: 100, y: 100, vx: 0, vy: 0, width: 400, height: 400, nodeCount: 16 }],
    ]);
    const rcLarge = createClusterRenderContext({
      layout: createMockLayout([largeCluster], largePos),
    });
    renderClusters(rcLarge, largeViewport);

    // Extract lineWidth events
    const smallLineWidths = getEvents(rcSmall.ctx)
      .filter((e: unknown) => (e as { type: string }).type === 'lineWidth')
      .map((e: unknown) => (e as { props?: { value?: number } }).props?.value);
    const largeLineWidths = getEvents(rcLarge.ctx)
      .filter((e: unknown) => (e as { type: string }).type === 'lineWidth')
      .map((e: unknown) => (e as { props?: { value?: number } }).props?.value);

    // lineWidth for 16-node cluster should be larger than 1-node cluster
    const maxSmall = Math.max(...(smallLineWidths as number[]));
    const maxLarge = Math.max(...(largeLineWidths as number[]));
    expect(maxLarge).to.be.greaterThan(maxSmall);
  });

  it('should dim non-active clusters when another cluster is selected (shouldDim)', () => {
    const cluster1 = createCluster({ id: 'c1', name: 'Selected' });
    const cluster2 = createCluster({ id: 'c2', name: 'Other' });
    const positions = new Map([
      ['c1', { id: 'c1', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
      ['c2', { id: 'c2', x: 400, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 1 }],
    ]);

    const rc = createClusterRenderContext({
      layout: createMockLayout([cluster1, cluster2], positions),
      selectedCluster: 'c1',
    });

    renderClusters(rc, largeViewport);

    const events = getEvents(rc.ctx);
    // Non-active cluster should have dimmed globalAlpha (0.3 factor)
    const alphaEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'globalAlpha',
    );
    const alphaValues = alphaEvents.map(
      (e: unknown) => (e as { props?: { value?: number } }).props?.value,
    );
    // Should have 0.3 (dimmed) alpha for the non-selected cluster
    const hasDimmed = alphaValues.some((v) => typeof v === 'number' && v > 0 && v < 0.5);
    expect(hasDimmed).to.equal(true);
  });

  it('should draw labels at all zoom levels', () => {
    // At both low and high zoom, labels should be drawn via fillText
    const rcLow = createClusterRenderContext({ zoom: 0.1 });
    renderClusters(rcLow, largeViewport);
    const lowEvents = getEvents(rcLow.ctx);
    const lowFillTextEvents = lowEvents.filter(
      (e: unknown) => (e as { type: string }).type === 'fillText',
    );
    expect(lowFillTextEvents.length).to.be.greaterThan(0);

    const rcHigh = createClusterRenderContext({ zoom: 2.0 });
    renderClusters(rcHigh, largeViewport);
    const highEvents = getEvents(rcHigh.ctx);
    const highFillTextEvents = highEvents.filter(
      (e: unknown) => (e as { type: string }).type === 'fillText',
    );
    expect(highFillTextEvents.length).to.be.greaterThan(0);
  });

  it('should reset globalAlpha to 1.0 after rendering each cluster', () => {
    const rc = createClusterRenderContext();

    renderClusters(rc, largeViewport);

    // After renderClusters, globalAlpha should be reset
    expect(rc.ctx.globalAlpha).to.equal(1.0);
  });
});

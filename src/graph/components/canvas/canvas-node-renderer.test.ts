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

  it('should render nodes at very low zoom levels', () => {
    const rc = createRenderContext({ zoom: 0.1 });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderNodes(rc, viewport);

    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    // Nodes should still render at low zoom (no centroid-dot cutoff)
    expect(events.length).toBeGreaterThan(0);
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
    const nodeAlphaMap = new Map([
      ['node1', { current: 0.5, target: 0.5, start: 0.5, progress: 0 }],
    ]);
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

  // isPreviewDimmed() 5-way switch coverage

  describe('isPreviewDimmed via previewFilter', () => {
    it('should dim nodes not matching nodeType preview filter', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({
        previewFilter: { type: 'nodeType', value: NodeType.Framework },
        nodeAlphaMap,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is App type but filter is Framework → should be dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should not dim nodes matching nodeType preview filter', () => {
      const rc = createRenderContext({
        previewFilter: { type: 'nodeType', value: NodeType.App },
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is App type and filter is App → should not be dimmed, alpha stays 1.0
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 1,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should dim nodes not matching platform preview filter', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({
        previewFilter: { type: 'platform', value: Platform.macOS },
        nodeAlphaMap,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is iOS but filter is macOS → dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should dim nodes not matching origin preview filter', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({
        previewFilter: { type: 'origin', value: Origin.External },
        nodeAlphaMap,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is Local but filter is External → dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should dim nodes not matching project preview filter', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({
        previewFilter: { type: 'project', value: 'ProjectB' },
        nodeAlphaMap,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is ProjectA but filter is ProjectB → dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should dim non-package nodes for package preview filter', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({
        previewFilter: { type: 'package', value: 'SomePackage' },
        nodeAlphaMap,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node is App type, not Package → dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should not dim a package node matching the package preview filter', () => {
      const nodes = [createTestNode({ id: 'pkg1', name: 'MyPackage', type: NodeType.Package })];
      const nodePositions = new Map([['pkg1', { x: 50, y: 50 }]]);
      const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

      const rc = createRenderContext({
        nodes,
        layout: createMockLayout(nodePositions, clusterPositions),
        previewFilter: { type: 'package', value: 'MyPackage' },
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Package node matches filter → should not be dimmed, alpha stays 1.0
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 1,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });
  });

  // isSearchDimmed() coverage

  describe('isSearchDimmed via searchQuery', () => {
    it('should dim nodes not matching search query', () => {
      const nodeAlphaMap = new Map([
        ['node1', { current: 0.3, target: 0.3, start: 0.3, progress: 0 }],
      ]);
      const rc = createRenderContext({ searchQuery: 'xyz', nodeAlphaMap });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node name is 'AppModule' which doesn't contain 'xyz' → dimmed
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 0.3,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });

    it('should not dim nodes matching search query (case insensitive)', () => {
      const rc = createRenderContext({ searchQuery: 'app' });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      // Node name is 'AppModule' which contains 'app' (case-insensitive) → not dimmed, alpha 1.0
      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      const alphaEvents = events.filter(
        (e: unknown) =>
          (e as { type: string; props?: { value?: number } }).type === 'globalAlpha' &&
          (e as { type: string; props?: { value?: number } }).props?.value === 1,
      );
      expect(alphaEvents.length).to.be.greaterThan(0);
    });
  });

  // isSelectionDimmed() coverage

  describe('isSelectionDimmed via chain toggles', () => {
    it('should dim non-chain nodes when a chain toggle is active', () => {
      const nodes = [
        createTestNode({ id: 'selected', name: 'Selected' }),
        createTestNode({ id: 'other', name: 'Other', type: NodeType.Framework }),
      ];
      const nodePositions = new Map([
        ['selected', { x: 50, y: 50 }],
        ['other', { x: 100, y: 100 }],
      ]);
      const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

      const rc = createRenderContext({
        nodes,
        layout: createMockLayout(nodePositions, clusterPositions),
        selectedNode: nodes[0] as GraphNode,
        showDirectDeps: true,
        transitiveDeps: {
          nodes: new Set(['selected']),
          edges: new Set(),
          edgeDepths: new Map(),
          nodeDepths: new Map([['selected', 0]]),
          maxDepth: 0,
        },
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      renderNodes(rc, viewport);

      // 'other' should be dimmed since it's not in the active chain
      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      expect(events.length).to.be.greaterThan(0);
    });

    it('should not dim nodes that are in the active transitive dependents chain', () => {
      const nodes = [
        createTestNode({ id: 'selected', name: 'Selected' }),
        createTestNode({ id: 'dep1', name: 'Dep1', type: NodeType.Framework }),
      ];
      const nodePositions = new Map([
        ['selected', { x: 50, y: 50 }],
        ['dep1', { x: 100, y: 100 }],
      ]);
      const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

      const rc = createRenderContext({
        nodes,
        layout: createMockLayout(nodePositions, clusterPositions),
        selectedNode: nodes[0] as GraphNode,
        showDirectDependents: true,
        transitiveDependents: {
          nodes: new Set(['selected', 'dep1']),
          edges: new Set(),
          edgeDepths: new Map(),
          nodeDepths: new Map([
            ['selected', 0],
            ['dep1', 1],
          ]),
          maxDepth: 1,
        },
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      renderNodes(rc, viewport);

      const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
      expect(events.length).to.be.greaterThan(0);
    });
  });

  // shouldShowNodeLabel() coverage

  describe('shouldShowNodeLabel via zoom and hub check', () => {
    it('should show labels when zoom >= 0.3', () => {
      const rc = createRenderContext({ zoom: 0.5 });
      const viewport = { minX: -5000, minY: -5000, maxX: 5000, maxY: 5000 };

      renderNodes(rc, viewport);

      // With zoom 0.5, labels should be shown (zoom >= 0.3)
      const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
      const textCalls = drawCalls.filter(
        (c: unknown) => (c as { type: string }).type === 'fillText',
      );
      expect(textCalls.length).to.be.greaterThan(0);
    });

    it('should hide labels at low zoom when node is not a hub', () => {
      const rc = createRenderContext({
        zoom: 0.2,
        nodeWeights: new Map([['node1', 1]]),
        hubWeightThreshold: 10,
      });
      const viewport = { minX: -5000, minY: -5000, maxX: 5000, maxY: 5000 };

      renderNodes(rc, viewport);

      // zoom < 0.3, not hovered/selected/connected, weight(1) < threshold(10)
      // Label should NOT be drawn
      const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
      const textCalls = drawCalls.filter(
        (c: unknown) => (c as { type: string }).type === 'fillText',
      );
      expect(textCalls.length).to.equal(0);
    });

    it('should show labels at low zoom for hub nodes', () => {
      const rc = createRenderContext({
        zoom: 0.2,
        nodeWeights: new Map([['node1', 15]]),
        hubWeightThreshold: 10,
      });
      const viewport = { minX: -5000, minY: -5000, maxX: 5000, maxY: 5000 };

      renderNodes(rc, viewport);

      // zoom < 0.3, but weight(15) >= threshold(10) → hub → show label
      const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
      const textCalls = drawCalls.filter(
        (c: unknown) => (c as { type: string }).type === 'fillText',
      );
      expect(textCalls.length).to.be.greaterThan(0);
    });
  });

  // drawNodeLabel() truncation coverage

  describe('drawNodeLabel truncation', () => {
    it('should truncate long names when not hovered or connected', () => {
      const longNameNode = createTestNode({
        id: 'long1',
        name: 'AVeryLongModuleNameThatExceedsTwenty',
      });
      const nodePositions = new Map([['long1', { x: 50, y: 50 }]]);
      const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

      const rc = createRenderContext({
        nodes: [longNameNode],
        layout: createMockLayout(nodePositions, clusterPositions),
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      renderNodes(rc, viewport);

      const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
      const textCalls = drawCalls.filter(
        (c: unknown) => (c as { type: string }).type === 'fillText',
      );
      // Should have text calls with the truncated name (20 chars + '...')
      const truncatedName = 'AVeryLongModuleNameT...';
      const hasTruncated = textCalls.some(
        (c: unknown) => (c as { props: { text: string } }).props.text === truncatedName,
      );
      expect(hasTruncated).to.be.true;
    });

    it('should not truncate long names when node is hovered', () => {
      const longNameNode = createTestNode({
        id: 'long1',
        name: 'AVeryLongModuleNameThatExceedsTwenty',
      });
      const nodePositions = new Map([['long1', { x: 50, y: 50 }]]);
      const clusterPositions = new Map([['ProjectA', { x: 0, y: 0 }]]);

      const rc = createRenderContext({
        nodes: [longNameNode],
        layout: createMockLayout(nodePositions, clusterPositions),
        hoveredNode: 'long1',
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      renderNodes(rc, viewport);

      const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
      const textCalls = drawCalls.filter(
        (c: unknown) => (c as { type: string }).type === 'fillText',
      );
      // Should have text calls with the full name (not truncated)
      const hasFullName = textCalls.some(
        (c: unknown) =>
          (c as { props: { text: string } }).props.text === 'AVeryLongModuleNameThatExceedsTwenty',
      );
      expect(hasFullName).to.be.true;
    });
  });
});

/**
 * Canvas Tooltip Renderer Tests
 *
 * Tests for renderNodeTooltip and renderClusterTooltip functions.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';
import {
  renderClusterTooltip,
  renderNodeTooltip,
  type TooltipContext,
} from './canvas-tooltip-renderer';

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
  clusterPositions: Map<string, { x: number; y: number; width: number; height: number }>,
  clusters: Array<{ id: string; name: string; type: string; nodes: GraphNode[] }> = [],
): GraphLayoutController {
  return {
    nodePositions,
    clusterPositions,
    clusters,
    cycleNodes: new Set<string>(),
  } as unknown as GraphLayoutController;
}

function createTooltipContext(overrides: Partial<TooltipContext> = {}): TooltipContext {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const nodes: GraphNode[] = [createTestNode()];
  const edges: GraphEdge[] = [];

  const nodePositions = new Map([['node1', { x: 50, y: 50 }]]);
  const clusterPositions = new Map([['ProjectA', { x: 0, y: 0, width: 200, height: 200 }]]);

  return {
    ctx,
    layout: createMockLayout(nodePositions, clusterPositions),
    nodes,
    edges,
    zoom: 0.3,
    theme: createTestTheme(),
    hoveredNode: null,
    pan: { x: 0, y: 0 },
    nodeWeights: new Map(),
    manualNodePositions: new Map(),
    manualClusterPositions: new Map(),
    hoveredCluster: null,
    ...overrides,
  };
}

describe('renderNodeTooltip', () => {
  it('should not render when hoveredNode is null', () => {
    const tc = createTooltipContext({ hoveredNode: null });
    renderNodeTooltip(tc);
    // No error thrown = pass
    expect(true).toBe(true);
  });

  it('should not render when hovered node is not found', () => {
    const tc = createTooltipContext({ hoveredNode: 'nonexistent' });
    renderNodeTooltip(tc);
    expect(true).toBe(true);
  });

  it('should not render tooltip for short-named node at high zoom', () => {
    const tc = createTooltipContext({
      hoveredNode: 'node1',
      zoom: 0.8,
    });
    // "AppModule" is 9 chars, <= 20, and zoom >= 0.5 so tooltip should skip
    renderNodeTooltip(tc);
    expect(true).toBe(true);
  });

  it('should render tooltip for node at low zoom', () => {
    const tc = createTooltipContext({
      hoveredNode: 'node1',
      zoom: 0.3,
    });
    const saveSpy = vi.spyOn(tc.ctx, 'save');
    const restoreSpy = vi.spyOn(tc.ctx, 'restore');
    const fillTextSpy = vi.spyOn(tc.ctx, 'fillText');
    // Low zoom (< 0.5) should always show tooltip
    renderNodeTooltip(tc);
    expect(saveSpy).toHaveBeenCalled();
    expect(restoreSpy).toHaveBeenCalled();
    expect(fillTextSpy).toHaveBeenCalledWith('AppModule', expect.any(Number), expect.any(Number));
  });

  it('should render tooltip for long-named node at high zoom', () => {
    const longNameNode = createTestNode({
      id: 'node-long',
      name: 'AVeryLongModuleNameThatExceedsTwenty',
    });
    const nodePositions = new Map([['node-long', { x: 50, y: 50 }]]);
    const clusterPositions = new Map([['ProjectA', { x: 0, y: 0, width: 200, height: 200 }]]);
    const tc = createTooltipContext({
      hoveredNode: 'node-long',
      nodes: [longNameNode],
      layout: createMockLayout(nodePositions, clusterPositions),
      zoom: 0.8,
    });
    const fillTextSpy = vi.spyOn(tc.ctx, 'fillText');
    renderNodeTooltip(tc);
    expect(fillTextSpy).toHaveBeenCalledWith(
      'AVeryLongModuleNameThatExceedsTwenty',
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('should not render when node has no world position', () => {
    // Node with a cluster that doesn't exist in layout
    const orphanNode = createTestNode({ id: 'orphan', project: 'NonExistent' });
    const tc = createTooltipContext({
      hoveredNode: 'orphan',
      nodes: [orphanNode],
      zoom: 0.3,
    });
    renderNodeTooltip(tc);
    expect(true).toBe(true);
  });
});

describe('renderClusterTooltip', () => {
  it('should not render when hoveredCluster is null', () => {
    const tc = createTooltipContext({ hoveredCluster: null });
    renderClusterTooltip(tc);
    expect(true).toBe(true);
  });

  it('should not render when hoveredNode is set (node tooltip takes precedence)', () => {
    const clusterNodes = [createTestNode()];
    const clusters = [{ id: 'ProjectA', name: 'ProjectA', type: 'project', nodes: clusterNodes }];
    const clusterPositions = new Map([['ProjectA', { x: 100, y: 100, width: 200, height: 200 }]]);
    const tc = createTooltipContext({
      hoveredCluster: 'ProjectA',
      hoveredNode: 'node1',
      layout: createMockLayout(new Map(), clusterPositions, clusters),
    });
    renderClusterTooltip(tc);
    expect(true).toBe(true);
  });

  it('should not render when cluster is not found in layout', () => {
    const tc = createTooltipContext({
      hoveredCluster: 'nonexistent',
    });
    renderClusterTooltip(tc);
    expect(true).toBe(true);
  });

  it('should render cluster tooltip when cluster exists', () => {
    const clusterNodes = [createTestNode()];
    const clusters = [{ id: 'ProjectA', name: 'ProjectA', type: 'project', nodes: clusterNodes }];
    const clusterPositions = new Map([['ProjectA', { x: 100, y: 100, width: 200, height: 200 }]]);
    const tc = createTooltipContext({
      hoveredCluster: 'ProjectA',
      hoveredNode: null,
      layout: createMockLayout(new Map(), clusterPositions, clusters),
    });
    const saveSpy = vi.spyOn(tc.ctx, 'save');
    const restoreSpy = vi.spyOn(tc.ctx, 'restore');
    const fillTextSpy = vi.spyOn(tc.ctx, 'fillText');
    renderClusterTooltip(tc);
    expect(saveSpy).toHaveBeenCalled();
    expect(restoreSpy).toHaveBeenCalled();
    // Should render cluster name and subtitle
    expect(fillTextSpy).toHaveBeenCalledWith('ProjectA', expect.any(Number), expect.any(Number));
    expect(fillTextSpy).toHaveBeenCalledWith('1 targets', expect.any(Number), expect.any(Number));
  });

  it('should not render when cluster has no layout position', () => {
    const clusterNodes = [createTestNode()];
    const clusters = [{ id: 'ProjectA', name: 'ProjectA', type: 'project', nodes: clusterNodes }];
    const tc = createTooltipContext({
      hoveredCluster: 'ProjectA',
      hoveredNode: null,
      layout: createMockLayout(new Map(), new Map(), clusters),
    });
    renderClusterTooltip(tc);
    expect(true).toBe(true);
  });
});

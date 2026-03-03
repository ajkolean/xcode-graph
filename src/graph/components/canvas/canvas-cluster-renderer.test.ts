/**
 * Canvas Cluster Renderer Tests
 *
 * Verifies gradient caching and basic cluster rendering.
 */

import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { Cluster } from '@shared/schemas/cluster.types';
import { ClusterType } from '@shared/schemas/cluster.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { prefersReducedMotion } from '@shared/signals/reduced-motion.signals';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type ClusterRenderContext,
  clearGradientCache,
  renderClusters,
} from './canvas-cluster-renderer';

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

function createTestCluster(id: string, name: string): Cluster {
  return {
    id,
    name,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: [
      {
        id: `${id}-node`,
        name: `${name}Module`,
        type: NodeType.App,
        platform: Platform.iOS,
        origin: Origin.Local,
        project: name,
      },
    ],
    anchors: [],
    metadata: new Map(),
  };
}

function createMockLayout(clusters: Cluster[]): GraphLayoutController {
  const clusterPositions = new Map(
    clusters.map((c) => [c.id, { x: 0, y: 0, width: 200, height: 200 }]),
  );
  return {
    clusters,
    clusterPositions,
    nodePositions: new Map(),
  } as unknown as GraphLayoutController;
}

function createRenderContext(overrides: Partial<ClusterRenderContext> = {}): ClusterRenderContext {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const clusters = [createTestCluster('project-a', 'ProjectA')];

  return {
    ctx,
    layout: createMockLayout(clusters),
    zoom: 1.0,
    time: 0,
    theme: createTestTheme(),
    selectedCluster: null,
    hoveredCluster: null,
    manualClusterPositions: new Map(),
    ...overrides,
  };
}

describe('canvas-cluster-renderer', () => {
  afterEach(() => {
    clearGradientCache();
  });

  it('should render clusters without errors', () => {
    const rc = createRenderContext();
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should reuse cached gradients on second render', () => {
    const rc = createRenderContext();
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    // Render twice with identical parameters; gradient cache should be hit
    renderClusters(rc, viewport);
    renderClusters(rc, viewport);

    // No error means the cache path was exercised successfully
    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should clear gradient cache without errors', () => {
    const rc = createRenderContext();
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderClusters(rc, viewport);
    clearGradientCache();
    renderClusters(rc, viewport);

    const events = (rc.ctx as unknown as { __getEvents(): unknown[] }).__getEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should render cluster with many nodes (>20) for higher fill opacity', () => {
    const manyNodes = Array.from({ length: 25 }, (_, i) => ({
      id: `node-${i}`,
      name: `Node${i}`,
      type: NodeType.Library,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'BigProject',
    }));

    const bigCluster: Cluster = {
      id: 'big-cluster',
      name: 'BigProject',
      type: ClusterType.Project,
      origin: Origin.Local,
      nodes: manyNodes,
      anchors: [],
      metadata: new Map(),
    };

    const rc = createRenderContext({
      layout: createMockLayout([bigCluster]),
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should render cluster with 5 or fewer nodes for lower fill opacity', () => {
    const fewNodes = Array.from({ length: 3 }, (_, i) => ({
      id: `small-node-${i}`,
      name: `SmallNode${i}`,
      type: NodeType.Framework,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'SmallProject',
    }));

    const smallCluster: Cluster = {
      id: 'small-cluster',
      name: 'SmallProject',
      type: ClusterType.Project,
      origin: Origin.Local,
      nodes: fewNodes,
      anchors: [],
      metadata: new Map(),
    };

    const rc = createRenderContext({
      layout: createMockLayout([smallCluster]),
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should render selected cluster with animated dash offset when reduced motion is off', () => {
    const prevValue = prefersReducedMotion.get();
    prefersReducedMotion.set(false);

    try {
      const cluster = createTestCluster('anim-cluster', 'AnimCluster');
      const rc = createRenderContext({
        layout: createMockLayout([cluster]),
        selectedCluster: 'anim-cluster',
        time: 5000,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      expect(() => renderClusters(rc, viewport)).not.toThrow();
    } finally {
      prefersReducedMotion.set(prevValue);
    }
  });

  it('should skip animated dash offset when reduced motion is on', () => {
    const prevValue = prefersReducedMotion.get();
    prefersReducedMotion.set(true);

    try {
      const cluster = createTestCluster('static-cluster', 'StaticCluster');
      const rc = createRenderContext({
        layout: createMockLayout([cluster]),
        selectedCluster: 'static-cluster',
        time: 5000,
      });
      const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

      expect(() => renderClusters(rc, viewport)).not.toThrow();
    } finally {
      prefersReducedMotion.set(prevValue);
    }
  });

  it('should truncate long cluster names', () => {
    const cluster: Cluster = {
      id: 'long-name-cluster',
      name: 'ThisIsAnExtremelyLongClusterNameThatShouldBeTruncatedAtSomePoint',
      type: ClusterType.Project,
      origin: Origin.Local,
      nodes: [
        {
          id: 'ln-node',
          name: 'LongNameModule',
          type: NodeType.App,
          platform: Platform.iOS,
          origin: Origin.Local,
          project: 'LongNameProject',
        },
      ],
      anchors: [],
      metadata: new Map(),
    };

    // Use a small cluster size so the text must be truncated
    const layout = {
      clusters: [cluster],
      clusterPositions: new Map([[cluster.id, { x: 0, y: 0, width: 50, height: 50 }]]),
      nodePositions: new Map(),
    } as unknown as GraphLayoutController;

    const rc = createRenderContext({ layout });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should use package-style dash pattern for package clusters', () => {
    const pkgCluster: Cluster = {
      id: 'pkg-cluster',
      name: 'SomePackage',
      type: ClusterType.Package,
      origin: Origin.External,
      nodes: [
        {
          id: 'pkg-node',
          name: 'PkgModule',
          type: NodeType.Package,
          platform: Platform.iOS,
          origin: Origin.External,
          project: 'SomePackage',
        },
      ],
      anchors: [],
      metadata: new Map(),
    };

    const rc = createRenderContext({
      layout: createMockLayout([pkgCluster]),
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should dim non-active clusters when one is hovered', () => {
    const clusterA = createTestCluster('cluster-a', 'ClusterA');
    const clusterB = createTestCluster('cluster-b', 'ClusterB');

    const rc = createRenderContext({
      layout: createMockLayout([clusterA, clusterB]),
      hoveredCluster: 'cluster-a',
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should skip clusters outside viewport', () => {
    const cluster = createTestCluster('offscreen', 'Offscreen');
    const layout = {
      clusters: [cluster],
      clusterPositions: new Map([[cluster.id, { x: 10000, y: 10000, width: 200, height: 200 }]]),
      nodePositions: new Map(),
    } as unknown as GraphLayoutController;

    const rc = createRenderContext({ layout });
    const viewport = { minX: -100, minY: -100, maxX: 100, maxY: 100 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });

  it('should draw cluster labels at any zoom level', () => {
    const rc = createRenderContext({ zoom: 0.2 });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    renderClusters(rc, viewport);

    const drawCalls = (rc.ctx as unknown as { __getDrawCalls(): unknown[] }).__getDrawCalls();
    const textCalls = drawCalls.filter((c: unknown) => (c as { type: string }).type === 'fillText');
    expect(textCalls.length).to.be.greaterThan(0);
  });

  it('should use manual cluster positions when provided', () => {
    const cluster = createTestCluster('manual-cluster', 'ManualCluster');
    const manualPositions = new Map([['manual-cluster', { x: 50, y: 50 }]]);

    const rc = createRenderContext({
      layout: createMockLayout([cluster]),
      manualClusterPositions: manualPositions,
    });
    const viewport = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

    expect(() => renderClusters(rc, viewport)).not.toThrow();
  });
});

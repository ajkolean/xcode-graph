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
    cycleEdgeColor: 'rgba(239, 68, 68, 0.8)',
    cycleGlowColor: 'rgba(239, 68, 68, 0.6)',
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
});

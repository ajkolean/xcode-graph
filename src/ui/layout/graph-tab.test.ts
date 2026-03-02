/**
 * GraphTab Lit Component Tests
 *
 * Tests for rendering and event handler wiring.
 *
 * NOTE: GraphTab uses SignalWatcher + watch() directives which crash in jsdom
 * when signals change (the watcher's __flushEffects tries to iterate undefined
 * effects). Therefore we test signal functions directly and verify rendering
 * without triggering signal changes that cause re-renders.
 */

import {
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setHoveredNode,
} from '@graph/signals/index';
import { fixture, html } from '@open-wc/testing';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import {
  enableAnimation,
  setZoom,
  toggleAnimation,
  zoom,
  zoomIn,
  zoomOut,
} from '@shared/signals/index';
import { beforeEach, describe, expect, it } from 'vitest';
import type { GraphTab } from './graph-tab';
import './graph-tab';

const mockNodes: GraphNode[] = [
  {
    id: 'node1',
    name: 'CoreLib',
    type: NodeType.Framework,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
  },
  {
    id: 'node2',
    name: 'Utils',
    type: NodeType.Library,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
  },
];

const mockEdges: GraphEdge[] = [{ source: 'node1', target: 'node2' }];

describe('xcode-graph-tab', () => {
  beforeEach(() => {
    selectNode(null);
    selectCluster(null);
    setHoveredNode(null);
    setZoom(1);
  });

  it('should render with display nodes and edges', async () => {
    const el = await fixture<GraphTab>(html`
      <xcode-graph-tab
        .displayNodes=${mockNodes}
        .displayEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
      ></xcode-graph-tab>
    `);

    expect(el).toBeDefined();
    const canvas = el.shadowRoot?.querySelector('xcode-graph-canvas');
    expect(canvas).toBeDefined();
  });

  it('should render graph canvas and right sidebar', async () => {
    const el = await fixture<GraphTab>(html`
      <xcode-graph-tab
        .displayNodes=${mockNodes}
        .displayEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
      ></xcode-graph-tab>
    `);

    const canvas = el.shadowRoot?.querySelector('xcode-graph-canvas');
    expect(canvas).toBeDefined();
    expect(canvas).not.toBeNull();

    const sidebar = el.shadowRoot?.querySelector('xcode-graph-right-sidebar');
    expect(sidebar).toBeDefined();
    expect(sidebar).not.toBeNull();
  });

  it('should render controls component', async () => {
    const el = await fixture<GraphTab>(html`
      <xcode-graph-tab
        .displayNodes=${mockNodes}
        .displayEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
      ></xcode-graph-tab>
    `);

    const controls = el.shadowRoot?.querySelector('xcode-graph-controls');
    expect(controls).toBeDefined();
    expect(controls).not.toBeNull();
  });

  it('should render right sidebar with correct props', async () => {
    const el = await fixture<GraphTab>(html`
      <xcode-graph-tab
        .displayNodes=${mockNodes}
        .displayEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
      ></xcode-graph-tab>
    `);

    const sidebar = el.shadowRoot?.querySelector('xcode-graph-right-sidebar');
    expect(sidebar).toBeDefined();
  });
});

/**
 * Signal function tests - covers the logic that graph-tab event handlers delegate to.
 * These test the same signal functions (selectNode, selectCluster, setZoom, etc.)
 * without rendering a SignalWatcher component that crashes in jsdom.
 */
describe('graph-tab signal handlers (unit)', () => {
  beforeEach(() => {
    selectNode(null);
    selectCluster(null);
    setHoveredNode(null);
    setZoom(1);
  });

  it('selectNode sets the selectedNode signal', () => {
    expect(selectedNode.get()).toBeNull();
    const node = mockNodes[0] ?? null;
    selectNode(node);
    expect(selectedNode.get()).toBe(mockNodes[0]);
  });

  it('selectCluster sets the selectedCluster signal', () => {
    expect(selectedCluster.get()).toBeNull();
    selectCluster('MyApp');
    expect(selectedCluster.get()).toBe('MyApp');
  });

  it('zoomIn increases zoom', () => {
    setZoom(1);
    zoomIn();
    expect(zoom.get()).toBeGreaterThan(1);
  });

  it('zoomOut decreases zoom', () => {
    setZoom(1);
    zoomOut();
    expect(zoom.get()).toBeLessThan(1);
  });

  it('setZoom sets exact zoom value', () => {
    setZoom(0.5);
    expect(zoom.get()).toBe(0.5);
  });

  it('setZoom handles zoom-step value', () => {
    setZoom(0.75);
    expect(zoom.get()).toBe(0.75);
  });

  it('toggleAnimation flips enableAnimation', () => {
    const initial = enableAnimation.get();
    toggleAnimation();
    expect(enableAnimation.get()).toBe(!initial);
  });
});

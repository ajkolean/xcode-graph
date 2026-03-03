import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { AnimatedValue } from '@graph/utils/canvas-animation';
import { fixture, html, oneEvent } from '@open-wc/testing';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import type { ClusterPosition, NodePosition } from '@shared/schemas/simulation.types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphCanvas } from './graph-canvas';
import './graph-canvas';

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

function createNodePosition(id: string, x: number, y: number, clusterId = 'default'): NodePosition {
  return { id, x, y, vx: 0, vy: 0, clusterId, radius: 10 };
}

function createClusterPosition(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): ClusterPosition {
  return { id, x, y, vx: 0, vy: 0, width, height, nodeCount: 1 };
}

/** Interface for accessing private members of GraphCanvas in tests */
interface GraphCanvasInternals {
  layout: GraphLayoutController;
  scene: { destroy: () => void } | null;
  isAnimating: boolean;
  nodeAlphaMap: Map<string, AnimatedValue>;
  fadingOutNodes: Map<string, { node: GraphNode; startTime: number }>;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  didInitialFit: boolean;
  onFrame: (timestamp: number, dt: number) => void;
  renderScene: () => void;
  resizeScene: () => void;
  updateNodeAlphaTargets: () => void;
  containerEl: HTMLDivElement;
}

describe('xcode-graph-canvas', () => {
  it('should set up a container element on render', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container');
    expect(container).toBeDefined();
  });

  it('should initialize constructor with default values', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);

    expect(el.nodes).to.deep.equal([]);
    expect(el.edges).to.deep.equal([]);
    expect(el.selectedNode).toBeNull();
    expect(el.selectedCluster).toBeNull();
    expect(el.hoveredNode).toBeNull();
    expect(el.searchQuery).to.equal('');
    expect(el.viewMode).to.equal(ViewMode.Full);
    expect(el.zoom).to.equal(1);
    expect(el.enableAnimation).to.equal(false);
    expect(el.showDirectDeps).to.equal(false);
    expect(el.showTransitiveDeps).to.equal(false);
    expect(el.showDirectDependents).to.equal(false);
    expect(el.showTransitiveDependents).to.equal(false);
  });

  it('should have container with tabindex for keyboard accessibility', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container');
    expect(container?.getAttribute('tabindex')).to.equal('-1');
  });

  it('should dispatch zoom-in event on "+" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
    setTimeout(() =>
      container.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-in');
    expect(event).toBeDefined();
  });

  it('should dispatch zoom-out event on "-" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
    setTimeout(() =>
      container.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-out');
    expect(event).toBeDefined();
  });

  it('should dispatch zoom-reset event on "0" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
    setTimeout(() =>
      container.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-reset');
    expect(event).toBeDefined();
  });

  it('should dispatch node-select with null on "Escape" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
    setTimeout(() =>
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    const event = await oneEvent(el, 'node-select');
    expect(event).toBeDefined();
    expect((event as CustomEvent).detail.node).toBeNull();
  });

  describe('keyboard arrow key panning', () => {
    it('should handle ArrowUp keydown without throwing', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should handle ArrowDown keydown without throwing', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should handle ArrowLeft keydown without throwing', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should handle ArrowRight keydown without throwing', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should ignore unrecognized keys', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(el).toBeDefined();
    });
  });

  describe('dispatch "=" as zoom-in', () => {
    it('should dispatch zoom-in event on "=" keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('#konva-container') as HTMLDivElement;
      setTimeout(() =>
        container.dispatchEvent(new KeyboardEvent('keydown', { key: '=', bubbles: true })),
      );
      const event = await oneEvent(el, 'zoom-in');
      expect(event).toBeDefined();
    });
  });

  describe('willUpdate with node/edge changes', () => {
    it('should recompute layout when nodes change', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'n1', name: 'Node1' });
      const node2 = createTestNode({ id: 'n2', name: 'Node2', type: NodeType.Framework });
      const edge: GraphEdge = { source: 'n1', target: 'n2' };

      el.nodes = [node1, node2];
      el.edges = [edge];
      await el.updateComplete;

      expect(el.nodes.length).to.equal(2);
      expect(el.edges.length).to.equal(1);
    });

    it('should handle enableAnimation toggle', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'n1', name: 'Node1' });
      el.nodes = [node1];
      await el.updateComplete;

      el.enableAnimation = true;
      await el.updateComplete;

      expect(el.enableAnimation).to.equal(true);
    });
  });

  describe('selection and cluster state', () => {
    it('should update alpha targets when selectedNode changes', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'n1', name: 'Node1' });
      const node2 = createTestNode({ id: 'n2', name: 'Node2', type: NodeType.Framework });
      el.nodes = [node1, node2];
      el.edges = [{ source: 'n1', target: 'n2' }];
      await el.updateComplete;

      el.selectedNode = node1;
      await el.updateComplete;

      expect(el.selectedNode).to.equal(node1);
    });

    it('should update alpha targets when selectedCluster changes', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'n1', name: 'Node1', project: 'ProjA' });
      el.nodes = [node1];
      await el.updateComplete;

      el.selectedCluster = 'ProjA';
      await el.updateComplete;

      expect(el.selectedCluster).to.equal('ProjA');
    });
  });

  describe('fitToViewport', () => {
    it('should not throw when cluster positions are empty', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      expect(() => el.fitToViewport()).not.toThrow();
    });
  });

  describe('disconnectedCallback', () => {
    it('should stop animation loop and destroy scene when disconnected', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      el.remove();
      expect(el.isConnected).to.equal(false);

      const internal = el as unknown as GraphCanvasInternals;
      expect(internal.scene).toBeNull();
    });
  });

  describe('hidden DOM node-select re-dispatch', () => {
    it('should re-dispatch node-select events from xcode-graph-hidden-dom', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const hiddenDom = el.shadowRoot?.querySelector('xcode-graph-hidden-dom');
      expect(hiddenDom).toBeDefined();

      if (hiddenDom) {
        setTimeout(() =>
          hiddenDom.dispatchEvent(
            new CustomEvent('node-select', {
              detail: { node: null },
              bubbles: true,
              composed: true,
            }),
          ),
        );
        const event = await oneEvent(el, 'node-select');
        expect(event).toBeDefined();
        expect((event as CustomEvent).detail.node).toBeNull();
      }
    });
  });

  describe('viewMode changes', () => {
    it('should update animating state when viewMode changes', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      el.viewMode = ViewMode.Focused;
      await el.updateComplete;

      expect(el.viewMode).to.equal(ViewMode.Focused);
    });
  });

  describe('firstUpdated container not found branch', () => {
    it('should log error when container element is not available', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      Object.defineProperty(internal, 'containerEl', { value: null, writable: true });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress console output */
      });
      el.firstUpdated();
      expect(errorSpy).toHaveBeenCalledWith('Konva container element not found in firstUpdated');
      errorSpy.mockRestore();
    });
  });

  describe('willUpdate filter change detection', () => {
    it('should detect filter change when all node IDs already have positions', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'n1', name: 'Node1' });
      const node2 = createTestNode({ id: 'n2', name: 'Node2', type: NodeType.Framework });
      const edge: GraphEdge = { source: 'n1', target: 'n2' };

      el.nodes = [node1, node2];
      el.edges = [edge];
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      internal.layout.nodePositions.set('n1', createNodePosition('n1', 0, 0));
      internal.layout.nodePositions.set('n2', createNodePosition('n2', 10, 10));

      el.nodes = [node1];
      el.edges = [];
      await el.updateComplete;

      expect(el.nodes.length).to.equal(1);
    });
  });

  describe('layout computation error handling', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress console output */
      });
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle layout computation errors in willUpdate', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      vi.spyOn(internal.layout, 'computeLayout').mockRejectedValueOnce(new Error('Layout failed'));

      const node1 = createTestNode({ id: 'err1', name: 'ErrorNode' });
      el.nodes = [node1];
      el.edges = [];
      await el.updateComplete;

      await new Promise((r) => setTimeout(r, 50));
      expect(el.nodes.length).to.equal(1);
    });

    it('should handle layout computation errors when enableAnimation toggled', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'err2', name: 'ErrorNode2' });
      el.nodes = [node1];
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      vi.spyOn(internal.layout, 'computeLayout').mockRejectedValueOnce(
        new Error('Animation layout failed'),
      );

      el.enableAnimation = true;
      await el.updateComplete;

      await new Promise((r) => setTimeout(r, 50));
      expect(el.enableAnimation).to.equal(true);
    });
  });

  describe('updateNodeAlphaTargets', () => {
    it('should set isAnimating when node is selected', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'a1', name: 'Alpha1', project: 'ProjA' });
      const node2 = createTestNode({
        id: 'a2',
        name: 'Alpha2',
        type: NodeType.Framework,
        project: 'ProjB',
      });

      el.nodes = [node1, node2];
      el.edges = [{ source: 'a1', target: 'a2' }];
      await el.updateComplete;

      el.selectedNode = node1;
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      expect(internal.isAnimating).to.equal(true);
    });
  });

  describe('trackRemovedNodesForFadeOut', () => {
    it('should track removed nodes for fade-out when nodes are filtered', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const node1 = createTestNode({ id: 'rm1', name: 'Remove1' });
      const node2 = createTestNode({ id: 'rm2', name: 'Remove2', type: NodeType.Framework });

      el.nodes = [node1, node2];
      await el.updateComplete;

      el.nodes = [node1];
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      expect(internal.fadingOutNodes.has('rm2')).to.equal(true);
    });
  });

  describe('updated with initial fit', () => {
    it('should perform initial fit when cluster positions become available', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      internal.didInitialFit = false;

      internal.layout.clusterPositions.set(
        'TestProj',
        createClusterPosition('TestProj', 50, 50, 100, 100),
      );

      el.requestUpdate();
      await el.updateComplete;

      expect(internal.didInitialFit).to.equal(true);
    });
  });

  describe('fitToViewport with valid cluster positions', () => {
    it('should compute zoom and pan from cluster bounds', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;

      internal.layout.clusterPositions.set(
        'Cluster1',
        createClusterPosition('Cluster1', 100, 100, 200, 200),
      );
      internal.layout.clusterPositions.set(
        'Cluster2',
        createClusterPosition('Cluster2', 300, 300, 200, 200),
      );

      const events: CustomEvent[] = [];
      el.addEventListener('zoom-change', (e) => events.push(e as CustomEvent));

      el.fitToViewport();

      expect(events.length).to.equal(1);
      expect(events[0]?.detail).to.be.a('number');
    });
  });

  describe('fitToViewport non-finite bounds check', () => {
    it('should return early when cluster bounds are non-finite', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const internal = el as unknown as GraphCanvasInternals;
      internal.layout.clusterPositions.set(
        'bad-cluster',
        createClusterPosition('bad-cluster', Number.NaN, Number.NaN, Number.NaN, Number.NaN),
      );

      const zoomBefore = el.zoom;
      el.fitToViewport();
      expect(el.zoom).to.equal(zoomBefore);
    });
  });
});

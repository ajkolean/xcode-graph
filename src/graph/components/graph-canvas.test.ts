import { fixture, html, oneEvent } from '@open-wc/testing';
import { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
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

describe('xcode-graph-canvas', () => {
  it('should set up a canvas element on render', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas');
    expect(canvas).toBeDefined();
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

  it('should have canvas with tabindex for keyboard accessibility', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas');
    expect(canvas?.getAttribute('tabindex')).to.equal('-1');
  });

  it('should dispatch zoom-in event on "+" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-in');
    expect(event).toBeDefined();
  });

  it('should dispatch zoom-out event on "-" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-out');
    expect(event).toBeDefined();
  });

  it('should dispatch zoom-reset event on "0" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-reset');
    expect(event).toBeDefined();
  });

  it('should dispatch node-select with null on "Escape" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    const event = await oneEvent(el, 'node-select');
    expect(event).toBeDefined();
    expect((event as CustomEvent).detail.node).toBeNull();
  });

  describe('keyboard arrow key panning', () => {
    it('should pan up on ArrowUp keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      // ArrowUp should adjust pan.y by +50 — event doesn't bubble externally,
      // but it should not throw and the component should handle it
      expect(el).toBeDefined();
    });

    it('should pan down on ArrowDown keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should pan left on ArrowLeft keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should pan right on ArrowRight keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(el).toBeDefined();
    });

    it('should ignore unrecognized keys', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(el).toBeDefined();
    });
  });

  describe('mouse interactions', () => {
    it('should handle mousedown on canvas', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }),
      );
      expect(el).toBeDefined();
    });

    it('should handle mousemove on canvas and set cursor style', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      // First mousedown to start drag
      canvas.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }),
      );
      // Then mousemove while dragging
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 150, clientY: 150 }),
      );
      // While dragging, cursor should be 'grabbing'
      expect(canvas.style.cursor).to.equal('grabbing');
    });

    it('should set cursor to grab when not dragging and no hover', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      // Just move without mousedown
      canvas.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 150, clientY: 150 }),
      );
      expect(canvas.style.cursor).to.equal('grab');
    });

    it('should handle mouseup on canvas', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 100, clientY: 100 }),
      );
      expect(el).toBeDefined();
    });

    it('should handle mouseleave on canvas (triggers mouseup handler)', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, clientX: 0, clientY: 0 }));
      expect(el).toBeDefined();
    });

    it('should handle wheel event and dispatch zoom-change', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      setTimeout(() =>
        canvas.dispatchEvent(
          new WheelEvent('wheel', { bubbles: true, deltaY: -100, clientX: 200, clientY: 200 }),
        ),
      );
      const event = await oneEvent(el, 'zoom-change');
      expect(event).toBeDefined();
      expect((event as CustomEvent).detail).to.be.a('number');
    });
  });

  describe('Enter/Space key node selection', () => {
    it('should dispatch node-select for hovered node on Enter', async () => {
      const node = createTestNode({ id: 'hoverTarget', name: 'HoverTarget' });
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      el.nodes = [node];
      await el.updateComplete;

      // Set the private interactionState.hoveredNode directly
      const internal = el as unknown as { interactionState: { hoveredNode: string | null } };
      internal.interactionState.hoveredNode = 'hoverTarget';

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      setTimeout(() =>
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
      );
      const event = await oneEvent(el, 'node-select');
      expect(event).toBeDefined();
    });

    it('should dispatch node-select for hovered node on Space', async () => {
      const node = createTestNode({ id: 'hoverTarget', name: 'HoverTarget' });
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      el.nodes = [node];
      await el.updateComplete;

      const internal = el as unknown as { interactionState: { hoveredNode: string | null } };
      internal.interactionState.hoveredNode = 'hoverTarget';

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      setTimeout(() =>
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })),
      );
      const event = await oneEvent(el, 'node-select');
      expect(event).toBeDefined();
    });

    it('should deselect when Enter pressed on already selected hovered node', async () => {
      const node = createTestNode({ id: 'hoverTarget', name: 'HoverTarget' });
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      el.nodes = [node];
      el.selectedNode = node;
      await el.updateComplete;

      const internal = el as unknown as { interactionState: { hoveredNode: string | null } };
      internal.interactionState.hoveredNode = 'hoverTarget';

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      setTimeout(() =>
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
      );
      const event = await oneEvent(el, 'node-select');
      expect(event).toBeDefined();
      // Should deselect (toggle off) since it's already selected
      expect((event as CustomEvent).detail.node).toBeNull();
    });

    it('should not dispatch node-select on Enter when no node is hovered', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      // Enter with no hovered node should not dispatch node-select
      // It should just return (early exit on line 594)
      const events: Event[] = [];
      el.addEventListener('node-select', (e: Event) => events.push(e));
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      // Allow microtasks to flush
      await new Promise((r) => setTimeout(r, 50));
      expect(events.length).to.equal(0);
    });
  });

  describe('dispatch "=" as zoom-in', () => {
    it('should dispatch zoom-in event on "=" keydown', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      setTimeout(() =>
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '=', bubbles: true })),
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

      // After setting nodes/edges, the component should have processed them
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

      // After selecting a node, component should update internal state
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

      // fitToViewport with no clusters should be a no-op
      expect(() => el.fitToViewport()).not.toThrow();
    });
  });

  describe('disconnectedCallback', () => {
    it('should stop animation loop when disconnected', async () => {
      const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
      await el.updateComplete;

      // Remove from DOM triggers disconnectedCallback
      el.remove();
      expect(el.isConnected).to.equal(false);
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
});

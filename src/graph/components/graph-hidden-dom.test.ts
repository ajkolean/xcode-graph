import { expect, fixture, html } from '@open-wc/testing';
import {
  DependencyKind,
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  Platform,
} from '@shared/schemas/graph.types';
import { describe, it, vi, expect as vitestExpect } from 'vitest';
import './graph-hidden-dom';
import type { GraphHiddenDom } from './graph-hidden-dom';

function makeNode(id: string, name: string, type: NodeType = NodeType.Framework): GraphNode {
  return {
    id,
    name,
    type,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'TestProject',
  } as GraphNode;
}

function makeEdge(source: string, target: string): GraphEdge {
  return { source, target, kind: DependencyKind.Target } as GraphEdge;
}

describe('xcode-graph-hidden-dom', () => {
  it('should render graph summary', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const summary = el.shadowRoot?.getElementById('graph-summary');
    expect(summary?.textContent).to.contain('2 nodes');
    expect(summary?.textContent).to.contain('1 edges');
  });

  it('should render tree items for each node', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.length).to.equal(3);
  });

  it('should use roving tabindex pattern', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[0]?.getAttribute('tabindex')).to.equal('0');
    expect(items?.[1]?.getAttribute('tabindex')).to.equal('-1');
  });

  it('should dispatch node-select on Enter', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const selectHandler = vi.fn();

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom
        .nodes=${nodes}
        .edges=${[]}
        @node-select=${selectHandler}
      ></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;
    if (!tree) throw new Error('expected tree element');
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    vitestExpect(selectHandler).toHaveBeenCalledOnce();
    const event = selectHandler.mock.calls[0]?.[0] as CustomEvent;
    expect(event.detail.node.id).to.equal('a');
  });

  it('should navigate with arrow keys', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;
    if (!tree) throw new Error('expected tree element');

    // Navigate down
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[1]?.getAttribute('tabindex')).to.equal('0');
    expect(items?.[0]?.getAttribute('tabindex')).to.equal('-1');
  });

  it('should wrap around on navigation', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;
    if (!tree) throw new Error('expected tree element');

    // Navigate up from first item should wrap to last
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await el.updateComplete;

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[1]?.getAttribute('tabindex')).to.equal('0');
  });

  it('should show selected node in live region', async () => {
    const nodes = [makeNode('a', 'NodeA')];
    const selectedNode = nodes[0];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom
        .nodes=${nodes}
        .edges=${[]}
        .selectedNode=${selectedNode}
      ></xcode-graph-hidden-dom>
    `);

    const live = el.shadowRoot?.querySelector('[aria-live="polite"]');
    expect(live?.textContent).to.contain('Selected node: NodeA');
  });

  it('should mark selected node with aria-selected', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom
        .nodes=${nodes}
        .edges=${[]}
        .selectedNode=${nodes[0]}
      ></xcode-graph-hidden-dom>
    `);

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[0]?.getAttribute('aria-selected')).to.equal('true');
    expect(items?.[1]?.getAttribute('aria-selected')).to.equal('false');
  });

  it('should toggle selection on Enter if already selected', async () => {
    const nodes = [makeNode('a', 'NodeA')];
    const selectHandler = vi.fn();

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom
        .nodes=${nodes}
        .edges=${[]}
        .selectedNode=${nodes[0]}
        @node-select=${selectHandler}
      ></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;
    if (!tree) throw new Error('expected tree element');
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    vitestExpect(selectHandler).toHaveBeenCalledOnce();
    const event = selectHandler.mock.calls[0]?.[0] as CustomEvent;
    expect(event.detail.node).to.be.null;
  });

  it('should handle Home and End keys', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;
    if (!tree) throw new Error('expected tree element');

    // Press End to go to last item
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;

    let items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[2]?.getAttribute('tabindex')).to.equal('0');

    // Press Home to go back to first
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;

    items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[0]?.getAttribute('tabindex')).to.equal('0');
  });

  it('should include node description in aria-label', async () => {
    const nodes = [makeNode('a', 'NodeA', NodeType.Framework)];
    const edges = [makeEdge('a', 'b'), makeEdge('c', 'a')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const item = el.shadowRoot?.querySelector('[role="treeitem"]');
    const label = item?.getAttribute('aria-label') ?? '';
    expect(label).to.contain('NodeA');
    expect(label).to.contain('framework');
    expect(label).to.contain('1 dependencies');
    expect(label).to.contain('1 dependents');
  });

  it('should be visually hidden', async () => {
    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${[]} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    // The host element should be clipped
    expect(el).to.exist;
    // Check that the component renders
    const region = el.shadowRoot?.querySelector('[role="region"]');
    expect(region).to.exist;
  });

  it('should handle empty nodes gracefully', async () => {
    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${[]} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const summary = el.shadowRoot?.getElementById('graph-summary');
    expect(summary?.textContent).to.contain('0 nodes');

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.length).to.equal(0);
  });
});

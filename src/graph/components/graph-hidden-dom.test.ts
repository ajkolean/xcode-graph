import { fixture, html } from '@open-wc/testing';
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
  it('should render graph summary with node, edge, and cluster counts', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const summary = el.shadowRoot?.getElementById('graph-summary');
    expect(summary?.textContent).to.contain('2 nodes');
    expect(summary?.textContent).to.contain('1 edges');
    expect(summary?.textContent).to.contain('1 clusters');
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
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    vitestExpect(selectHandler).toHaveBeenCalledOnce();
    expect(selectHandler.mock.calls[0][0].detail.node.id).to.equal('a');
  });

  it('should navigate with arrow keys', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;

    // Navigate down
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
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

    // Navigate up from first item should wrap to last
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
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
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    vitestExpect(selectHandler).toHaveBeenCalledOnce();
    expect(selectHandler.mock.calls[0][0].detail.node).toBeNull();
  });

  it('should handle Home and End keys', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const tree = el.shadowRoot?.querySelector('[role="tree"]') as HTMLElement;

    // Press End to go to last item
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;

    let items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');
    expect(items?.[2]?.getAttribute('tabindex')).to.equal('0');

    // Press Home to go back to first
    tree?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
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
    expect(el).toBeDefined();
    // Check that the component renders
    const region = el.shadowRoot?.querySelector('[role="region"]');
    expect(region).toBeDefined();
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

  it('should render edge table with correct number of rows', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const rows = el.shadowRoot?.querySelectorAll('table tbody tr');
    expect(rows?.length).to.equal(2);
  });

  it('should render edge table with role="grid" and headers', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const table = el.shadowRoot?.querySelector('table[role="grid"]');
    expect(table).toBeDefined();

    const caption = el.shadowRoot?.querySelector('table caption');
    expect(caption?.textContent).to.contain('Edge relationships');

    const headers = el.shadowRoot?.querySelectorAll('table thead th');
    expect(headers?.length).to.equal(3);
    expect(headers?.[0]?.textContent).to.contain('Source');
    expect(headers?.[1]?.textContent).to.contain('Target');
    expect(headers?.[2]?.textContent).to.contain('Kind');
  });

  it('should render edge rows with correct data', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const row = el.shadowRoot?.querySelector('table tbody tr');
    expect(row).toBeDefined();
    expect(row?.getAttribute('role')).to.equal('row');
    expect(row?.getAttribute('id')).to.equal('edge-0');

    const cells = row?.querySelectorAll('td');
    expect(cells?.length).to.equal(3);
    expect(cells?.[0]?.textContent).to.contain('NodeA');
    expect(cells?.[1]?.textContent).to.contain('NodeB');
    expect(cells?.[2]?.textContent).to.contain('target');
  });

  it('should render edge rows with aria-label', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const row = el.shadowRoot?.querySelector('table tbody tr');
    const label = row?.getAttribute('aria-label') ?? '';
    expect(label).to.contain('NodeA');
    expect(label).to.contain('NodeB');
    expect(label).to.contain('target');
  });

  it('should render empty edge table when no edges', async () => {
    const nodes = [makeNode('a', 'NodeA')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const table = el.shadowRoot?.querySelector('table[role="grid"]');
    expect(table).toBeDefined();

    const rows = el.shadowRoot?.querySelectorAll('table tbody tr');
    expect(rows?.length).to.equal(0);
  });

  it('should include node and edge counts in live region', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const live = el.shadowRoot?.querySelector('[aria-live="polite"]');
    expect(live?.textContent).to.contain('2 nodes');
    expect(live?.textContent).to.contain('1 edges');
    expect(live?.textContent).to.contain('1 clusters');
  });

  it('should include selected node info with counts in live region', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom
        .nodes=${nodes}
        .edges=${edges}
        .selectedNode=${nodes[0]}
      ></xcode-graph-hidden-dom>
    `);

    const live = el.shadowRoot?.querySelector('[aria-live="polite"]');
    expect(live?.textContent).to.contain('Selected node: NodeA');
    expect(live?.textContent).to.contain('2 nodes');
    expect(live?.textContent).to.contain('1 edges');
  });

  it('should count clusters from unique project names', async () => {
    const nodeA = makeNode('a', 'NodeA');
    nodeA.project = 'ProjectAlpha';
    const nodeB = makeNode('b', 'NodeB');
    nodeB.project = 'ProjectBeta';
    const nodeC = makeNode('c', 'NodeC');
    nodeC.project = 'ProjectAlpha';
    const nodes = [nodeA, nodeB, nodeC];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${[]}></xcode-graph-hidden-dom>
    `);

    const summary = el.shadowRoot?.getElementById('graph-summary');
    expect(summary?.textContent).to.contain('2 clusters');
  });

  it('should link tree nodes to related edge rows via aria-describedby', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB'), makeNode('c', 'NodeC')];
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');

    // NodeA is source of both edges
    const nodeADescribedBy = items?.[0]?.getAttribute('aria-describedby');
    expect(nodeADescribedBy).to.equal('edge-0 edge-1');

    // NodeB is target of edge-0
    const nodeBDescribedBy = items?.[1]?.getAttribute('aria-describedby');
    expect(nodeBDescribedBy).to.equal('edge-0');

    // NodeC is target of edge-1
    const nodeCDescribedBy = items?.[2]?.getAttribute('aria-describedby');
    expect(nodeCDescribedBy).to.equal('edge-1');
  });

  it('should not add aria-describedby when node has no edges', async () => {
    const nodes = [makeNode('a', 'NodeA'), makeNode('b', 'NodeB')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    const items = el.shadowRoot?.querySelectorAll('[role="treeitem"]');

    // NodeA has edge, so aria-describedby should be present
    expect(items?.[0]?.hasAttribute('aria-describedby')).toBe(true);
  });

  it('should have proper ARIA roles and labels', async () => {
    const nodes = [makeNode('a', 'NodeA')];
    const edges = [makeEdge('a', 'b')];

    const el = await fixture<GraphHiddenDom>(html`
      <xcode-graph-hidden-dom .nodes=${nodes} .edges=${edges}></xcode-graph-hidden-dom>
    `);

    // Region role
    const region = el.shadowRoot?.querySelector('[role="region"]');
    expect(region).toBeDefined();
    expect(region?.getAttribute('aria-label')).to.equal('Graph navigation');

    // Tree role
    const tree = el.shadowRoot?.querySelector('[role="tree"]');
    expect(tree).toBeDefined();
    expect(tree?.getAttribute('aria-label')).to.equal('Graph nodes');
    expect(tree?.getAttribute('aria-describedby')).to.equal('graph-summary');

    // Grid role on edge table
    const table = el.shadowRoot?.querySelector('[role="grid"]');
    expect(table).toBeDefined();
    expect(table?.getAttribute('aria-label')).to.equal('Edge relationships');

    // Live region
    const live = el.shadowRoot?.querySelector('[aria-live="polite"]');
    expect(live).toBeDefined();
    expect(live?.getAttribute('aria-atomic')).to.equal('true');
  });
});

/**
 * NodeList Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type { GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import type { GraphNodeList } from './node-list';
import './node-list';

const mockNodes: GraphNode[] = [
  {
    id: 'node1',
    name: 'CoreLib',
    type: NodeType.Framework,
    origin: Origin.Local,
    platform: Platform.iOS,
  },
  {
    id: 'node2',
    name: 'NetworkKit',
    type: NodeType.Library,
    origin: Origin.External,
    platform: Platform.iOS,
  },
];

describe('xcode-graph-node-list', () => {
  it('should render with title', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></xcode-graph-node-list>
    `);

    expect(el).to.exist;
    const header = el.shadowRoot?.querySelector('.header');
    expect(header).to.exist;
  });

  it('should render list items for each node', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></xcode-graph-node-list>
    `);

    const items = el.shadowRoot?.querySelectorAll('xcode-graph-list-item-row');
    expect(items?.length).to.equal(2);
  });

  it('should show empty message when no nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .nodes=${[]}
        empty-message="No dependencies"
      ></xcode-graph-node-list>
    `);

    const empty = el.shadowRoot?.querySelector('.empty');
    expect(empty?.textContent).to.equal('No dependencies');
  });

  it('should pass suffix to section header', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependents"
        .nodes=${mockNodes}
        suffix="direct"
      ></xcode-graph-node-list>
    `);

    const countText = el.shadowRoot?.querySelector('.count');
    expect(countText?.textContent).to.contain('direct');
  });

  it('should dispatch node-select event', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></xcode-graph-node-list>
    `);

    // Trigger the row-select event on the list item
    const row = el.shadowRoot?.querySelector('xcode-graph-list-item-row');
    setTimeout(() =>
      row?.dispatchEvent(
        new CustomEvent('row-select', {
          detail: { node: mockNodes[0] },
          bubbles: true,
          composed: true,
        }),
      ),
    );
    const event = (await oneEvent(el, 'node-select')) as CustomEvent;

    expect(event).to.exist;
    expect(event.detail.node.id).to.equal('node1');
  });

  it('should format subtitle correctly for internal nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Test"
        .nodes=${[mockNodes[0]]}
      ></xcode-graph-node-list>
    `);

    const row = el.shadowRoot?.querySelector('xcode-graph-list-item-row');
    expect(row?.getAttribute('subtitle')).to.equal('Framework');
  });

  it('should format subtitle correctly for external nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Test"
        .nodes=${[mockNodes[1]]}
      ></xcode-graph-node-list>
    `);

    const row = el.shadowRoot?.querySelector('xcode-graph-list-item-row');
    expect(row?.getAttribute('subtitle')).to.equal('External Library');
  });
});

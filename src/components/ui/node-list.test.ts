/**
 * NodeList Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphNodeList } from './node-list';
import type { GraphNode } from '@/schemas/graph.schema';
import './node-list';

const mockNodes: GraphNode[] = [
  {
    id: 'node1',
    name: 'CoreLib',
    type: 'framework',
    origin: 'internal',
  },
  {
    id: 'node2',
    name: 'NetworkKit',
    type: 'staticLibrary',
    origin: 'external',
  },
];

describe('graph-node-list', () => {
  it('should render with title', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></graph-node-list>
    `);

    expect(el).to.exist;
    const header = el.shadowRoot?.querySelector('graph-section-header');
    expect(header).to.exist;
  });

  it('should render list items for each node', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></graph-node-list>
    `);

    const items = el.shadowRoot?.querySelectorAll('graph-list-item-row');
    expect(items?.length).to.equal(2);
  });

  it('should show empty message when no nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Dependencies"
        .nodes=${[]}
        empty-message="No dependencies"
      ></graph-node-list>
    `);

    const empty = el.shadowRoot?.querySelector('.empty');
    expect(empty?.textContent).to.equal('No dependencies');
  });

  it('should pass suffix to section header', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Dependents"
        .nodes=${mockNodes}
        suffix="direct"
      ></graph-node-list>
    `);

    const header = el.shadowRoot?.querySelector('graph-section-header');
    expect(header?.getAttribute('suffix')).to.equal('direct');
  });

  it('should dispatch node-select event', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Dependencies"
        .nodes=${mockNodes}
      ></graph-node-list>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('node-select', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    // Trigger the row-select event on the list item
    const row = el.shadowRoot?.querySelector('graph-list-item-row');
    row?.dispatchEvent(
      new CustomEvent('row-select', {
        detail: { node: mockNodes[0] },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { node: GraphNode }).node.id).to.equal('node1');
  });

  it('should format subtitle correctly for internal nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Test"
        .nodes=${[mockNodes[0]]}
      ></graph-node-list>
    `);

    const row = el.shadowRoot?.querySelector('graph-list-item-row');
    expect(row?.getAttribute('subtitle')).to.equal('Framework');
  });

  it('should format subtitle correctly for external nodes', async () => {
    const el = await fixture<GraphNodeList>(html`
      <graph-node-list
        title="Test"
        .nodes=${[mockNodes[1]]}
      ></graph-node-list>
    `);

    const row = el.shadowRoot?.querySelector('graph-list-item-row');
    expect(row?.getAttribute('subtitle')).to.equal('External StaticLibrary');
  });
});

/**
 * NodeListEventsBase tests - branch coverage for event forwarding
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { GraphNode } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import { NodeListEventsBase } from './node-list-base';

// Create a concrete subclass for testing since NodeListEventsBase is abstract-like
class TestNodeList extends NodeListEventsBase {
  triggerSelect(node: GraphNode) {
    this.handleNodeSelect(new CustomEvent('row-select', { detail: { node } }));
  }
  triggerHover(nodeId: string) {
    this.handleNodeHover(new CustomEvent('row-hover', { detail: { nodeId } }));
  }
  triggerHoverEnd() {
    this.handleHoverEnd();
  }
}

if (!customElements.get('test-node-list-events')) {
  customElements.define('test-node-list-events', TestNodeList);
}

describe('NodeListEventsBase', () => {
  it('handleNodeSelect dispatches node-select event', async () => {
    const el = await fixture<TestNodeList>(html`<test-node-list-events></test-node-list-events>`);
    const node = { id: 'n1', name: 'TestNode' } as GraphNode;

    let received: GraphNode | null = null;
    el.addEventListener('node-select', ((e: CustomEvent) => {
      received = e.detail.node;
    }) as EventListener);

    el.triggerSelect(node);
    expect(received).to.equal(node);
  });

  it('handleNodeHover dispatches node-hover with nodeId', async () => {
    const el = await fixture<TestNodeList>(html`<test-node-list-events></test-node-list-events>`);

    let receivedId: string | null = null;
    el.addEventListener('node-hover', ((e: CustomEvent) => {
      receivedId = e.detail.nodeId;
    }) as EventListener);

    el.triggerHover('n1');
    expect(receivedId).to.equal('n1');
  });

  it('handleHoverEnd dispatches node-hover with null nodeId', async () => {
    const el = await fixture<TestNodeList>(html`<test-node-list-events></test-node-list-events>`);

    let receivedId: string | undefined = 'initial';
    el.addEventListener('node-hover', ((e: CustomEvent) => {
      receivedId = e.detail.nodeId;
    }) as EventListener);

    el.triggerHoverEnd();
    expect(receivedId).toBeNull();
  });
});

/**
 * NodeActions Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphNodeActions } from './node-actions';
import './node-actions';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
};

describe('graph-node-actions', () => {
  it('should render', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    expect(el).to.exist;
  });

  it('should render action buttons', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.action-button');
    expect(buttons?.length).to.be.greaterThan(0);
  });

  it('should show "Show Dependencies" when not active', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    const button = el.shadowRoot?.querySelector('.dependency-button');
    expect(button?.textContent).to.include('Show Dependencies');
  });

  it('should show "Hide Dependencies" when focused', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode} view-mode="focused"></graph-node-actions>
    `);

    const button = el.shadowRoot?.querySelector('.dependency-button');
    expect(button?.textContent).to.include('Hide Dependencies');
  });

  it('should dispatch focus-node event', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    let eventDetail: { node: typeof mockNode } | undefined;
    el.addEventListener('focus-node', ((e: CustomEvent<{ node: typeof mockNode }>) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('.dependency-button') as HTMLButtonElement;
    button.click();

    expect(eventDetail).to.exist;
    expect(eventDetail?.node).to.deep.equal(mockNode);
  });

  it('should dispatch show-dependents event', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    let eventDetail: { node: typeof mockNode } | undefined;
    el.addEventListener('show-dependents', ((e: CustomEvent<{ node: typeof mockNode }>) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('.dependents-button') as HTMLButtonElement;
    button.click();

    expect(eventDetail).to.exist;
    expect(eventDetail?.node).to.deep.equal(mockNode);
  });
});

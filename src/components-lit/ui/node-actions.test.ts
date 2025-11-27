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

  it('should render both action buttons', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.action-button');
    expect(buttons?.length).to.equal(2);
  });

  it('should show "Show Dependency Chain" when not active', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    const button = el.shadowRoot?.querySelector('.dependency-button');
    expect(button?.textContent).to.include('Show Dependency Chain');
  });

  it('should show "Hide Dependency Chain" when focused', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode} view-mode="focused"></graph-node-actions>
    `);

    const button = el.shadowRoot?.querySelector('.dependency-button');
    expect(button?.textContent).to.include('Hide Dependency Chain');
  });

  it('should dispatch focus-node event', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    let eventDetail: any;
    el.addEventListener('focus-node', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('.dependency-button') as HTMLButtonElement;
    button.click();

    expect(eventDetail).to.exist;
    expect(eventDetail.node).to.deep.equal(mockNode);
  });

  it('should dispatch show-dependents event', async () => {
    const el = await fixture<GraphNodeActions>(html`
      <graph-node-actions .node=${mockNode}></graph-node-actions>
    `);

    let eventDetail: any;
    el.addEventListener('show-dependents', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('.dependents-button') as HTMLButtonElement;
    button.click();

    expect(eventDetail).to.exist;
    expect(eventDetail.node).to.deep.equal(mockNode);
  });
});

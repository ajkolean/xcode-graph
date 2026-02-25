/**
 * ListItemRow Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphListItemRow } from './list-item-row';
import './list-item-row';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
};

describe('graph-list-item-row', () => {
  it('should render node name', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row .node=${mockNode}></graph-list-item-row>
    `);

    const name = el.shadowRoot?.querySelector('.name');
    expect(name?.textContent).to.equal('TestNode');
  });

  it('should render subtitle when provided', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row
        .node=${mockNode}
        subtitle="Framework"
      ></graph-list-item-row>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).to.exist;
    expect(subtitle?.textContent).to.equal('Framework');
  });

  it('should not render subtitle when not provided', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row .node=${mockNode}></graph-list-item-row>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).to.not.exist;
  });

  it('should apply selected class when isSelected is true', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row
        .node=${mockNode}
        is-selected
      ></graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('selected')).to.be.true;
  });

  it('should dispatch row-select event on click', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row .node=${mockNode}></graph-list-item-row>
    `);

    let eventDetail: { node: typeof mockNode } | undefined;
    el.addEventListener('row-select', ((e: CustomEvent<{ node: typeof mockNode }>) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    expect(eventDetail).to.exist;
    expect(eventDetail?.node).to.deep.equal(mockNode);
  });

  it('should dispatch row-hover event on mouse enter', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row .node=${mockNode}></graph-list-item-row>
    `);

    let eventDetail: { nodeId: string } | undefined;
    el.addEventListener('row-hover', ((e: CustomEvent<{ nodeId: string }>) => {
      eventDetail = e.detail;
    }) as EventListener);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    const event = new MouseEvent('mouseenter', { bubbles: true });
    button.dispatchEvent(event);
    await el.updateComplete;

    expect(eventDetail).to.exist;
    expect(eventDetail?.nodeId).to.equal('test-node');
  });

  it('should dispatch row-hover-end event on mouse leave', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <graph-list-item-row .node=${mockNode}></graph-list-item-row>
    `);

    let eventFired = false;
    el.addEventListener('row-hover-end', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    const event = new MouseEvent('mouseleave', { bubbles: true });
    button.dispatchEvent(event);
    await el.updateComplete;

    expect(eventFired).to.be.true;
  });
});

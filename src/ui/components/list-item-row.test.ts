/**
 * ListItemRow Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphListItemRow } from './list-item-row';
import './list-item-row';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
};

describe('xcode-graph-list-item-row', () => {
  it('should render node name', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);

    const name = el.shadowRoot?.querySelector('.name');
    expect(name?.textContent).to.equal('TestNode');
  });

  it('should render subtitle when provided', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row
        .node=${mockNode}
        subtitle="Framework"
      ></xcode-graph-list-item-row>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).toBeDefined();
    expect(subtitle?.textContent).to.equal('Framework');
  });

  it('should not render subtitle when not provided', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).toBeNull();
  });

  it('should apply selected class when isSelected is true', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row
        .node=${mockNode}
        is-selected
      ></xcode-graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('selected')).toBe(true);
  });

  it('should dispatch row-select event on click', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = (await oneEvent(el, 'row-select')) as CustomEvent<{ node: typeof mockNode }>;

    expect(event).toBeDefined();
    expect(event.detail.node).to.deep.equal(mockNode);
  });

  it('should dispatch row-hover event on mouse enter', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    setTimeout(() => button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })));
    const event = (await oneEvent(el, 'row-hover')) as CustomEvent<{ nodeId: string }>;

    expect(event).toBeDefined();
    expect(event.detail.nodeId).to.equal('test-node');
  });

  it('should dispatch row-hover-end event on mouse leave', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    setTimeout(() => button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })));
    const event = await oneEvent(el, 'row-hover-end');

    expect(event).toBeDefined();
  });

  it('should render empty when no node is set', async () => {
    const el = await fixture<GraphListItemRow>(html`
      <xcode-graph-list-item-row></xcode-graph-list-item-row>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button).toBeNull();
  });
});

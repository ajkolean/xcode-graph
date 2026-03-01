/**
 * CollapsibleSection Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphCollapsibleSection } from './collapsible-section';
import './collapsible-section';

describe('xcode-graph-collapsible-section', () => {
  it('should render with title', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Filters"></xcode-graph-collapsible-section>
    `);

    expect(el).to.exist;
    const title = el.shadowRoot?.querySelector('.header-title');
    expect(title?.textContent).to.equal('Filters');
  });

  it('should be collapsed by default', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test">
        <div class="content-inner">Content</div>
      </xcode-graph-collapsible-section>
    `);

    expect(el.isExpanded).to.be.false;
    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.classList.contains('expanded')).to.be.false;
  });

  it('should expand when is-expanded is true', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test" is-expanded>
        <div>Content</div>
      </xcode-graph-collapsible-section>
    `);

    expect(el.isExpanded).to.be.true;
    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.classList.contains('expanded')).to.be.true;
  });

  it('should rotate chevron when expanded', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test" is-expanded></xcode-graph-collapsible-section>
    `);

    const chevron = el.shadowRoot?.querySelector('.chevron');
    expect(chevron?.classList.contains('expanded')).to.be.true;
  });

  it('should dispatch toggle event when header clicked', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test"></xcode-graph-collapsible-section>
    `);

    const button = el.shadowRoot?.querySelector('.header-button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'toggle');

    expect(event).to.exist;
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test">
        <span slot="icon">🔍</span>
      </xcode-graph-collapsible-section>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).to.exist;
  });
});

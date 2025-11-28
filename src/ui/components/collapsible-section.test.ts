/**
 * CollapsibleSection Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphCollapsibleSection } from './collapsible-section';
import './collapsible-section';

describe('graph-collapsible-section', () => {
  it('should render with title', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Filters"></graph-collapsible-section>
    `);

    expect(el).to.exist;
    const title = el.shadowRoot?.querySelector('.header-title');
    expect(title?.textContent).to.equal('Filters');
  });

  it('should be collapsed by default', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test">
        <div class="content-inner">Content</div>
      </graph-collapsible-section>
    `);

    expect(el.isExpanded).to.be.false;
    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.classList.contains('expanded')).to.be.false;
  });

  it('should expand when is-expanded is true', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test" is-expanded>
        <div>Content</div>
      </graph-collapsible-section>
    `);

    expect(el.isExpanded).to.be.true;
    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.classList.contains('expanded')).to.be.true;
  });

  it('should rotate chevron when expanded', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test" is-expanded></graph-collapsible-section>
    `);

    const chevron = el.shadowRoot?.querySelector('.chevron');
    expect(chevron?.classList.contains('expanded')).to.be.true;
  });

  it('should dispatch toggle event when header clicked', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test"></graph-collapsible-section>
    `);

    let eventFired = false;
    el.addEventListener('toggle', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('.header-button') as HTMLButtonElement;
    button.click();

    expect(eventFired).to.be.true;
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test">
        <span slot="icon">🔍</span>
      </graph-collapsible-section>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).to.exist;
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <graph-collapsible-section title="Test"></graph-collapsible-section>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-collapsible-section');
    expect(el.shadowRoot).to.exist;
  });
});

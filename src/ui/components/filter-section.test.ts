/**
 * FilterSection Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { FilterItem, GraphFilterSection } from './filter-section';
import './filter-section';

const sampleItems: FilterItem[] = [
  { key: 'framework', count: 5, color: '#8B5CF6' },
  { key: 'app', count: 2, color: '#F59E0B' },
  { key: 'library', count: 3, color: '#10B981' },
];

describe('xcode-graph-filter-section', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with required properties', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Product Types"
        filter-type="nodeType"
        .items=${sampleItems}
        .selectedItems=${new Set(['framework', 'app', 'library'])}
      ></xcode-graph-filter-section>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-filter-section');
  });

  it('should render title text', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Product Types"
        filter-type="nodeType"
        .items=${sampleItems}
        .selectedItems=${new Set<string>()}
      ></xcode-graph-filter-section>
    `);

    const title = el.shadowRoot?.querySelector('.header-title');
    expect(title?.textContent?.trim()).to.equal('Product Types');
  });

  // ========================================
  // Expand/Collapse Tests
  // ========================================

  it('should not show items when collapsed', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        .items=${sampleItems}
        .selectedItems=${new Set<string>()}
      ></xcode-graph-filter-section>
    `);

    const items = el.shadowRoot?.querySelector('.items');
    expect(items).to.not.exist;
  });

  it('should show items when expanded', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework', 'app', 'library'])}
      ></xcode-graph-filter-section>
    `);

    const items = el.shadowRoot?.querySelector('.items');
    expect(items).to.exist;
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch section-toggle event on header click', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        .items=${sampleItems}
        .selectedItems=${new Set<string>()}
      ></xcode-graph-filter-section>
    `);

    const headerButton = el.shadowRoot?.querySelector('.header-button') as HTMLButtonElement;
    setTimeout(() => headerButton.click());
    const event = await oneEvent(el, 'section-toggle');

    expect(event).to.exist;
  });

  it('should dispatch item-toggle event on item click', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework', 'app', 'library'])}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button') as HTMLButtonElement;
    setTimeout(() => itemButton.click());
    const event = await oneEvent(el, 'item-toggle');

    expect(event).to.exist;
    expect(event.detail.key).to.equal('framework');
  });

  // ========================================
  // Item Rendering Tests
  // ========================================

  it('should render correct number of items when expanded', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
      ></xcode-graph-filter-section>
    `);

    const itemButtons = el.shadowRoot?.querySelectorAll('.item-button');
    expect(itemButtons?.length).to.equal(3);
  });

  it('should show item count', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
      ></xcode-graph-filter-section>
    `);

    const counts = el.shadowRoot?.querySelectorAll('.item-count');
    expect(counts?.[0]?.textContent?.trim()).to.equal('5');
  });

  it('should mark deselected items with deselected class', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
      ></xcode-graph-filter-section>
    `);

    const itemButtons = el.shadowRoot?.querySelectorAll('.item-button');
    // First item (framework) is selected, others are deselected
    expect(itemButtons?.[0]?.classList.contains('deselected')).to.be.false;
    expect(itemButtons?.[1]?.classList.contains('deselected')).to.be.true;
  });

  it('should set aria-expanded on header button', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set<string>()}
      ></xcode-graph-filter-section>
    `);

    const headerButton = el.shadowRoot?.querySelector('.header-button');
    expect(headerButton?.getAttribute('aria-expanded')).to.equal('true');
  });
});

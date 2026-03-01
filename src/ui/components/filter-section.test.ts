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
    expect(items).to.exist;
    expect(items?.classList.contains('collapsed')).to.be.true;
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

  it('should render platform filter type icons', async () => {
    const platformItems: FilterItem[] = [{ key: 'iOS', count: 3, color: '#007AFF' }];
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Platforms"
        filter-type="platform"
        is-expanded
        .items=${platformItems}
        .selectedItems=${new Set(['iOS'])}
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button');
    expect(itemButton).to.exist;
  });

  it('should render project filter type with color swatch', async () => {
    const projectItems: FilterItem[] = [{ key: 'MyApp', count: 5, color: '#F59E0B' }];
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Projects"
        filter-type="project"
        is-expanded
        .items=${projectItems}
        .selectedItems=${new Set(['MyApp'])}
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button');
    expect(itemButton).to.exist;
  });

  it('should render package filter type with package icon', async () => {
    const packageItems: FilterItem[] = [{ key: 'swift-log', count: 1, color: '#10B981' }];
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Packages"
        filter-type="package"
        is-expanded
        .items=${packageItems}
        .selectedItems=${new Set(['swift-log'])}
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button');
    expect(itemButton).to.exist;
  });

  it('should dispatch preview-change with item on hover', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button') as HTMLButtonElement;
    setTimeout(() => itemButton.dispatchEvent(new MouseEvent('mouseenter')));
    const event = await oneEvent(el, 'preview-change');
    expect(event.detail).to.deep.equal({ type: 'nodeType', value: 'framework' });
  });

  it('should dispatch preview-change with null on mouseleave', async () => {
    const el = await fixture<GraphFilterSection>(html`
      <xcode-graph-filter-section
        title="Types"
        filter-type="nodeType"
        is-expanded
        .items=${sampleItems}
        .selectedItems=${new Set(['framework'])}
        .zoom=${1}
      ></xcode-graph-filter-section>
    `);

    const itemButton = el.shadowRoot?.querySelector('.item-button') as HTMLButtonElement;
    setTimeout(() => itemButton.dispatchEvent(new MouseEvent('mouseleave')));
    const event = await oneEvent(el, 'preview-change');
    expect(event.detail).to.be.null;
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

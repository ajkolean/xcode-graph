/**
 * FilterIcon Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphFilterIcon } from './filter-icon';
import './filter-icon';

describe('graph-filter-icon', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon></graph-filter-icon>
    `);

    expect(el).to.exist;
    expect(el.name).to.equal('product-types');
    expect(el.size).to.equal(18);
  });

  it('should render product-types icon', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon name="product-types"></graph-filter-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
    const rects = svg?.querySelectorAll('rect');
    expect(rects?.length).to.equal(4); // 4 squares for product types
  });

  it('should render platforms icon', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon name="platforms"></graph-filter-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
    const circles = svg?.querySelectorAll('circle');
    expect(circles?.length).to.equal(4); // 4 circles for platforms
  });

  it('should render projects icon', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon name="projects"></graph-filter-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
    const paths = svg?.querySelectorAll('path');
    expect(paths?.length).to.be.greaterThan(0);
  });

  it('should render packages icon', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon name="packages"></graph-filter-icon>
    `);

    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
    const polylines = svg?.querySelectorAll('polyline');
    expect(polylines?.length).to.equal(1);
  });

  it('should support size property', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon size="24"></graph-filter-icon>
    `);

    expect(el.size).to.equal(24);
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('width')).to.equal('24');
    expect(svg?.getAttribute('height')).to.equal('24');
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphFilterIcon>(html`
      <graph-filter-icon></graph-filter-icon>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-filter-icon');
    expect(el.shadowRoot).to.exist;
  });
});

/**
 * FilterIcon Lit Component Tests
 */
import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './filter-icon';
describe('xcode-graph-filter-icon', () => {
    it('should render with default properties', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon></xcode-graph-filter-icon>
    `);
        expect(el).to.exist;
        expect(el.name).to.equal('product-types');
        expect(el.size).to.equal(18);
    });
    it('should render product-types icon', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon name="product-types"></xcode-graph-filter-icon>
    `);
        const svg = el.shadowRoot?.querySelector('svg');
        expect(svg).to.exist;
        const rects = svg?.querySelectorAll('rect');
        expect(rects?.length).to.equal(4); // 4 squares for product types
    });
    it('should render platforms icon', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon name="platforms"></xcode-graph-filter-icon>
    `);
        const svg = el.shadowRoot?.querySelector('svg');
        expect(svg).to.exist;
        const circles = svg?.querySelectorAll('circle');
        expect(circles?.length).to.equal(4); // 4 circles for platforms
    });
    it('should render projects icon', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon name="projects"></xcode-graph-filter-icon>
    `);
        const svg = el.shadowRoot?.querySelector('svg');
        expect(svg).to.exist;
        const paths = svg?.querySelectorAll('path');
        expect(paths?.length).to.be.greaterThan(0);
    });
    it('should render packages icon', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon name="packages"></xcode-graph-filter-icon>
    `);
        const svg = el.shadowRoot?.querySelector('svg');
        expect(svg).to.exist;
        const polylines = svg?.querySelectorAll('polyline');
        expect(polylines?.length).to.equal(1);
    });
    it('should support size property', async () => {
        const el = await fixture(html `
      <xcode-graph-filter-icon size="24"></xcode-graph-filter-icon>
    `);
        expect(el.size).to.equal(24);
        const svg = el.shadowRoot?.querySelector('svg');
        expect(svg?.getAttribute('width')).to.equal('24');
        expect(svg?.getAttribute('height')).to.equal('24');
    });
});
//# sourceMappingURL=filter-icon.test.js.map
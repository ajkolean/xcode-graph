/**
 * SectionHeader Lit Component Tests
 */
import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './section-header';
describe('xcode-graph-section-header', () => {
    it('should render with title', async () => {
        const el = await fixture(html `
      <xcode-graph-section-header title="Dependencies"></xcode-graph-section-header>
    `);
        expect(el).to.exist;
        const title = el.shadowRoot?.querySelector('.title');
        expect(title?.textContent).to.equal('Dependencies');
    });
    it('should render count', async () => {
        const el = await fixture(html `
      <xcode-graph-section-header title="Test" count="5"></xcode-graph-section-header>
    `);
        const count = el.shadowRoot?.querySelector('.count');
        expect(count?.textContent).to.equal('5');
    });
    it('should render count with suffix', async () => {
        const el = await fixture(html `
      <xcode-graph-section-header title="Test" count="3" suffix="direct"></xcode-graph-section-header>
    `);
        const count = el.shadowRoot?.querySelector('.count');
        expect(count?.textContent).to.equal('3 direct');
    });
    it('should default count to 0', async () => {
        const el = await fixture(html `
      <xcode-graph-section-header title="Test"></xcode-graph-section-header>
    `);
        expect(el.count).to.equal(0);
        const count = el.shadowRoot?.querySelector('.count');
        expect(count?.textContent).to.equal('0');
    });
});
//# sourceMappingURL=section-header.test.js.map
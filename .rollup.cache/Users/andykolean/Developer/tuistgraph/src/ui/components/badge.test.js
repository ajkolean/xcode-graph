/**
 * Badge Lit Component Tests
 */
import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './badge';
describe('xcode-graph-badge', () => {
    // ========================================
    // Rendering Tests
    // ========================================
    it('should render with default properties', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test"></xcode-graph-badge>
    `);
        expect(el).to.exist;
        expect(el.tagName.toLowerCase()).to.equal('xcode-graph-badge');
    });
    it('should render label text', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Package"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.textContent?.trim()).to.equal('Package');
    });
    // ========================================
    // Property Tests
    // ========================================
    it('should default to pill variant', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test"></xcode-graph-badge>
    `);
        expect(el.variant).to.equal('pill');
    });
    it('should default to md size', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test"></xcode-graph-badge>
    `);
        expect(el.size).to.equal('md');
    });
    // ========================================
    // Variant Tests
    // ========================================
    it('should apply rounded variant class', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" variant="rounded"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('variant-rounded')).to.be.true;
    });
    it('should apply accent variant class', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" variant="accent"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('variant-accent')).to.be.true;
    });
    // ========================================
    // Size Tests
    // ========================================
    it('should apply sm size class', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" size="sm"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('size-sm')).to.be.true;
    });
    it('should apply md size class', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" size="md"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('size-md')).to.be.true;
    });
    // ========================================
    // Interactive & Glow Tests
    // ========================================
    it('should apply interactive class when interactive is true', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" interactive></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('interactive')).to.be.true;
    });
    it('should apply glow class when glow is true', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" glow></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains('glow')).to.be.true;
    });
    // ========================================
    // Dynamic Styling Tests
    // ========================================
    it('should apply color via CSS custom properties', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" color="#8B5CF6"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        const style = badge.getAttribute('style');
        expect(style).to.include('--badge-color: #8B5CF6');
        expect(style).to.include('--badge-bg: #8B5CF620');
        expect(style).to.include('--badge-border: #8B5CF640');
    });
    it('should use default color when not provided', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        const style = badge.getAttribute('style');
        // Default color is #8B5CF6
        expect(style).to.include('--badge-color: #8B5CF6');
    });
    it('should update styles when color changes', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" color="#FF0000"></xcode-graph-badge>
    `);
        let badge = el.shadowRoot?.querySelector('.badge');
        expect(badge.getAttribute('style')).to.include('#FF0000');
        el.color = '#00FF00';
        await el.updateComplete;
        badge = el.shadowRoot?.querySelector('.badge');
        expect(badge.getAttribute('style')).to.include('#00FF00');
    });
    // ========================================
    // Combined Configuration Tests
    // ========================================
    it('should support all options combined', async () => {
        const el = await fixture(html `
      <xcode-graph-badge
        label="Package"
        color="#10B981"
        variant="accent"
        size="sm"
        interactive
        glow
      ></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.textContent?.trim()).to.equal('Package');
        expect(badge?.classList.contains('variant-accent')).to.be.true;
        expect(badge?.classList.contains('size-sm')).to.be.true;
        expect(badge?.classList.contains('interactive')).to.be.true;
        expect(badge?.classList.contains('glow')).to.be.true;
    });
    // ========================================
    // Edge Cases
    // ========================================
    it('should handle different color formats', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label="Test" color="rgb(255, 0, 0)"></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge.getAttribute('style')).to.include('rgb(255, 0, 0)');
    });
    it('should handle empty label', async () => {
        const el = await fixture(html `
      <xcode-graph-badge label=""></xcode-graph-badge>
    `);
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.textContent?.trim()).to.equal('');
    });
});
//# sourceMappingURL=badge.test.js.map
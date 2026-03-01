/**
 * ClusterTypeBadge Lit Component Tests
 */
import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './cluster-type-badge';
describe('xcode-graph-cluster-type-badge', () => {
    // ========================================
    // Rendering Tests
    // ========================================
    it('should render with default properties', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge></xcode-graph-cluster-type-badge>
    `);
        expect(el).to.exist;
        expect(el.tagName.toLowerCase()).to.equal('xcode-graph-cluster-type-badge');
    });
    it('should render package badge', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge).to.exist;
        expect(badge.label).to.equal('Package');
    });
    it('should render project badge', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#10B981"
      ></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge).to.exist;
        expect(badge.label).to.equal('Project');
    });
    // ========================================
    // Property Tests
    // ========================================
    it('should update badge text when clusterType changes', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge.label).to.equal('Package');
        el.clusterType = 'project';
        await el.updateComplete;
        expect(badge.label).to.equal('Project');
    });
    // ========================================
    // Dynamic Styling Tests
    // ========================================
    it('should apply color to graph-badge', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge).to.exist;
        expect(badge.color).to.equal('#8B5CF6');
    });
    it('should update color when clusterColor changes', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#FF0000"
      ></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge.color).to.equal('#FF0000');
        el.clusterColor = '#00FF00';
        await el.updateComplete;
        expect(badge.color).to.equal('#00FF00');
    });
    it('should use default color when clusterColor is not provided', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        // Should use default orange color
        expect(badge.color).to.equal('#F59E0B');
    });
    // ========================================
    // Badge Configuration Tests
    // ========================================
    it('should configure graph-badge with accent variant', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge.variant).to.equal('accent');
        expect(badge.size).to.equal('sm');
        expect(badge.interactive).to.be.true;
        expect(badge.glow).to.be.true;
    });
    it('should handle different color formats', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="rgb(255, 0, 0)"
      ></xcode-graph-cluster-type-badge>
    `);
        const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
        expect(badge.color).to.equal('rgb(255, 0, 0)');
    });
});
//# sourceMappingURL=cluster-type-badge.test.js.map
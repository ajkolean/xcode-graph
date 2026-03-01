/**
 * ClusterHeader Lit Component Tests
 */
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './cluster-header';
describe('xcode-graph-cluster-header', () => {
    it('should render cluster name via panel-header', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="TestCluster"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        expect(panelHeader).to.exist;
        expect(panelHeader.title).to.equal('TestCluster');
    });
    it('should render external origin via panel-header subtitle', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
        is-external
      ></xcode-graph-cluster-header>
    `);
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        expect(panelHeader.subtitle).to.equal('External');
    });
    it('should render internal origin via panel-header subtitle', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        expect(panelHeader.subtitle).to.equal('Internal');
    });
    it('should dispatch back event on panel-header back', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);
        // The back event bubbles from panel-header
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        const button = panelHeader.shadowRoot?.querySelector('.back-button');
        setTimeout(() => button.click());
        const event = await oneEvent(el, 'back');
        expect(event).to.exist;
    });
    it('should pass color to panel-header', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#FF0000"
      ></xcode-graph-cluster-header>
    `);
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        expect(panelHeader.color).to.equal('#FF0000');
    });
    it('should use md title size for cluster headers', async () => {
        const el = await fixture(html `
      <xcode-graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-header>
    `);
        const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
        expect(panelHeader.titleSize).to.equal('md');
    });
});
//# sourceMappingURL=cluster-header.test.js.map
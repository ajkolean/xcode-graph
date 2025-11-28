/**
 * ClusterHeader Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClusterHeader } from './cluster-header';
import type { GraphPanelHeader } from './panel-header';
import './cluster-header';

describe('graph-cluster-header', () => {
  it('should render', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="MyCluster"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    expect(el).to.exist;
  });

  it('should render cluster name via panel-header', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="TestCluster"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    expect(panelHeader).to.exist;
    expect(panelHeader.title).to.equal('TestCluster');
  });

  it('should render external origin via panel-header subtitle', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
        is-external
      ></graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    expect(panelHeader.subtitle).to.equal('External');
  });

  it('should render internal origin via panel-header subtitle', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    expect(panelHeader.subtitle).to.equal('Internal');
  });

  it('should dispatch back event on panel-header back', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    let eventFired = false;
    el.addEventListener('back', () => {
      eventFired = true;
    });

    // The back event bubbles from panel-header
    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    const button = panelHeader.shadowRoot?.querySelector('.back-button') as HTMLButtonElement;
    button.click();

    expect(eventFired).to.be.true;
  });

  it('should pass color to panel-header', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#FF0000"
      ></graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    expect(panelHeader.color).to.equal('#FF0000');
  });

  it('should use md title size for cluster headers', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('graph-panel-header') as GraphPanelHeader;
    expect(panelHeader.titleSize).to.equal('md');
  });
});

/**
 * ClusterHeader Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClusterHeader } from './cluster-header';
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

  it('should render cluster name', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="TestCluster"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    const name = el.shadowRoot?.querySelector('.name');
    expect(name?.textContent).to.equal('TestCluster');
  });

  it('should render external origin', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
        is-external
      ></graph-cluster-header>
    `);

    const origin = el.shadowRoot?.querySelector('.origin');
    expect(origin?.textContent).to.equal('External');
  });

  it('should render internal origin', async () => {
    const el = await fixture<GraphClusterHeader>(html`
      <graph-cluster-header
        cluster-name="Test"
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-header>
    `);

    const origin = el.shadowRoot?.querySelector('.origin');
    expect(origin?.textContent).to.equal('Internal');
  });

  it('should dispatch back event on button click', async () => {
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

    const button = el.shadowRoot?.querySelector('.back-button') as HTMLButtonElement;
    button.click();

    expect(eventFired).to.be.true;
  });
});

/**
 * ClusterTypeBadge Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClusterTypeBadge } from './cluster-type-badge';
import './cluster-type-badge';

describe('graph-cluster-type-badge', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge></graph-cluster-type-badge>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-cluster-type-badge');
  });

  it('should render package badge', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge).to.exist;
    expect(badge?.textContent?.trim()).to.equal('Package');
  });

  it('should render project badge', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#10B981"
      ></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge).to.exist;
    expect(badge?.textContent?.trim()).to.equal('Project');
  });

  // ========================================
  // Property Tests
  // ========================================

  it('should accept clusterType property', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-type="package"></graph-cluster-type-badge>
    `);

    expect(el.clusterType).to.equal('package');
  });

  it('should accept clusterColor property', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-color="#FF0000"></graph-cluster-type-badge>
    `);

    expect(el.clusterColor).to.equal('#FF0000');
  });

  it('should update badge text when clusterType changes', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-type="package"></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.textContent?.trim()).to.equal('Package');

    el.clusterType = 'project';
    await el.updateComplete;

    expect(badge?.textContent?.trim()).to.equal('Project');
  });

  // ========================================
  // Dynamic Styling Tests
  // ========================================

  it('should apply color via CSS custom properties', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    expect(badge).to.exist;

    // Check that style attribute contains CSS custom properties
    const style = badge.getAttribute('style');
    expect(style).to.include('--badge-bg');
    expect(style).to.include('--badge-color');
    expect(style).to.include('#8B5CF6');
  });

  it('should update styles when clusterColor changes', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#FF0000"
      ></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    let style = badge.getAttribute('style');
    expect(style).to.include('#FF0000');

    el.clusterColor = '#00FF00';
    await el.updateComplete;

    style = badge.getAttribute('style');
    expect(style).to.include('#00FF00');
    expect(style).to.not.include('#FF0000');
  });

  it('should use default color when clusterColor is not provided', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-type="package"></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    const style = badge.getAttribute('style');

    // Should use default purple color
    expect(style).to.include('#8B5CF6');
  });

  // ========================================
  // Shadow DOM Tests
  // ========================================

  it('should render container in shadow DOM', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-type="package"></graph-cluster-type-badge>
    `);

    const container = el.shadowRoot?.querySelector('.container');
    expect(container).to.exist;
  });

  it('should render badge in shadow DOM', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge cluster-type="project"></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge).to.exist;
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('should handle different color formats', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="rgb(255, 0, 0)"
      ></graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    const style = badge.getAttribute('style');
    expect(style).to.include('rgb(255, 0, 0)');
  });
});

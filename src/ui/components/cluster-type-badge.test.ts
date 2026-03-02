/**
 * ClusterTypeBadge Lit Component Tests
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphBadge } from './badge';
import type { GraphClusterTypeBadge } from './cluster-type-badge';
import './cluster-type-badge';

describe('xcode-graph-cluster-type-badge', () => {
  it('should render package badge', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge).toBeDefined();
    expect(badge.label).to.equal('Package');
  });

  it('should render project badge', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#10B981"
      ></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge).toBeDefined();
    expect(badge.label).to.equal('Project');
  });

  it('should update badge text when clusterType changes', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge.label).to.equal('Package');

    el.clusterType = 'project';
    await el.updateComplete;

    expect(badge.label).to.equal('Project');
  });

  it('should apply color to graph-badge', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8B5CF6"
      ></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge).toBeDefined();
    expect(badge.color).to.equal('#8B5CF6');
  });

  it('should update color when clusterColor changes', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#FF0000"
      ></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge.color).to.equal('#FF0000');

    el.clusterColor = '#00FF00';
    await el.updateComplete;

    expect(badge.color).to.equal('#00FF00');
  });

  it('should use default color when clusterColor is not provided', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    // Should use default orange color
    expect(badge.color).to.equal('#F59E0B');
  });

  it('should configure graph-badge with accent variant', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge cluster-type="package"></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge.variant).to.equal('accent');
    expect(badge.size).to.equal('sm');
    expect(badge.interactive).toBe(true);
    expect(badge.glow).toBe(true);
  });

  it('should handle different color formats', async () => {
    const el = await fixture<GraphClusterTypeBadge>(html`
      <xcode-graph-cluster-type-badge
        cluster-type="package"
        cluster-color="rgb(255, 0, 0)"
      ></xcode-graph-cluster-type-badge>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge') as GraphBadge;
    expect(badge.color).to.equal('rgb(255, 0, 0)');
  });
});

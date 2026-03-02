/**
 * ClusterComposition Lit Component Tests
 */

import { fixture, html } from '@open-wc/testing';
import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import type { GraphClusterComposition } from './cluster-composition';
import './cluster-composition';

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'node-1',
    name: 'MyTarget',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    sourceCount: 50,
    resourceCount: 10,
    ...overrides,
  };
}

describe('xcode-graph-cluster-composition', () => {
  it('should render with nodes that have content', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${[makeNode()]}></xcode-graph-cluster-composition>
    `);

    expect(el).toBeDefined();
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-cluster-composition');
  });

  it('should render nothing when nodes have no sources or resources', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition
        .nodes=${[makeNode({ sourceCount: 0, resourceCount: 0 })]}
      ></xcode-graph-cluster-composition>
    `);

    const header = el.shadowRoot?.querySelector('.header');
    expect(header).toBeNull();
  });

  it('should render nothing when nodes array is empty', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${[]}></xcode-graph-cluster-composition>
    `);

    const header = el.shadowRoot?.querySelector('.header');
    expect(header).toBeNull();
  });

  it('should start collapsed by default', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${[makeNode()]}></xcode-graph-cluster-composition>
    `);

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeNull();
  });

  it('should start expanded when expanded attribute is set', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${[makeNode()]} expanded></xcode-graph-cluster-composition>
    `);

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  it('should toggle expansion on header click', async () => {
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${[makeNode()]}></xcode-graph-cluster-composition>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    header.click();
    await el.updateComplete;

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  it('should display total source files when expanded', async () => {
    const nodes = [makeNode({ sourceCount: 100 }), makeNode({ id: 'node-2', sourceCount: 50 })];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const statValues = el.shadowRoot?.querySelectorAll('.stat-value');
    expect(statValues?.[0]?.textContent?.trim()).to.equal('150');
  });

  it('should display total resources when expanded', async () => {
    const nodes = [makeNode({ resourceCount: 20 }), makeNode({ id: 'node-2', resourceCount: 30 })];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const statValues = el.shadowRoot?.querySelectorAll('.stat-value');
    expect(statValues?.[1]?.textContent?.trim()).to.equal('50');
  });

  it('should show privacy manifest badge when present', async () => {
    const nodes = [makeNode({ notableResources: ['PrivacyInfo.xcprivacy'] })];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const privacyBadge = el.shadowRoot?.querySelector('.resource-badge.privacy');
    expect(privacyBadge?.textContent?.trim()).to.equal('Privacy Manifest');
  });

  it('should show largest targets section when expanded', async () => {
    const nodes = [
      makeNode({ name: 'TargetA', sourceCount: 200 }),
      makeNode({ id: 'node-2', name: 'TargetB', sourceCount: 100 }),
    ];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const targetNames = el.shadowRoot?.querySelectorAll('.target-name');
    expect(targetNames?.length).to.equal(2);
    expect(targetNames?.[0]?.textContent?.trim()).to.equal('TargetA');
  });

  it('should exclude PrivacyInfo.xcprivacy from notable resources when hasPrivacyManifest is true', async () => {
    const nodes = [
      makeNode({
        notableResources: ['PrivacyInfo.xcprivacy', 'LaunchScreen.storyboard', 'Assets.xcassets'],
      }),
    ];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const resourceBadges = el.shadowRoot?.querySelectorAll('.resource-badge:not(.privacy)');
    const badgeTexts = Array.from(resourceBadges ?? []).map((b) => b.textContent?.trim());
    // PrivacyInfo.xcprivacy should be shown as "Privacy Manifest" badge (with .privacy class), not as a regular notable resource
    expect(badgeTexts).not.to.include('PrivacyInfo.xcprivacy');
    expect(badgeTexts).to.include('LaunchScreen.storyboard');
    expect(badgeTexts).to.include('Assets.xcassets');
    // Privacy manifest badge should be present
    const privacyBadge = el.shadowRoot?.querySelector('.resource-badge.privacy');
    expect(privacyBadge).toBeDefined();
  });

  it('should limit notable resources to 3 items', async () => {
    const nodes = [
      makeNode({
        notableResources: ['Res1.xib', 'Res2.xib', 'Res3.xib', 'Res4.xib', 'Res5.xib'],
      }),
    ];
    const el = await fixture<GraphClusterComposition>(html`
      <xcode-graph-cluster-composition .nodes=${nodes} expanded></xcode-graph-cluster-composition>
    `);

    const resourceBadges = el.shadowRoot?.querySelectorAll('.resource-badge:not(.privacy)');
    expect(resourceBadges?.length).to.equal(3);
  });
});

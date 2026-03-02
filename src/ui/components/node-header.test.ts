/**
 * NodeHeader Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import type { GraphNodeHeader } from './node-header';
import './node-header';

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'myframework',
    name: 'MyFramework',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'MyProject',
    ...overrides,
  };
}

describe('xcode-graph-node-header', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with a node', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode()} zoom="1"></xcode-graph-node-header>
    `);

    expect(el).toBeDefined();
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-node-header');
  });

  it('should render empty when node is not set', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header zoom="1"></xcode-graph-node-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
    expect(panelHeader).toBeNull();
  });

  it('should render panel header with node name', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode()} zoom="1"></xcode-graph-node-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
    expect(panelHeader?.getAttribute('title')).to.equal('MyFramework');
  });

  // ========================================
  // Badge Tests
  // ========================================

  it('should render node type badge', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode()} zoom="1"></xcode-graph-node-header>
    `);

    const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
    expect(badges?.length).to.be.greaterThan(0);
  });

  it('should render cluster badge for nodes with project', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode({ project: 'MyProject' })} zoom="1"></xcode-graph-node-header>
    `);

    const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
    // Should have at least Project badge and node type badge
    expect(badges?.length).to.be.greaterThanOrEqual(2);
  });

  it('should render Remote badge for remote nodes', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode({ isRemote: true })} zoom="1"></xcode-graph-node-header>
    `);

    const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
    const labels = Array.from(badges ?? []).map((b) => b.getAttribute('label'));
    expect(labels).to.include('Remote');
  });

  it('should render Foreign Build badge for foreign build nodes', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header
        .node=${makeNode({ foreignBuild: { script: 'make build', outputPath: '/build/output.xcframework', outputLinking: 'static', inputCount: 0, inputs: { files: [], folders: [], scripts: [] } } })}
        zoom="1"
      ></xcode-graph-node-header>
    `);

    const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
    const labels = Array.from(badges ?? []).map((b) => b.getAttribute('label'));
    expect(labels).to.include('Foreign Build');
  });

  // ========================================
  // Tags Tests
  // ========================================

  it('should render tags when node has tags', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header
        .node=${makeNode({ tags: ['feature', 'core'] })}
        zoom="1"
      ></xcode-graph-node-header>
    `);

    const tagsContainer = el.shadowRoot?.querySelector('.tags-container');
    expect(tagsContainer).toBeDefined();

    const tagBadges = el.shadowRoot?.querySelectorAll('xcode-graph-tag-badge');
    expect(tagBadges?.length).to.equal(2);
  });

  it('should not render tags container when node has no tags', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header .node=${makeNode()} zoom="1"></xcode-graph-node-header>
    `);

    const tagsContainer = el.shadowRoot?.querySelector('.tags-container');
    expect(tagsContainer).toBeNull();
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch cluster-click event when back is clicked and showClusterLink is true', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header
        .node=${makeNode({ project: 'MyProject' })}
        zoom="1"
        show-cluster-link
      ></xcode-graph-node-header>
    `);

    const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
    setTimeout(() => panelHeader?.dispatchEvent(new CustomEvent('back', { bubbles: true })));
    const event = await oneEvent(el, 'cluster-click');

    expect(event).toBeDefined();
    expect(event.detail.clusterId).to.equal('MyProject');
  });

  it('should dispatch close event when showClusterLink is false', async () => {
    const el = await fixture<GraphNodeHeader>(html`
      <xcode-graph-node-header
        .node=${makeNode({ project: undefined })}
        zoom="1"
      ></xcode-graph-node-header>
    `);

    el.showClusterLink = false;
    await el.updateComplete;

    const panelHeader = el.shadowRoot?.querySelector('xcode-graph-panel-header');
    setTimeout(() => panelHeader?.dispatchEvent(new CustomEvent('back', { bubbles: true })));
    const event = await oneEvent(el, 'close');

    expect(event).toBeDefined();
  });
});

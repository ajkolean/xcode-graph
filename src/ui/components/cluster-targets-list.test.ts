/**
 * ClusterTargetsList Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import type { GraphClusterTargetsList } from './cluster-targets-list';
import './cluster-targets-list';

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'node-1',
    name: 'MyTarget',
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    ...overrides,
  };
}

describe('xcode-graph-cluster-targets-list', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${{ framework: [makeNode()] }}
        .edges=${[]}
        filtered-targets-count="1"
        total-targets-count="1"
      ></xcode-graph-cluster-targets-list>
    `);

    expect(el).toBeDefined();
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-cluster-targets-list');
  });

  it('should render empty when nodesByType is not set', async () => {
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list></xcode-graph-cluster-targets-list>
    `);

    expect(el).toBeDefined();
  });

  it('should show target counts in header', async () => {
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${{ framework: [makeNode()] }}
        .edges=${[]}
        filtered-targets-count="3"
        total-targets-count="5"
      ></xcode-graph-cluster-targets-list>
    `);

    const mainTitle = el.shadowRoot?.querySelector('.main-title');
    expect(mainTitle?.textContent).to.include('3');
    expect(mainTitle?.textContent).to.include('5');
  });

  it('should start expanded by default', async () => {
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${{ framework: [makeNode()] }}
        .edges=${[]}
        filtered-targets-count="1"
        total-targets-count="1"
      ></xcode-graph-cluster-targets-list>
    `);

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  it('should collapse on header click', async () => {
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${{ framework: [makeNode()] }}
        .edges=${[]}
        filtered-targets-count="1"
        total-targets-count="1"
      ></xcode-graph-cluster-targets-list>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    header.click();
    await el.updateComplete;

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeNull();
  });

  it('should render type headers for each node type', async () => {
    const nodesByType = {
      framework: [makeNode()],
      app: [makeNode({ id: 'node-2', name: 'MyApp', type: NodeType.App })],
    };
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${nodesByType}
        .edges=${[]}
        filtered-targets-count="2"
        total-targets-count="2"
      ></xcode-graph-cluster-targets-list>
    `);

    const typeHeaders = el.shadowRoot?.querySelectorAll('.type-header');
    expect(typeHeaders?.length).to.equal(2);
  });

  it('should render list-item-row for each node', async () => {
    const nodesByType = {
      framework: [makeNode(), makeNode({ id: 'node-2', name: 'Another' })],
    };
    const el = await fixture<GraphClusterTargetsList>(html`
      <xcode-graph-cluster-targets-list
        .nodesByType=${nodesByType}
        .edges=${[]}
        filtered-targets-count="2"
        total-targets-count="2"
      ></xcode-graph-cluster-targets-list>
    `);

    const rows = el.shadowRoot?.querySelectorAll('xcode-graph-list-item-row');
    expect(rows?.length).to.equal(2);
  });
});

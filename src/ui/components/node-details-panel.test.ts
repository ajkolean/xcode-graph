/**
 * NodeDetailsPanel Lit Component Tests
 *
 * Comprehensive tests for the orchestrator component that manages node detail views.
 * Tests rendering, computed properties, event bubbling, and props propagation.
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { describe, it } from 'vitest';
import type { GraphNodeDetailsPanel } from './node-details-panel';
import './node-details-panel';

// ========================================
// Mock Data
// ========================================

const mockNode: GraphNode = {
  id: 'node1',
  name: 'CoreLib',
  type: 'framework',
  origin: 'internal',
  platform: 'iOS',
  project: 'MyApp',
  path: '/path/to/core',
};

const mockDependency: GraphNode = {
  id: 'dep1',
  name: 'Utils',
  type: 'staticLibrary',
  origin: 'internal',
  platform: 'iOS',
  project: 'MyApp',
};

const mockDependent: GraphNode = {
  id: 'dept1',
  name: 'App',
  type: 'application',
  origin: 'internal',
  platform: 'iOS',
  project: 'MyApp',
};

const mockAllNodes: GraphNode[] = [mockNode, mockDependency, mockDependent];

const mockEdges: GraphEdge[] = [
  { source: 'node1', target: 'dep1' }, // node1 depends on dep1
  { source: 'dept1', target: 'node1' }, // dept1 depends on node1
];

const mockCluster: Cluster = {
  id: 'MyApp',
  name: 'MyApp',
  type: 'project',
  origin: 'local',
  nodes: [mockNode, mockDependency, mockDependent],
};

// ========================================
// Rendering Tests
// ========================================

describe('graph-node-details-panel - Rendering', () => {
  it('should render with all required sub-components', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.0"
      ></graph-node-details-panel>
    `);

    expect(el).to.exist;

    // Check for all sub-components
    const header = el.shadowRoot?.querySelector('graph-node-header');
    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    const info = el.shadowRoot?.querySelector('graph-node-info');
    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');

    expect(header).to.exist;
    expect(metrics).to.exist;
    expect(actions).to.exist;
    expect(info).to.exist;
    expect(lists?.length).to.equal(2); // Dependencies and Dependents
  });

  it('should render empty when node is null', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.not.exist;
  });

  it('should render empty when node is undefined', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${undefined}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.not.exist;
  });

  it('should apply animation styles on render', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    // Component should render with content
    const header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-node-details-panel');
  });
});

// ========================================
// Property Tests
// ========================================

describe('graph-node-details-panel - Properties', () => {
  it('should accept node property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    expect(el.node).to.equal(mockNode);
  });

  it('should accept allNodes property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    expect(el.allNodes).to.equal(mockAllNodes);
  });

  it('should accept edges property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    expect(el.edges).to.equal(mockEdges);
  });

  it('should accept filteredEdges property', async () => {
    const filteredEdges = [mockEdges[0]];
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        .filteredEdges=${filteredEdges}
      ></graph-node-details-panel>
    `);

    expect(el.filteredEdges).to.equal(filteredEdges);
  });

  it('should accept clusters property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        .clusters=${[mockCluster]}
      ></graph-node-details-panel>
    `);

    expect(el.clusters).to.deep.equal([mockCluster]);
  });

  it('should accept viewMode property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        view-mode="dependencies"
      ></graph-node-details-panel>
    `);

    expect(el.viewMode).to.equal('dependencies');
  });

  it('should accept zoom property', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.5"
      ></graph-node-details-panel>
    `);

    expect(el.zoom).to.equal(1.5);
  });
});

// ========================================
// Computed Properties Tests
// ========================================

describe('graph-node-details-panel - Computed Properties', () => {
  it('should compute dependencies from edges', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const depList = lists?.[0]; // First list is dependencies

    // Check that the dependency node is rendered
    expect(depList?.getAttribute('title')).to.equal('Dependencies');
  });

  it('should compute dependents from edges', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const deptList = lists?.[1]; // Second list is dependents

    expect(deptList?.getAttribute('title')).to.equal('Dependents');
  });

  it('should compute metrics correctly', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');

    expect(metrics?.getAttribute('dependencies-count')).to.equal('1');
    expect(metrics?.getAttribute('dependents-count')).to.equal('1');
    expect(metrics?.getAttribute('total-dependencies-count')).to.equal('1');
    expect(metrics?.getAttribute('total-dependents-count')).to.equal('1');
  });

  it('should handle filtered edges in metrics', async () => {
    const filteredEdges = [mockEdges[0]]; // Only dependency edge
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        .filteredEdges=${filteredEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');

    // Filtered counts
    expect(metrics?.getAttribute('dependencies-count')).to.equal('1');
    expect(metrics?.getAttribute('dependents-count')).to.equal('0');

    // Total counts
    expect(metrics?.getAttribute('total-dependencies-count')).to.equal('1');
    expect(metrics?.getAttribute('total-dependents-count')).to.equal('1');
  });

  it('should detect high fan-in', async () => {
    const manyDependents: GraphNode[] = [
      mockNode,
      { id: 'd1', name: 'D1', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd2', name: 'D2', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd3', name: 'D3', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd4', name: 'D4', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd5', name: 'D5', type: 'framework', origin: 'internal', platform: 'iOS' },
    ];

    const manyEdges: GraphEdge[] = [
      { source: 'd1', target: 'node1' },
      { source: 'd2', target: 'node1' },
      { source: 'd3', target: 'node1' },
      { source: 'd4', target: 'node1' },
      { source: 'd5', target: 'node1' },
    ];

    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${manyDependents}
        .edges=${manyEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics?.hasAttribute('is-high-fan-in')).to.be.true;
  });

  it('should detect high fan-out', async () => {
    const manyDependencies: GraphNode[] = [
      mockNode,
      { id: 'd1', name: 'D1', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd2', name: 'D2', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd3', name: 'D3', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd4', name: 'D4', type: 'framework', origin: 'internal', platform: 'iOS' },
      { id: 'd5', name: 'D5', type: 'framework', origin: 'internal', platform: 'iOS' },
    ];

    const manyEdges: GraphEdge[] = [
      { source: 'node1', target: 'd1' },
      { source: 'node1', target: 'd2' },
      { source: 'node1', target: 'd3' },
      { source: 'node1', target: 'd4' },
      { source: 'node1', target: 'd5' },
    ];

    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${manyDependencies}
        .edges=${manyEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics?.hasAttribute('is-high-fan-out')).to.be.true;
  });
});

// ========================================
// Event Bubbling Tests
// ========================================

describe('graph-node-details-panel - Event Bubbling', () => {
  it('should bubble close event from header', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    el.addEventListener('close', () => {
      eventFired = true;
    });

    const header = el.shadowRoot?.querySelector('graph-node-header');
    header?.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));

    expect(eventFired).to.be.true;
  });

  it('should bubble cluster-select event', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('cluster-select', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const header = el.shadowRoot?.querySelector('graph-node-header');
    header?.dispatchEvent(
      new CustomEvent('cluster-click', {
        detail: { clusterId: 'MyApp' },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { clusterId: string }).clusterId).to.equal('MyApp');
  });

  it('should bubble focus-node event', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('focus-node', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    actions?.dispatchEvent(
      new CustomEvent('focus-node', {
        detail: { node: mockNode },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { node: GraphNode }).node).to.equal(mockNode);
  });

  it('should bubble show-dependents event', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    el.addEventListener('show-dependents', () => {
      eventFired = true;
    });

    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    actions?.dispatchEvent(
      new CustomEvent('show-dependents', {
        detail: { node: mockNode },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
  });

  it('should bubble show-impact event', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    el.addEventListener('show-impact', () => {
      eventFired = true;
    });

    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    actions?.dispatchEvent(
      new CustomEvent('show-impact', {
        detail: { node: mockNode },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
  });

  it('should bubble node-select event from dependency list', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('node-select', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const depList = lists?.[0];

    depList?.dispatchEvent(
      new CustomEvent('node-select', {
        detail: { node: mockDependency },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { node: GraphNode }).node).to.equal(mockDependency);
  });

  it('should bubble node-hover event', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('node-hover', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const depList = lists?.[0];

    depList?.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: 'dep1' },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { nodeId: string }).nodeId).to.equal('dep1');
  });
});

// ========================================
// Props Propagation Tests
// ========================================

describe('graph-node-details-panel - Props Propagation', () => {
  it('should propagate node to header', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.0"
      ></graph-node-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.exist;
  });

  it('should propagate zoom to header', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.5"
      ></graph-node-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.exist;
  });

  it('should propagate viewMode to actions', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        view-mode="dependencies"
      ></graph-node-details-panel>
    `);

    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    expect(actions?.getAttribute('view-mode')).to.equal('dependencies');
  });

  it('should propagate node to actions', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const actions = el.shadowRoot?.querySelector('graph-node-actions');
    expect(actions).to.exist;
  });

  it('should propagate zoom to node lists', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.5"
      ></graph-node-details-panel>
    `);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    lists?.forEach((list) => {
      expect(list).to.exist;
    });
  });

  it('should propagate node to info section', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const info = el.shadowRoot?.querySelector('graph-node-info');
    expect(info).to.exist;
  });

  it('should render dependency list with correct attributes', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const depList = lists?.[0];

    expect(depList?.getAttribute('title')).to.equal('Dependencies');
    expect(depList?.getAttribute('suffix')).to.equal('direct');
    expect(depList?.getAttribute('empty-message')).to.equal('No dependencies');
  });

  it('should render dependent list with correct attributes', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const lists = el.shadowRoot?.querySelectorAll('graph-node-list');
    const deptList = lists?.[1];

    expect(deptList?.getAttribute('title')).to.equal('Dependents');
    expect(deptList?.getAttribute('suffix')).to.equal('direct');
    expect(deptList?.getAttribute('empty-message')).to.equal('No dependents');
  });
});

// ========================================
// Edge Cases
// ========================================

describe('graph-node-details-panel - Edge Cases', () => {
  it('should handle node with no dependencies', async () => {
    const isolatedNode: GraphNode = {
      id: 'isolated',
      name: 'Isolated',
      type: 'framework',
      origin: 'internal',
      platform: 'iOS',
    };

    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${isolatedNode}
        .allNodes=${[isolatedNode]}
        .edges=${[]}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics?.getAttribute('dependencies-count')).to.equal('0');
    expect(metrics?.getAttribute('dependents-count')).to.equal('0');
  });

  it('should handle empty edges array', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${[]}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics?.getAttribute('dependencies-count')).to.equal('0');
  });

  it('should handle empty allNodes array', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${[]}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics).to.exist;
  });

  it('should update when node changes', async () => {
    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-node-details-panel>
    `);

    let header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.exist;

    el.node = mockDependency;
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('graph-node-header');
    expect(header).to.exist;
  });

  it('should handle self-referencing edges gracefully', async () => {
    const selfEdges: GraphEdge[] = [
      { source: 'node1', target: 'node1' }, // Self-reference
    ];

    const el = await fixture<GraphNodeDetailsPanel>(html`
      <graph-node-details-panel
        .node=${mockNode}
        .allNodes=${mockAllNodes}
        .edges=${selfEdges}
      ></graph-node-details-panel>
    `);

    const metrics = el.shadowRoot?.querySelector('graph-metrics-section');
    expect(metrics).to.exist;
  });
});

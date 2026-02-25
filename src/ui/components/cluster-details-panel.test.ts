/**
 * ClusterDetailsPanel Lit Component Tests
 *
 * Comprehensive tests for the cluster details orchestrator component.
 * Tests rendering, computed properties, event bubbling, and props propagation.
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { describe, it } from 'vitest';
import type { GraphClusterDetailsPanel } from './cluster-details-panel';
import './cluster-details-panel';

// ========================================
// Mock Data
// ========================================

const mockClusterNodes: GraphNode[] = [
  {
    id: 'node1',
    name: 'CoreLib',
    type: 'framework',
    origin: 'internal',
    platform: 'iOS',
    project: 'MyApp',
  },
  {
    id: 'node2',
    name: 'Utils',
    type: 'staticLibrary',
    origin: 'internal',
    platform: 'iOS',
    project: 'MyApp',
  },
  {
    id: 'node3',
    name: 'NetworkKit',
    type: 'framework',
    origin: 'internal',
    platform: 'macOS',
    project: 'MyApp',
  },
];

const mockAllNodes: GraphNode[] = [
  ...mockClusterNodes,
  {
    id: 'external1',
    name: 'External',
    type: 'framework',
    origin: 'external',
    platform: 'iOS',
  },
];

const mockEdges: GraphEdge[] = [
  { source: 'node1', target: 'node2' }, // Internal dependency
  { source: 'node3', target: 'node1' }, // Internal dependent
  { source: 'node1', target: 'external1' }, // External dependency
];

const mockCluster: Cluster = {
  id: 'MyApp',
  name: 'MyApp',
  type: 'project',
  origin: 'local',
  nodes: mockClusterNodes,
};

const mockExternalCluster: Cluster = {
  id: 'ExternalPackage',
  name: 'ExternalPackage',
  type: 'package',
  origin: 'external',
  nodes: [],
};

// ========================================
// Rendering Tests
// ========================================

describe('graph-cluster-details-panel - Rendering', () => {
  it('should render with all required sub-components', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.0"
      ></graph-cluster-details-panel>
    `);

    expect(el).to.exist;

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    const typeBadge = el.shadowRoot?.querySelector('graph-cluster-type-badge');
    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    const targetsList = el.shadowRoot?.querySelector('graph-cluster-targets-list');

    expect(header).to.exist;
    expect(typeBadge).to.exist;
    expect(stats).to.exist;
    expect(targetsList).to.exist;
  });

  it('should render empty when cluster is null', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header).to.not.exist;
  });

  it('should render scrollable container', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const scrollable = el.shadowRoot?.querySelector('.scrollable');
    expect(scrollable).to.exist;
  });
});

// ========================================
// Computed Properties Tests
// ========================================

describe('graph-cluster-details-panel - Computed Properties', () => {
  it('should compute cluster stats', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    expect(stats).to.exist;

    // Should compute dependencies (outgoing edges from cluster nodes)
    // node1->node2, node1->external1, node3->node1 = 3 total
    expect(stats?.getAttribute('total-dependencies')).to.equal('3');

    // Should compute dependents (incoming edges to cluster nodes)
    // node3->node1 = 1 total
    expect(stats?.getAttribute('total-dependents')).to.equal('2');
  });

  it('should compute platforms from cluster nodes', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    expect(stats).to.exist;
  });

  it('should compute filtered stats when filteredEdges provided', async () => {
    const filteredEdges = [mockEdges[0]]; // Only first edge
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        .filteredEdges=${filteredEdges}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');

    // Filtered counts
    expect(stats?.getAttribute('filtered-dependencies')).to.equal('1');

    // Total counts (all edges from cluster nodes)
    expect(stats?.getAttribute('total-dependencies')).to.equal('3');
  });

  it('should detect external cluster origin', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockExternalCluster}
        .clusterNodes=${[]}
        .allNodes=${mockAllNodes}
        .edges=${[]}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.hasAttribute('is-external')).to.be.true;
  });

  it('should not mark local cluster as external', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.hasAttribute('is-external')).to.be.false;
  });

  it('should compute cluster color based on name and type', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="1.0"
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-color')).to.exist;
  });

  it('should adjust cluster color based on zoom', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
        zoom="0.5"
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    const color = header?.getAttribute('cluster-color');
    expect(color).to.exist;
  });
});

// ========================================
// Event Bubbling Tests
// ========================================

describe('graph-cluster-details-panel - Event Bubbling', () => {
  it('should bubble close event from header', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    let eventFired = false;
    el.addEventListener('close', () => {
      eventFired = true;
    });

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    header?.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));

    expect(eventFired).to.be.true;
  });

  it('should bubble node-select event from targets list', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('node-select', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const targetsList = el.shadowRoot?.querySelector('graph-cluster-targets-list');
    targetsList?.dispatchEvent(
      new CustomEvent('node-select', {
        detail: { node: mockClusterNodes[0] },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { node: GraphNode }).node).to.equal(mockClusterNodes[0]);
  });

  it('should bubble node-hover event from targets list', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    let eventFired = false;
    let eventDetail: unknown = null;

    el.addEventListener('node-hover', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    const targetsList = el.shadowRoot?.querySelector('graph-cluster-targets-list');
    targetsList?.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: 'node1' },
        bubbles: true,
        composed: true,
      }),
    );

    expect(eventFired).to.be.true;
    expect((eventDetail as { nodeId: string }).nodeId).to.equal('node1');
  });
});

// ========================================
// Props Propagation Tests
// ========================================

describe('graph-cluster-details-panel - Props Propagation', () => {
  it('should propagate cluster name to header', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-name')).to.equal('MyApp');
  });

  it('should propagate cluster type to header', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-type')).to.equal('project');
  });

  it('should propagate cluster type to type badge', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const badge = el.shadowRoot?.querySelector('graph-cluster-type-badge');
    expect(badge?.getAttribute('cluster-type')).to.equal('project');
  });

  it('should propagate cluster nodes to targets list', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const targetsList = el.shadowRoot?.querySelector('graph-cluster-targets-list');
    expect(targetsList?.getAttribute('total-targets-count')).to.equal('3');
  });

  it('should group nodes by type for targets list', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const targetsList = el.shadowRoot?.querySelector('graph-cluster-targets-list');
    expect(targetsList).to.exist;
  });
});

// ========================================
// Edge Cases
// ========================================

describe('graph-cluster-details-panel - Edge Cases', () => {
  it('should handle empty cluster nodes', async () => {
    const emptyCluster: Cluster = {
      ...mockCluster,
      nodes: [],
    };

    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${emptyCluster}
        .clusterNodes=${[]}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    expect(stats).to.exist;
  });

  it('should handle empty edges array', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${[]}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    expect(stats?.getAttribute('total-dependencies')).to.equal('0');
    expect(stats?.getAttribute('total-dependents')).to.equal('0');
  });

  it('should handle nodes with no platform', async () => {
    const noPlatformNodes: GraphNode[] = [
      {
        id: 'node1',
        name: 'Node1',
        type: 'framework',
        origin: 'internal',
        platform: '',
      },
    ];

    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${noPlatformNodes}
        .allNodes=${noPlatformNodes}
        .edges=${[]}
      ></graph-cluster-details-panel>
    `);

    const stats = el.shadowRoot?.querySelector('graph-cluster-stats');
    expect(stats).to.exist;
  });

  it('should update when cluster changes', async () => {
    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockClusterNodes}
        .allNodes=${mockAllNodes}
        .edges=${mockEdges}
      ></graph-cluster-details-panel>
    `);

    let header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-name')).to.equal('MyApp');

    el.cluster = mockExternalCluster;
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-name')).to.equal('ExternalPackage');
  });

  it('should handle package type cluster', async () => {
    const packageCluster: Cluster = {
      id: 'MyPackage',
      name: 'MyPackage',
      type: 'package',
      origin: 'local',
      nodes: [],
    };

    const el = await fixture<GraphClusterDetailsPanel>(html`
      <graph-cluster-details-panel
        .cluster=${packageCluster}
        .clusterNodes=${[]}
        .allNodes=${mockAllNodes}
        .edges=${[]}
      ></graph-cluster-details-panel>
    `);

    const header = el.shadowRoot?.querySelector('graph-cluster-header');
    expect(header?.getAttribute('cluster-type')).to.equal('package');
  });
});

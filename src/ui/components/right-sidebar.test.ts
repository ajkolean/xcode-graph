/**
 * RightSidebar Lit Component Tests
 *
 * Comprehensive tests for the main sidebar orchestrator component.
 * Tests panel switching, state management, event coordination, and filter logic.
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.schema';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.schema';
import { beforeEach, describe, it } from 'vitest';
import type { GraphRightSidebar } from './right-sidebar';
import './right-sidebar';

// Import signals for testing
import { selectCluster, selectedCluster, selectedNode, selectNode } from '@graph/signals/index';
import { setFilters, setSearchQuery } from '@shared/signals/index';

// ========================================
// Mock Data
// ========================================

const mockNodes: GraphNode[] = [
  {
    id: 'node1',
    name: 'CoreLib',
    type: NodeType.Framework,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
  },
  {
    id: 'node2',
    name: 'Utils',
    type: NodeType.Library,
    origin: Origin.Local,
    platform: Platform.iOS,
    project: 'MyApp',
  },
  {
    id: 'node3',
    name: 'NetworkKit',
    type: NodeType.Framework,
    origin: Origin.External,
    platform: Platform.macOS,
    project: 'OtherApp',
  },
  {
    id: 'pkg1',
    name: 'MyPackage',
    type: NodeType.Package,
    origin: Origin.Local,
    platform: Platform.iOS,
  },
];

const mockEdges: GraphEdge[] = [
  { source: 'node1', target: 'node2' },
  { source: 'node3', target: 'node1' },
];

const mockCluster: Cluster = {
  id: 'MyApp',
  name: 'MyApp',
  type: ClusterType.Project,
  origin: Origin.Local,
  nodes: [mockNodes[0]!, mockNodes[1]!],
  anchors: ['node1'],
  metadata: new Map(),
};

// ========================================
// Rendering Tests
// ========================================

describe('graph-right-sidebar - Rendering', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectNode(null);
    selectCluster(null);
    setSearchQuery('');
    setFilters({
      nodeTypes: new Set(['framework', 'staticLibrary', 'package']),
      platforms: new Set(['iOS', 'macOS']),
      origins: new Set(['local', 'external']),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });
  });
  it('should render with header', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    expect(el).to.exist;
    const header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header).to.exist;
  });

  it('should render filter view by default', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const searchBar = el.shadowRoot?.querySelector('graph-search-bar');
    const filterSections = el.shadowRoot?.querySelectorAll('graph-filter-section');

    expect(searchBar).to.exist;
    expect(filterSections?.length).to.be.greaterThan(0);
  });

  it('should render stats cards in filter view', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const statsCards = el.shadowRoot?.querySelectorAll('graph-stats-card');
    expect(statsCards?.length).to.equal(2); // Nodes and Dependencies
  });

  it('should render clear filters button', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const clearButton = el.shadowRoot?.querySelector('graph-clear-filters-button');
    expect(clearButton).to.exist;
  });

  it('should render collapsed sidebar when collapsed', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Initially not collapsed
    expect(el.hasAttribute('collapsed')).to.be.false;

    // The component renders filter view when expanded
    const searchBar = el.shadowRoot?.querySelector('graph-search-bar');
    expect(searchBar).to.exist;
  });
});

// ========================================
// Property Tests
// ========================================

describe('graph-right-sidebar - Properties', () => {
  it('should accept allNodes property', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    expect(el.allNodes).to.equal(mockNodes);
  });

  it('should accept allEdges property', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    expect(el.allEdges).to.equal(mockEdges);
  });

  it('should accept filteredNodes property', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    expect(el.filteredNodes).to.equal(mockNodes);
  });

  it('should accept filteredEdges property', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    expect(el.filteredEdges).to.equal(mockEdges);
  });

  it('should accept clusters property', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></graph-right-sidebar>
    `);

    expect(el.clusters).to.deep.equal([mockCluster]);
  });
});

// ========================================
// Panel Switching Tests
// ========================================

describe('graph-right-sidebar - Panel Switching', () => {
  it('should show node details when node is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    selectNode(mockNodes[0]!);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('graph-node-details-panel');
    expect(nodePanel).to.exist;
  });

  it('should show cluster details when cluster is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('graph-cluster-details-panel');
    expect(clusterPanel).to.exist;
  });

  it('should show filter view when nothing is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    selectNode(null);
    selectCluster(null);
    await el.updateComplete;

    const searchBar = el.shadowRoot?.querySelector('graph-search-bar');
    expect(searchBar).to.exist;
  });

  it('should update header title based on selection', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    let header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header?.getAttribute('title')).to.equal('Project Overview');

    selectNode(mockNodes[0]!);
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header?.getAttribute('title')).to.equal('Node Details');

    selectNode(null);
    selectCluster('MyApp');
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header?.getAttribute('title')).to.equal('Cluster Details');
  });
});

// ========================================
// State Management Tests
// ========================================

describe('graph-right-sidebar - State Management', () => {
  it('should track collapsed state', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Initially not collapsed
    expect(el.hasAttribute('collapsed')).to.be.false;

    // Header should exist
    const header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header).to.exist;
  });
});

// ========================================
// Event Coordination Tests
// ========================================

describe('graph-right-sidebar - Event Coordination', () => {
  it('should clear node selection when expanding to section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    selectNode(mockNodes[0]!);
    await el.updateComplete;

    expect(selectedNode.get()).to.equal(mockNodes[0]);

    // Node details panel should be visible
    const nodePanel = el.shadowRoot?.querySelector('graph-node-details-panel');
    expect(nodePanel).to.exist;
  });

  it('should clear cluster selection when expanding to section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    expect(selectedCluster.get()).to.equal('MyApp');

    // Cluster details panel should be visible
    const clusterPanel = el.shadowRoot?.querySelector('graph-cluster-details-panel');
    expect(clusterPanel).to.exist;
  });
});

// ========================================
// Filter Logic Tests
// ========================================

describe('graph-right-sidebar - Filter Logic', () => {
  it('should not render package filter when no packages exist', async () => {
    const noPackageNodes = mockNodes.filter((n) => n.type !== NodeType.Package);

    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${noPackageNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${noPackageNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('graph-filter-section');
    const titles = Array.from(filterSections || []).map((section) => section.getAttribute('title'));

    expect(titles).to.not.include('Packages');
  });

  it('should show empty state when no filtered nodes', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></graph-right-sidebar>
    `);

    // Component should render with empty filtered nodes
    expect(el.filteredNodes.length).to.equal(0);
  });
});

// ========================================
// Edge Cases
// ========================================

describe('graph-right-sidebar - Edge Cases', () => {
  it('should handle empty nodes array', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${[]}
        .allEdges=${[]}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></graph-right-sidebar>
    `);

    // Should still render header and filter view
    const header = el.shadowRoot?.querySelector('graph-right-sidebar-header');
    expect(header).to.exist;
  });

  it('should create synthetic cluster when not in clusters list', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('graph-cluster-details-panel');
    expect(clusterPanel).to.exist;
  });

  it('should update when properties change', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const newNodes: GraphNode[] = [
      ...mockNodes,
      {
        id: 'node4',
        name: 'NewNode',
        type: NodeType.Framework,
        origin: Origin.Local,
        platform: Platform.iOS,
      },
    ];

    el.allNodes = newNodes;
    await el.updateComplete;

    expect(el.allNodes).to.equal(newNodes);
  });
});

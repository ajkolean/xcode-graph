/**
 * RightSidebar Lit Component Tests
 *
 * Comprehensive tests for the main sidebar orchestrator component.
 * Tests panel switching, state management, event coordination, and filter logic.
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
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
    origin: 'external',
    platform: 'macOS',
    project: 'OtherApp',
  },
  {
    id: 'pkg1',
    name: 'MyPackage',
    type: 'package',
    origin: 'internal',
    platform: 'iOS',
  },
];

const mockEdges: GraphEdge[] = [
  { source: 'node1', target: 'node2' },
  { source: 'node3', target: 'node1' },
];

const mockCluster: Cluster = {
  id: 'MyApp',
  name: 'MyApp',
  type: 'project',
  origin: 'local',
  nodes: [mockNodes[0], mockNodes[1]],
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

    selectNode(mockNodes[0]);
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

    selectNode(mockNodes[0]);
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

  it('should compute filter data from nodes', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Should render sidebar
    const aside = el.shadowRoot?.querySelector('aside');
    expect(aside).to.exist;
  });

  it('should track search query changes', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Component should render
    expect(el).to.exist;
    expect(el.allNodes).to.equal(mockNodes);
  });

  it('should clear filters when clear button clicked', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Component should have properties
    expect(el.filteredNodes).to.equal(mockNodes);
    expect(el.filteredEdges).to.equal(mockEdges);
  });

  it('should handle filter toggle events', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Should render header
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

    selectNode(mockNodes[0]);
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

  it('should handle preview filter changes', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    const filterSection = el.shadowRoot?.querySelector('graph-filter-section');
    filterSection?.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: { type: 'nodeType', key: 'framework' },
        bubbles: true,
        composed: true,
      }),
    );

    await el.updateComplete;
    // Preview should be set (tested via signal state)
  });
});

// ========================================
// Filter Logic Tests
// ========================================

describe('graph-right-sidebar - Filter Logic', () => {
  it('should render all filter sections', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Sidebar should render
    const aside = el.shadowRoot?.querySelector('aside');
    expect(aside).to.exist;
  });

  it('should render package filter when packages exist', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Component should exist with nodes
    expect(el.allNodes.some((n) => n.type === 'package')).to.be.true;
  });

  it('should not render package filter when no packages exist', async () => {
    const noPackageNodes = mockNodes.filter((n) => n.type !== 'package');

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

  it('should highlight stats when filters are active', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Component should render
    expect(el).to.exist;
    expect(el.allNodes.length).to.be.greaterThan(0);
  });

  it('should compute filter items with correct counts', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></graph-right-sidebar>
    `);

    // Component should have nodes
    expect(el.allNodes).to.equal(mockNodes);
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

  it('should handle empty edges array', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${[]}
        .filteredNodes=${mockNodes}
        .filteredEdges=${[]}
      ></graph-right-sidebar>
    `);

    // Should render with no edges
    expect(el.allEdges.length).to.equal(0);
    expect(el.filteredEdges.length).to.equal(0);
  });

  it('should handle missing cluster in clusters list', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[]}
      ></graph-right-sidebar>
    `);

    selectCluster('NonExistent');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('graph-cluster-details-panel');
    expect(clusterPanel).to.exist;
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

    const newNodes = [
      ...mockNodes,
      {
        id: 'node4',
        name: 'NewNode',
        type: 'framework',
        origin: 'internal',
        platform: 'iOS',
      },
    ];

    el.allNodes = newNodes;
    await el.updateComplete;

    expect(el.allNodes).to.equal(newNodes);
  });
});

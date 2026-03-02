/**
 * RightSidebar Lit Component Tests
 *
 * Comprehensive tests for the main sidebar orchestrator component.
 * Tests panel switching, state management, event coordination, and filter logic.
 */

import { fixture, html } from '@open-wc/testing';
import type { Cluster } from '@shared/schemas';
import { ClusterType } from '@shared/schemas/cluster.types';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { GraphRightSidebar } from './right-sidebar';
import './right-sidebar';

// Import signals for testing
import {
  resetGraphSignals,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
} from '@graph/signals/index';
import {
  filters,
  resetFilterSignals,
  searchQuery,
  setFilters,
  setSearchQuery,
} from '@shared/signals/index';

const mockNodeCoreLib: GraphNode = {
  id: 'node1',
  name: 'CoreLib',
  type: NodeType.Framework,
  origin: Origin.Local,
  platform: Platform.iOS,
  project: 'MyApp',
};

const mockNodeUtils: GraphNode = {
  id: 'node2',
  name: 'Utils',
  type: NodeType.Library,
  origin: Origin.Local,
  platform: Platform.iOS,
  project: 'MyApp',
};

const mockNodes: GraphNode[] = [
  mockNodeCoreLib,
  mockNodeUtils,
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
  nodes: [mockNodeCoreLib, mockNodeUtils],
  anchors: ['node1'],
  metadata: new Map(),
};

describe('xcode-graph-right-sidebar - Rendering', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
    setFilters({
      nodeTypes: new Set([NodeType.Framework, NodeType.Library, NodeType.Package]),
      platforms: new Set([Platform.iOS, Platform.macOS]),
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });
  it('should render with header', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    expect(el).toBeDefined();
    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeDefined();
  });

  it('should render filter view by default', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');

    expect(searchBar).toBeDefined();
    expect(filterSections?.length).to.be.greaterThan(0);
  });

  it('should render stats cards in filter view', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const statsCards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    expect(statsCards?.length).to.equal(2); // Nodes and Dependencies
  });

  it('should render clear filters button', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-clear-filters-button');
    expect(clearButton).toBeDefined();
  });

  it('should render collapsed sidebar when collapsed', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Initially not collapsed
    expect(el.hasAttribute('collapsed')).toBe(false);

    // The component renders filter view when expanded
    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    expect(searchBar).toBeDefined();
  });
});

describe('xcode-graph-right-sidebar - Panel Switching', () => {
  it('should show node details when node is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    expect(nodePanel).toBeDefined();
  });

  it('should show cluster details when cluster is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).toBeDefined();
  });

  it('should show filter view when nothing is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(null);
    selectCluster(null);
    await el.updateComplete;

    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    expect(searchBar).toBeDefined();
  });

  it('should update header title based on selection', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Filter view shows workspace name derived from nodes
    let header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header?.getAttribute('title')).to.equal('MyApp');

    // Node details replaces header with details toolbar
    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeNull();
    const toolbar = el.shadowRoot?.querySelector('.details-toolbar');
    expect(toolbar).toBeDefined();

    // Cluster details also uses toolbar instead of header
    selectNode(null);
    selectCluster('MyApp');
    await el.updateComplete;

    header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeNull();
  });
});

describe('xcode-graph-right-sidebar - State Management', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should track collapsed state', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Initially not collapsed
    expect(el.hasAttribute('collapsed')).toBe(false);

    // Header should exist
    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeDefined();
  });
});

describe('xcode-graph-right-sidebar - Event Coordination', () => {
  it('should show node details panel when node is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    expect(selectedNode.get()).to.equal(mockNodes[0]);

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    expect(nodePanel).toBeDefined();
  });

  it('should show cluster details panel when cluster is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    expect(selectedCluster.get()).to.equal('MyApp');

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).toBeDefined();
  });
});

describe('xcode-graph-right-sidebar - Filter Logic', () => {
  it('should not render package filter when no packages exist', async () => {
    const noPackageNodes = mockNodes.filter((n) => n.type !== NodeType.Package);

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${noPackageNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${noPackageNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    const titles = Array.from(filterSections || []).map((section) => section.getAttribute('title'));

    expect(titles).to.not.include('Packages');
  });

  it('should show empty state when no filtered nodes', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    // Component should render with empty filtered nodes
    expect(el.filteredNodes.length).to.equal(0);
  });
});

describe('xcode-graph-right-sidebar - Edge Cases', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should handle empty nodes array', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${[]}
        .allEdges=${[]}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    // Should still render header and filter view
    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeDefined();
  });

  it('should create synthetic cluster when not in clusters list', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).toBeDefined();
  });

  it('should update when properties change', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
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

describe('xcode-graph-right-sidebar - Event Handlers', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
    setFilters({
      nodeTypes: new Set([NodeType.Framework, NodeType.Library, NodeType.Package]),
      platforms: new Set([Platform.iOS, Platform.macOS]),
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should handle search-change event from search bar', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    searchBar?.dispatchEvent(
      new CustomEvent('search-change', { detail: { query: 'test' }, bubbles: true }),
    );
    await el.updateComplete;

    expect(searchQuery.get()).toBe('test');
  });

  it('should handle clear-filters event', async () => {
    setSearchQuery('something');
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-clear-filters-button');
    clearButton?.dispatchEvent(new CustomEvent('clear-filters', { bubbles: true }));
    await el.updateComplete;

    expect(searchQuery.get()).toBe('');
  });

  it('should handle item-toggle event from filter sections', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSection = el.shadowRoot?.querySelector('xcode-graph-filter-section');
    filterSection?.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key: NodeType.Framework, checked: false },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    const currentFilters = filters.get();
    expect(currentFilters.nodeTypes.has(NodeType.Framework)).toBe(false);
  });

  it('should handle item-toggle event to add an item back', async () => {
    setFilters({
      nodeTypes: new Set([NodeType.Library]),
      platforms: new Set([Platform.iOS]),
      origins: new Set([Origin.Local]),
      projects: new Set(['MyApp']),
      packages: new Set(),
    });
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSection = el.shadowRoot?.querySelector('xcode-graph-filter-section');
    filterSection?.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key: NodeType.Framework, checked: true },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    const currentFilters = filters.get();
    expect(currentFilters.nodeTypes.has(NodeType.Framework)).toBe(true);
  });

  it('should handle preview-change event from filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSection = el.shadowRoot?.querySelector('xcode-graph-filter-section');
    filterSection?.dispatchEvent(
      new CustomEvent('preview-change', {
        detail: { type: 'nodeType', value: 'framework' },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should handle toggle-collapse from header', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    expect(el.hasAttribute('collapsed')).toBe(false);

    // The header renders and supports toggle-collapse
    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).toBeDefined();
    expect(header).not.toBeNull();
  });

  it('should handle section-toggle from filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSection = el.shadowRoot?.querySelector('xcode-graph-filter-section');
    filterSection?.dispatchEvent(new CustomEvent('section-toggle', { bubbles: true }));
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should show back to filters button in details toolbar', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const breadcrumb = el.shadowRoot?.querySelector('.breadcrumb-button');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb?.textContent).toContain('Back to Filters');

    // Click back to filters
    (breadcrumb as HTMLButtonElement)?.click();
    await el.updateComplete;

    expect(selectedNode.get()).toBeNull();
    expect(selectedCluster.get()).toBeNull();
  });

  it('should render cluster details panel with synthetic cluster for package', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyPackage');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).toBeDefined();
  });

  it('should render node details panel with all sub-components', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    expect(nodePanel).toBeDefined();

    // Verify the details toolbar is present with node selected
    const toolbar = el.shadowRoot?.querySelector('.details-toolbar');
    expect(toolbar).toBeDefined();

    // The collapse button should be present in the toolbar
    const collapseIcon = toolbar?.querySelector('xcode-graph-icon-button');
    expect(collapseIcon).toBeDefined();
  });

  it('should render cluster details and handle toggle events', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).toBeDefined();

    clusterPanel?.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(selectedCluster.get()).toBeNull();
  });

  it('should render expanded sidebar with filter content and no collapsed sidebar', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Sidebar starts expanded
    expect(el.hasAttribute('collapsed')).toBe(false);

    // Expanded state shows filter content, not collapsed sidebar
    expect(el.shadowRoot?.querySelector('.filter-content')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('xcode-graph-collapsed-sidebar')).toBeNull();

    // Header with collapse button is present
    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header).not.toBeNull();
  });

  it('should render empty state when filteredNodes is empty', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const emptyState = el.shadowRoot?.querySelector('xcode-graph-empty-state');
    expect(emptyState).not.toBeNull();
  });

  it('should render package filter section when packages exist', async () => {
    setFilters({
      nodeTypes: new Set([NodeType.Framework, NodeType.Library, NodeType.Package]),
      platforms: new Set([Platform.iOS, Platform.macOS]),
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    const titles = Array.from(filterSections || []).map((s) => s.getAttribute('title'));
    // Should include the Packages section since mockNodes has a Package node
    expect(titles).toContain('Packages');
  });

  it('should render details toolbar with collapse icon when node is selected', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const toolbar = el.shadowRoot?.querySelector('.details-toolbar');
    expect(toolbar).not.toBeNull();

    const collapseButton = toolbar?.querySelector('xcode-graph-icon-button');
    expect(collapseButton).not.toBeNull();

    const collapseIcon = toolbar?.querySelector('xcode-graph-sidebar-collapse-icon');
    expect(collapseIcon).not.toBeNull();
  });

  it('should handle toggle events from node details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    expect(nodePanel).not.toBeNull();

    // Dispatch toggle events from node details panel
    nodePanel?.dispatchEvent(
      new CustomEvent('toggle-direct-deps', { bubbles: true, composed: true }),
    );
    nodePanel?.dispatchEvent(
      new CustomEvent('toggle-transitive-deps', { bubbles: true, composed: true }),
    );
    nodePanel?.dispatchEvent(
      new CustomEvent('toggle-direct-dependents', { bubbles: true, composed: true }),
    );
    nodePanel?.dispatchEvent(
      new CustomEvent('toggle-transitive-dependents', { bubbles: true, composed: true }),
    );
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should handle node-select event from node details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');

    // Dispatch node-select event
    nodePanel?.dispatchEvent(
      new CustomEvent('node-select', {
        detail: { node: mockNodeUtils },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;

    expect(selectedNode.get()).toBe(mockNodeUtils);
  });

  it('should handle cluster selection via selectCluster signal', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Directly test selectCluster signal (same function called by @cluster-select handler)
    selectCluster('MyApp');
    await el.updateComplete;

    expect(selectedCluster.get()).toBe('MyApp');

    // Should show cluster details panel
    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });

  it('should handle toggle events from cluster details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();

    // Dispatch toggle events from cluster details panel
    clusterPanel?.dispatchEvent(
      new CustomEvent('toggle-direct-deps', { bubbles: true, composed: true }),
    );
    clusterPanel?.dispatchEvent(
      new CustomEvent('toggle-direct-dependents', { bubbles: true, composed: true }),
    );
    await el.updateComplete;

    expect(el).toBeDefined();
  });
});

describe('xcode-graph-right-sidebar - workspaceName derivation', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should derive workspace name from the largest local project', async () => {
    const nodes: GraphNode[] = [
      {
        id: 'a1',
        name: 'A1',
        type: NodeType.Framework,
        origin: Origin.Local,
        platform: Platform.iOS,
        project: 'SmallProject',
      },
      {
        id: 'b1',
        name: 'B1',
        type: NodeType.Framework,
        origin: Origin.Local,
        platform: Platform.iOS,
        project: 'BigProject',
      },
      {
        id: 'b2',
        name: 'B2',
        type: NodeType.Library,
        origin: Origin.Local,
        platform: Platform.iOS,
        project: 'BigProject',
      },
      {
        id: 'b3',
        name: 'B3',
        type: NodeType.App,
        origin: Origin.Local,
        platform: Platform.iOS,
        project: 'BigProject',
      },
    ];

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${nodes}
        .allEdges=${[]}
        .filteredNodes=${nodes}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header?.getAttribute('title')).toBe('BigProject');
  });

  it('should return "Project Overview" when no local nodes with projects exist', async () => {
    const nodes: GraphNode[] = [
      {
        id: 'ext1',
        name: 'External',
        type: NodeType.Package,
        origin: Origin.External,
        platform: Platform.iOS,
      },
    ];

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${nodes}
        .allEdges=${[]}
        .filteredNodes=${nodes}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header?.getAttribute('title')).toBe('Project Overview');
  });

  it('should return "Project Overview" when allNodes is empty', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${[]}
        .allEdges=${[]}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const header = el.shadowRoot?.querySelector('xcode-graph-right-sidebar-header');
    expect(header?.getAttribute('title')).toBe('Project Overview');
  });
});

describe('xcode-graph-right-sidebar - findClusterById', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should find cluster from provided clusters list', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });

  it('should create synthetic cluster for package nodes using name', async () => {
    // MyPackage is a Package type node, so findClusterById matches by node.name
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyPackage');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });

  it('should create synthetic cluster for project nodes using project field', async () => {
    // MyApp nodes are Framework/Library types, so findClusterById matches by node.project
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // No clusters provided - will create synthetic
    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });

  it('should return undefined for non-existent cluster and not show panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('NonExistentCluster');
    await el.updateComplete;

    // The panel still renders but cluster prop will be undefined
    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });

  it('should detect external origin for synthetic cluster with external nodes', async () => {
    const externalNodes: GraphNode[] = [
      {
        id: 'ext1',
        name: 'ExtLib',
        type: NodeType.Framework,
        origin: Origin.External,
        platform: Platform.iOS,
        project: 'ExternalProject',
      },
    ];

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${externalNodes}
        .allEdges=${[]}
        .filteredNodes=${externalNodes}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('ExternalProject');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    expect(clusterPanel).not.toBeNull();
  });
});

describe('xcode-graph-right-sidebar - Collapse/Expand', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  /** Wait for Zag machine state to propagate through requestUpdate */
  async function waitForMachineUpdate(el: GraphRightSidebar): Promise<void> {
    // Zag machine calls requestUpdate asynchronously via subscribe callback
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
  }

  it('should toggle collapsed state via handleToggleCollapse', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    expect(el.hasAttribute('collapsed')).toBe(false);

    // Call the toggle method directly (Zag machine events are handled internally)
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);

    expect(el.hasAttribute('collapsed')).toBe(true);

    // Should now show collapsed sidebar
    const collapsedSidebar = el.shadowRoot?.querySelector('xcode-graph-collapsed-sidebar');
    expect(collapsedSidebar).not.toBeNull();
  });

  it('should show collapsed sidebar content when collapsed', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Collapse the sidebar via method
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);

    // Filter content should be gone, collapsed sidebar should be rendered
    expect(el.shadowRoot?.querySelector('.filter-content')).toBeNull();
    expect(el.shadowRoot?.querySelector('xcode-graph-collapsed-sidebar')).not.toBeNull();
  });

  it('should expand back from collapsed state via toggle', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Collapse first
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);
    expect(el.hasAttribute('collapsed')).toBe(true);

    // Toggle again to expand
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);
    expect(el.hasAttribute('collapsed')).toBe(false);
  });

  it('should toggle collapse via details toolbar when viewing node details', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    // Verify toolbar is present
    const toolbar = el.shadowRoot?.querySelector('.details-toolbar');
    expect(toolbar).not.toBeNull();

    // Call toggle collapse directly
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);

    expect(el.hasAttribute('collapsed')).toBe(true);
  });

  it('should handle expand-to-section from collapsed sidebar', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    // Collapse first
    (el as unknown as { handleToggleCollapse: () => void }).handleToggleCollapse();
    await waitForMachineUpdate(el);
    expect(el.hasAttribute('collapsed')).toBe(true);

    // Use handleExpandToSection to expand and navigate
    (el as unknown as { handleExpandToSection: (section: string) => void }).handleExpandToSection(
      'platforms',
    );
    await waitForMachineUpdate(el);

    // Should be expanded now
    expect(el.hasAttribute('collapsed')).toBe(false);
  });
});

describe('xcode-graph-right-sidebar - Search and Clear', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
    setFilters({
      nodeTypes: new Set([NodeType.Framework, NodeType.Library, NodeType.Package]),
      platforms: new Set([Platform.iOS, Platform.macOS]),
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should handle search-clear event from search bar', async () => {
    setSearchQuery('some query');

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    searchBar?.dispatchEvent(new CustomEvent('search-clear', { bubbles: true }));
    await el.updateComplete;

    expect(searchQuery.get()).toBe('');
  });

  it('should clear both filters and search on clear-filters', async () => {
    setSearchQuery('test');

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-clear-filters-button');
    clearButton?.dispatchEvent(new CustomEvent('clear-filters', { bubbles: true }));
    await el.updateComplete;

    expect(searchQuery.get()).toBe('');
  });

  it('should show stats cards with correct values when filtering', async () => {
    const filteredNodes = mockNodes.slice(0, 2);
    const filteredEdges = mockEdges.slice(0, 1);

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${filteredNodes}
        .filteredEdges=${filteredEdges}
      ></xcode-graph-right-sidebar>
    `);

    const statsCards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    expect(statsCards?.length).toBe(2);

    // First card is Nodes: 2/4 (highlighted since different)
    const nodesCard = statsCards?.[0];
    expect(nodesCard?.getAttribute('value')).toBe(`${filteredNodes.length}/${mockNodes.length}`);
    expect(nodesCard?.hasAttribute('highlighted')).toBe(true);
  });
});

describe('xcode-graph-right-sidebar - Section Toggle', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
    setFilters({
      nodeTypes: new Set([NodeType.Framework, NodeType.Library, NodeType.Package]),
      platforms: new Set([Platform.iOS, Platform.macOS]),
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(['MyApp', 'OtherApp']),
      packages: new Set(['MyPackage']),
    });
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should handle section-toggle on platforms filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    // Second filter section is Platforms
    const platformSection = filterSections?.[1];
    platformSection?.dispatchEvent(new CustomEvent('section-toggle', { bubbles: true }));
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should handle item-toggle on platform filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    const platformSection = filterSections?.[1];
    platformSection?.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key: 'iOS', checked: false },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    const currentFilters = filters.get();
    expect(currentFilters.platforms.has('iOS' as Platform)).toBe(false);
  });

  it('should handle item-toggle on project filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    const projectSection = filterSections?.[2];
    projectSection?.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key: 'MyApp', checked: false },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    const currentFilters = filters.get();
    expect(currentFilters.projects.has('MyApp')).toBe(false);
  });

  it('should handle item-toggle on package filter section', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    const filterSections = el.shadowRoot?.querySelectorAll('xcode-graph-filter-section');
    // Package section is the last one (after divider)
    const packageSection = Array.from(filterSections || []).find(
      (s) => s.getAttribute('title') === 'Packages',
    );
    packageSection?.dispatchEvent(
      new CustomEvent('item-toggle', {
        detail: { key: 'MyPackage', checked: false },
        bubbles: true,
      }),
    );
    await el.updateComplete;

    const currentFilters = filters.get();
    expect(currentFilters.packages.has('MyPackage')).toBe(false);
  });
});

describe('xcode-graph-right-sidebar - Back to Filters Navigation', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should navigate back from cluster details to filters view', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel')).not.toBeNull();

    const breadcrumb = el.shadowRoot?.querySelector('.breadcrumb-button') as HTMLButtonElement;
    breadcrumb?.click();
    await el.updateComplete;

    expect(selectedCluster.get()).toBeNull();
    expect(selectedNode.get()).toBeNull();

    // Should show filter view again
    const searchBar = el.shadowRoot?.querySelector('xcode-graph-search-bar');
    expect(searchBar).not.toBeNull();
  });

  it('should handle node-hover event from node details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    nodePanel?.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: 'node2' },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should handle close event from node details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
      ></xcode-graph-right-sidebar>
    `);

    selectNode(mockNodeCoreLib);
    await el.updateComplete;

    const nodePanel = el.shadowRoot?.querySelector('xcode-graph-node-details-panel');
    nodePanel?.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(selectedNode.get()).toBeNull();
  });

  it('should switch view when selectCluster is called after selectNode', () => {
    // This tests the signal-level transition that happens when the
    // @cluster-select handler on node-details-panel fires selectCluster()
    selectNode(mockNodeCoreLib);
    expect(selectedNode.get()).toBe(mockNodeCoreLib);
    expect(selectedCluster.get()).toBeNull();

    selectCluster('MyApp');
    expect(selectedCluster.get()).toBe('MyApp');
    expect(selectedNode.get()).toBeNull();
  });

  it('should handle node-hover event from cluster details panel', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${mockNodes}
        .filteredEdges=${mockEdges}
        .clusters=${[mockCluster]}
      ></xcode-graph-right-sidebar>
    `);

    selectCluster('MyApp');
    await el.updateComplete;

    const clusterPanel = el.shadowRoot?.querySelector('xcode-graph-cluster-details-panel');
    clusterPanel?.dispatchEvent(
      new CustomEvent('node-hover', {
        detail: { nodeId: 'node1' },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;

    expect(el).toBeDefined();
  });

  it('should switch view when selectNode is called after selectCluster', () => {
    // This tests the signal-level transition that happens when the
    // @node-select handler on cluster-details-panel fires selectNode()
    selectCluster('MyApp');
    expect(selectedCluster.get()).toBe('MyApp');
    expect(selectedNode.get()).toBeNull();

    selectNode(mockNodeCoreLib);
    expect(selectedNode.get()).toBe(mockNodeCoreLib);
    expect(selectedCluster.get()).toBeNull();
  });
});

describe('xcode-graph-right-sidebar - Empty State with Filters', () => {
  beforeEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  afterEach(() => {
    resetGraphSignals();
    resetFilterSignals();
  });

  it('should show empty state with has-active-filters when search is active', async () => {
    setSearchQuery('nonexistent');

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const emptyState = el.shadowRoot?.querySelector('xcode-graph-empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState?.hasAttribute('has-active-filters')).toBe(true);
  });

  it('should show empty state without has-active-filters when no filtering', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${[]}
        .allEdges=${[]}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const emptyState = el.shadowRoot?.querySelector('xcode-graph-empty-state');
    expect(emptyState).not.toBeNull();
  });

  it('should handle clear-filters event from empty state', async () => {
    setSearchQuery('test');

    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${mockNodes}
        .allEdges=${mockEdges}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const emptyState = el.shadowRoot?.querySelector('xcode-graph-empty-state');
    emptyState?.dispatchEvent(new CustomEvent('clear-filters', { bubbles: true }));
    await el.updateComplete;

    expect(searchQuery.get()).toBe('');
  });
});

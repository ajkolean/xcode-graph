/**
 * RightSidebar Lit Component
 *
 * Main right sidebar orchestrator with Zag state machine and Zustand stores.
 * Manages collapse/expand, tabs, and displays node/cluster details or filters.
 *
 * @example
 * ```html
 * <graph-right-sidebar
 *   .allNodes=${nodes}
 *   .allEdges=${edges}
 *   .filteredNodes=${filteredNodes}
 *   .filteredEdges=${filteredEdges}
 * ></graph-right-sidebar>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { createMachineController } from '@/controllers/zag.controller';
import { createStoreController } from '@/controllers/zustand.controller';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import { type SidebarSection, sidebarMachine } from '@/machines/sidebar.machine';
import { useFilterStore } from '@/stores/filterStore';
import { useGraphStore } from '@/stores/graphStore';
import { useUIStore } from '@/stores/uiStore';
import type { Cluster } from '@/types/cluster';
import { generateColorMap, getNodeTypeColor } from '@/utils/filterHelpers';
import { computeFilters } from '@/utils/nodeUtils';
import { PLATFORM_COLOR } from '@/utils/platformIcons';
import './right-sidebar-header';
import './collapsed-sidebar';
import './node-details-panel';
import './cluster-details-panel';
import './clear-filters-button';
import './search-bar';
import './filter-section';
import './empty-state';
import './stats-card';

export class GraphRightSidebar extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare allNodes: GraphNode[];

  @property({ attribute: false })
  declare allEdges: GraphEdge[];

  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  @property({ attribute: false })
  declare clusters: Cluster[] | undefined;

  // ========================================
  // State Management
  // ========================================

  // Zag sidebar machine
  private sidebar = createMachineController(this, sidebarMachine, {
    id: 'right-sidebar',
    defaultCollapsed: false,
  });

  // Zustand stores - Graph
  private selectedNode = createStoreController(this, useGraphStore, (s) => s.selectedNode);
  private selectedCluster = createStoreController(this, useGraphStore, (s) => s.selectedCluster);
  private viewMode = createStoreController(this, useGraphStore, (s) => s.viewMode);

  // Zustand stores - Filter
  private filters = createStoreController(this, useFilterStore, (s) => s.filters);
  private searchQuery = createStoreController(this, useFilterStore, (s) => s.searchQuery);

  // Zustand stores - UI
  private zoom = createStoreController(this, useUIStore, (s) => s.zoom);
  private previewFilter = createStoreController(this, useUIStore, (s) => s.previewFilter);

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      flex-shrink: 0;
      transition: width 0.2s ease;
    }

    :host([collapsed]) {
      width: 56px;
    }

    :host(:not([collapsed])) {
      width: 320px;
    }

    aside {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: var(--color-sidebar);
      border-left: 1px solid var(--color-sidebar-border);
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    }

    .filter-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .filter-scroll {
      flex: 1;
      overflow-y: auto;
    }

    .stats-row {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-md) 0;
    }

    .filter-sections {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-md);
    }
  `;

  // ========================================
  // Computed Values
  // ========================================

  private get filterData() {
    return computeFilters(this.allNodes);
  }

  private findClusterById(clusterId: string | null): Cluster | undefined {
    if (!clusterId) return undefined;

    const existing = this.clusters?.find((c) => c.id === clusterId);
    if (existing) return existing;

    const clusterNodes = this.allNodes.filter(
      (n) => (n.type === 'package' ? n.name : n.project) === clusterId,
    );
    if (clusterNodes.length === 0) return undefined;

    const firstNode = clusterNodes[0];
    const type = firstNode.type === 'package' ? 'package' : 'project';
    const origin = clusterNodes.some((n) => n.origin === 'external') ? 'external' : 'local';

    return {
      id: clusterId,
      name: clusterId,
      type,
      origin,
      nodes: clusterNodes,
    } as Cluster;
  }

  private get isCollapsed(): boolean {
    return this.sidebar.matches('collapsed');
  }

  private get headerTitle(): string {
    if (this.selectedNode.value) return 'Node Details';
    if (this.selectedCluster.value) return 'Cluster Details';
    return 'Project Overview';
  }

  // ========================================
  // Event Helpers
  // ========================================

  private handleSearchChange(query: string) {
    const setSearchQuery = this.searchQuery.getAction('setSearchQuery');
    setSearchQuery(query);
  }

  private handleClearFilters() {
    const setFilters = this.filters.getAction('setFilters');
    const setSearchQuery = this.searchQuery.getAction('setSearchQuery');
    const clearAll = this.filterData.createClearFilters(setFilters);
    clearAll();
    setSearchQuery('');
  }

  private handleItemToggle(
    type: 'nodeType' | 'platform' | 'project' | 'package',
    key: string,
    checked: boolean,
  ) {
    const setFilters = this.filters.getAction('setFilters');
    const current = this.filters.value;
    const next = { ...current };

    if (type === 'nodeType') {
      const set = new Set(current.nodeTypes);
      checked ? set.add(key) : set.delete(key);
      next.nodeTypes = set;
    } else if (type === 'platform') {
      const set = new Set(current.platforms);
      checked ? set.add(key) : set.delete(key);
      next.platforms = set;
    } else if (type === 'project') {
      const set = new Set(current.projects);
      checked ? set.add(key) : set.delete(key);
      next.projects = set;
    } else if (type === 'package') {
      const set = new Set(current.packages);
      checked ? set.add(key) : set.delete(key);
      next.packages = set;
    }

    setFilters(next);
  }

  private handlePreviewChange(preview: { type: string; value: string } | null) {
    const setPreviewFilter = this.previewFilter.getAction('setPreviewFilter');
    setPreviewFilter(preview);
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleToggleCollapse() {
    this.sidebar.send({ type: 'TOGGLE' });
  }

  private handleToggleSection(section: SidebarSection) {
    this.sidebar.send({ type: 'TOGGLE_SECTION', section });
  }

  private handleExpandToSection(section: SidebarSection) {
    // Clear selections
    const selectNode = this.selectedNode.getAction('selectNode');
    const selectCluster = this.selectedCluster.getAction('selectCluster');
    if (this.selectedNode.value) selectNode(null);
    if (this.selectedCluster.value) selectCluster(null);

    // Expand to section
    this.sidebar.send({ type: 'EXPAND_TO_SECTION', section });

    // Scroll to section
    setTimeout(() => {
      const element = this.shadowRoot?.getElementById(`filter-section-${section}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const isCollapsed = this.isCollapsed;
    const expandedSections = this.sidebar.get('expandedSections');
    const filterData = this.filterData;
    const isFiltersActive = filterData.hasActiveFilters(this.filters.value);

    const nodeTypeItems = Array.from(filterData.typeCounts.entries()).map(([type, count]) => ({
      key: type,
      count,
      color: getNodeTypeColor(type),
    }));

    const platformItems = Array.from(filterData.platformCounts.entries()).map(
      ([platform, count]) => ({
        key: platform,
        count,
        color: PLATFORM_COLOR,
      }),
    );

    const projectColors = generateColorMap(filterData.projectCounts.keys(), 'project');
    const packageColors = generateColorMap(filterData.packageCounts.keys(), 'package');

    const projectItems = Array.from(filterData.projectCounts.entries()).map(([project, count]) => ({
      key: project,
      count,
      color: projectColors.get(project) || '#6F2CFF',
    }));

    const packageItems = Array.from(filterData.packageCounts.entries()).map(([pkg, count]) => ({
      key: pkg,
      count,
      color: packageColors.get(pkg) || '#FF9800',
    }));

    // Update host attribute for CSS
    if (isCollapsed) {
      this.setAttribute('collapsed', '');
    } else {
      this.removeAttribute('collapsed');
    }

    return html`
      <aside>
        <graph-right-sidebar-header
          title=${this.headerTitle}
          ?is-collapsed=${isCollapsed}
          @toggle-collapse=${this.handleToggleCollapse}
        ></graph-right-sidebar-header>

        ${
          isCollapsed
            ? html`
              <graph-collapsed-sidebar
                .filteredNodes=${this.filteredNodes}
                .filteredEdges=${this.filteredEdges}
                .typeCounts=${this.filterData.typeCounts}
                .platformCounts=${this.filterData.platformCounts}
                node-types-filter-size=${this.filters.value.nodeTypes.size}
                platforms-filter-size=${this.filters.value.platforms.size}
                .projectCounts=${this.filterData.projectCounts}
                .packageCounts=${this.filterData.packageCounts}
                projects-filter-size=${this.filters.value.projects.size}
                packages-filter-size=${this.filters.value.packages.size}
                @expand-to-section=${(e: CustomEvent) =>
                  this.handleExpandToSection(e.detail.section as SidebarSection)}
              ></graph-collapsed-sidebar>
            `
            : html`
              <!-- Node Details -->
              ${
                this.selectedNode.value
                  ? html`
                    <graph-node-details-panel
                      .node=${this.selectedNode.value}
                      .allNodes=${this.allNodes}
                      .edges=${this.allEdges}
                      .filteredEdges=${this.filteredEdges}
                      .clusters=${this.clusters}
                      view-mode=${this.viewMode.value}
                      .zoom=${this.zoom.value}
                      @close=${() => this.selectedNode.getAction('selectNode')(null)}
                      @node-select=${(e: CustomEvent) =>
                        this.selectedNode.getAction('selectNode')(e.detail.node)}
                      @cluster-select=${(e: CustomEvent) =>
                        this.selectedCluster.getAction('selectCluster')(e.detail.clusterId)}
                      @node-hover=${(e: CustomEvent) => {
                        const setHovered = this.selectedNode.getAction('setHoveredNode');
                        setHovered(e.detail.nodeId);
                      }}
                      @focus-node=${(e: CustomEvent) =>
                        this.selectedNode.getAction('focusNode')(e.detail.node)}
                      @show-dependents=${(e: CustomEvent) =>
                        this.selectedNode.getAction('showDependents')(e.detail.node)}
                      @show-impact=${(e: CustomEvent) =>
                        this.selectedNode.getAction('showImpact')(e.detail.node)}
                    ></graph-node-details-panel>
                  `
                  : this.selectedCluster.value
                    ? html`
                      <graph-cluster-details-panel
                        .cluster=${this.findClusterById(this.selectedCluster.value)}
                        .clusterNodes=${this.allNodes.filter(
                          (n) =>
                            (n.type === 'package' ? n.name : n.project) ===
                            this.selectedCluster.value,
                        )}
                        .allNodes=${this.allNodes}
                        .edges=${this.allEdges}
                        .filteredEdges=${this.filteredEdges}
                        .zoom=${this.zoom.value}
                        @close=${() => this.selectedCluster.getAction('selectCluster')(null)}
                        @node-select=${(e: CustomEvent) =>
                          this.selectedNode.getAction('selectNode')(e.detail.node)}
                        @node-hover=${(e: CustomEvent) => {
                          const setHovered = this.selectedNode.getAction('setHoveredNode');
                          setHovered(e.detail.nodeId);
                        }}
                      ></graph-cluster-details-panel>
                    `
                    : html`
                      <!-- FilterView - Using React wrapper that contains all Lit children -->
                      <div class="filter-content">
                        <div class="stats-row">
                          <graph-stats-card
                            label="Nodes"
                            value="${this.filteredNodes?.length ?? 0}/${this.allNodes?.length ?? 0}"
                            ?highlighted=${isFiltersActive}
                          ></graph-stats-card>
                          <graph-stats-card
                            label="Dependencies"
                            value="${this.filteredEdges?.length ?? 0}/${this.allEdges?.length ?? 0}"
                            ?highlighted=${isFiltersActive}
                          ></graph-stats-card>
                        </div>

                        <graph-clear-filters-button
                          ?is-active=${isFiltersActive || !!this.searchQuery.value}
                          @clear-filters=${() => this.handleClearFilters()}
                        ></graph-clear-filters-button>

                        <graph-search-bar
                          search-query=${this.searchQuery.value || ''}
                          @search-change=${(e: CustomEvent) => this.handleSearchChange(e.detail.query)}
                          @search-clear=${() => this.handleSearchChange('')}
                        ></graph-search-bar>

                        <div class="filter-scroll">
                          <div class="filter-sections">
                            <graph-filter-section
                              id="productTypes"
                              title="Product Types"
                              icon-name="product-types"
                              .items=${nodeTypeItems}
                              .selectedItems=${this.filters.value.nodeTypes}
                              ?is-expanded=${expandedSections.productTypes}
                              filter-type="nodeType"
                              .zoom=${this.zoom.value}
                              @section-toggle=${() => this.handleToggleSection('productTypes')}
                              @item-toggle=${(e: CustomEvent) =>
                                this.handleItemToggle('nodeType', e.detail.key, e.detail.checked)}
                              @preview-change=${(e: CustomEvent) => this.handlePreviewChange(e.detail)}
                            ></graph-filter-section>

                            <graph-filter-section
                              id="platforms"
                              title="Platforms"
                              icon-name="platforms"
                              .items=${platformItems}
                              .selectedItems=${this.filters.value.platforms}
                              ?is-expanded=${expandedSections.platforms}
                              filter-type="platform"
                              .zoom=${this.zoom.value}
                              @section-toggle=${() => this.handleToggleSection('platforms')}
                              @item-toggle=${(e: CustomEvent) =>
                                this.handleItemToggle('platform', e.detail.key, e.detail.checked)}
                              @preview-change=${(e: CustomEvent) => this.handlePreviewChange(e.detail)}
                            ></graph-filter-section>

                            <graph-filter-section
                              id="projects"
                              title="Projects"
                              icon-name="projects"
                              .items=${projectItems}
                              .selectedItems=${this.filters.value.projects}
                              ?is-expanded=${expandedSections.projects}
                              filter-type="project"
                              .zoom=${this.zoom.value}
                              @section-toggle=${() => this.handleToggleSection('projects')}
                              @item-toggle=${(e: CustomEvent) =>
                                this.handleItemToggle('project', e.detail.key, e.detail.checked)}
                              @preview-change=${(e: CustomEvent) => this.handlePreviewChange(e.detail)}
                            ></graph-filter-section>

                            ${
                              packageItems.length
                                ? html`
                                  <graph-filter-section
                                    id="packages"
                                    title="Packages"
                                    icon-name="packages"
                                    .items=${packageItems}
                                    .selectedItems=${this.filters.value.packages}
                                    ?is-expanded=${expandedSections.packages}
                                    filter-type="package"
                                    .zoom=${this.zoom.value}
                                    @section-toggle=${() => this.handleToggleSection('packages')}
                                    @item-toggle=${(e: CustomEvent) =>
                                      this.handleItemToggle(
                                        'package',
                                        e.detail.key,
                                        e.detail.checked,
                                      )}
                                    @preview-change=${(e: CustomEvent) =>
                                      this.handlePreviewChange(e.detail)}
                                  ></graph-filter-section>
                                `
                                : ''
                            }
                          </div>

                          ${
                            this.filteredNodes?.length === 0
                              ? html`
                                <graph-empty-state
                                  ?has-active-filters=${isFiltersActive || !!this.searchQuery.value}
                                  @clear-filters=${() => this.handleClearFilters()}
                                ></graph-empty-state>
                              `
                              : ''
                          }
                        </div>
                      </div>
                    `
              }
            `
        }
      </aside>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-right-sidebar': GraphRightSidebar;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-right-sidebar')) {
  customElements.define('graph-right-sidebar', GraphRightSidebar);
}

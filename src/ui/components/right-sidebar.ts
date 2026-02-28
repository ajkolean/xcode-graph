/**
 * RightSidebar Lit Component
 *
 * Main right sidebar orchestrator with Zag state machine and Lit Signals.
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

import { generateColorMap } from '@graph/utils/filters';
import { computeFilters } from '@graph/utils/node-utils';
import { SignalWatcher } from '@lit-labs/signals';
import { createMachineController } from '@shared/controllers/zag.controller';
import { type SidebarSection, sidebarMachine } from '@shared/machines/sidebar.machine';
import type { Cluster } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.schema';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { PLATFORM_COLOR } from '@ui/utils/platform-icons';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './right-sidebar-header';
import './sidebar-collapse-icon';
import './icon-button.js';
import './collapsed-sidebar';
import './node-details-panel';
import './cluster-details-panel';
import './clear-filters-button';
import './search-bar';
import type { FilterItem } from './filter-section';
import './filter-section';
import './empty-state';
import './stats-card';

// Import signals
// Import actions
import {
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setHoveredNode,
  toggleHighlight,
} from '@graph/signals/index';
import type { FilterState } from '@shared/schemas';
import {
  filters,
  type PreviewFilter,
  searchQuery,
  setFilters,
  setPreviewFilter,
  setSearchQuery,
  zoom,
} from '@shared/signals/index';

/** Grouped filter items for all filter sections */
interface FilterItemsGroup {
  nodeTypeItems: FilterItem[];
  platformItems: FilterItem[];
  projectItems: FilterItem[];
  packageItems: FilterItem[];
}

/** Expanded sections state */
interface ExpandedSectionsState {
  productTypes: boolean;
  platforms: boolean;
  projects: boolean;
  packages: boolean;
}

/** Options for rendering the filter view */
interface FilterViewOptions {
  filters: FilterState;
  searchQuery: string;
  zoom: number;
  isFiltersActive: boolean;
  expandedSections: ExpandedSectionsState;
  items: FilterItemsGroup;
}

/** Options for rendering expanded sidebar content */
interface ExpandedContentOptions {
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  activeDirectDeps: boolean;
  activeTransitiveDeps: boolean;
  activeDirectDependents: boolean;
  activeTransitiveDependents: boolean;
  zoom: number;
  filters: FilterState;
  searchQuery: string;
  isFiltersActive: boolean;
  expandedSections: ExpandedSectionsState;
  items: FilterItemsGroup;
}

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

export class GraphRightSidebar extends SignalWatcherLitElement {
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

  // Zag sidebar machine (kept - only replacing Zustand)
  private readonly sidebar = createMachineController(this, sidebarMachine, {
    id: 'right-sidebar',
    defaultCollapsed: false,
  });

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      flex-shrink: 0;
      transition: width var(--durations-normal) var(--easings-default);
    }

    :host([collapsed]) {
      width: var(--sizes-sidebar-collapsed);
    }

    :host(:not([collapsed])) {
      width: var(--sizes-sidebar-width);
    }

    aside {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--colors-sidebar);
      border-left: var(--border-widths-thin) solid var(--colors-sidebar-border);
      position: relative;
    }

    .filter-content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .filter-header {
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    }

    /* Subtle shadow at the bottom edge of the pinned header */
    .filter-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(
        to bottom,
        rgba(var(--colors-background-rgb), var(--opacity-40)) 0%,
        rgba(var(--colors-background-rgb), 0) 100%
      );
      pointer-events: none;
      z-index: 3;
      transform: translateY(100%);
    }

    .filter-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(var(--colors-primary-rgb), var(--opacity-20)) transparent;
    }

    .filter-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .filter-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .filter-scroll::-webkit-scrollbar-thumb {
      background: rgba(var(--colors-primary-rgb), var(--opacity-20));
      border-radius: var(--radii-sm);
    }

    .filter-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(var(--colors-primary-rgb), var(--opacity-40));
    }

    .stats-row {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-md) 0;
      position: relative;
      z-index: 1;
    }

    .filter-sections {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-md);
      position: relative;
      z-index: 1;
    }

    .section-divider {
      height: 1px;
      background: var(--colors-border);
      margin: var(--spacing-1) 0;
    }

    .details-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-sidebar-border);
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .breadcrumb-button {
      display: inline-flex;
      align-items: center;
      padding: 0;
      background: none;
      border: none;
      color: var(--colors-primary);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      cursor: pointer;
      transition: opacity var(--durations-fast) var(--easings-default);
    }

    .breadcrumb-button:hover {
      opacity: 0.8;
    }

    .breadcrumb-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
      border-radius: var(--radii-sm);
    }

    .filters-active-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--colors-primary);
      margin-left: var(--spacing-2);
      vertical-align: middle;
      box-shadow: 0 0 6px rgba(var(--colors-primary-rgb), var(--opacity-50));
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
      (n) => (n.type === NodeType.Package ? n.name : n.project) === clusterId,
    );
    if (clusterNodes.length === 0) return undefined;

    const firstNode = clusterNodes[0];
    if (!firstNode) return undefined;
    const type = firstNode.type === NodeType.Package ? 'package' : 'project';
    const origin = clusterNodes.some((n) => n.origin === Origin.External)
      ? Origin.External
      : Origin.Local;

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

  private get isViewingDetails(): boolean {
    return !!selectedNode.get() || !!selectedCluster.get();
  }

  // ========================================
  // Event Helpers
  // ========================================

  private handleSearchChange(query: string) {
    setSearchQuery(query);
  }

  private handleClearFilters() {
    const clearAll = this.filterData.createClearFilters(setFilters);
    clearAll();
    setSearchQuery('');
  }

  private handleItemToggle(
    type: 'nodeType' | 'platform' | 'project' | 'package',
    key: string,
    checked: boolean,
  ) {
    const current = filters.get();
    const filterKeyMap = {
      nodeType: 'nodeTypes',
      platform: 'platforms',
      project: 'projects',
      package: 'packages',
    } as const;

    const filterKey = filterKeyMap[type];
    const set = new Set(current[filterKey]);
    if (checked) {
      set.add(key);
    } else {
      set.delete(key);
    }

    setFilters({ ...current, [filterKey]: set });
  }

  private handlePreviewChange(preview: PreviewFilter) {
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
    if (selectedNode.get()) selectNode(null);
    if (selectedCluster.get()) selectCluster(null);

    // Expand to section
    this.sidebar.send({ type: 'EXPAND_TO_SECTION', section });

    // Scroll to section
    setTimeout(() => {
      const element = this.shadowRoot?.getElementById(`filter-section-${section}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ========================================
  // Render Helpers
  // ========================================

  private renderCollapsedSidebar(currentFilters: ReturnType<typeof filters.get>) {
    return html`
      <graph-collapsed-sidebar
        .filteredNodes=${this.filteredNodes}
        .filteredEdges=${this.filteredEdges}
        .typeCounts=${this.filterData.typeCounts}
        .platformCounts=${this.filterData.platformCounts}
        node-types-filter-size=${currentFilters.nodeTypes.size}
        platforms-filter-size=${currentFilters.platforms.size}
        .projectCounts=${this.filterData.projectCounts}
        .packageCounts=${this.filterData.packageCounts}
        projects-filter-size=${currentFilters.projects.size}
        packages-filter-size=${currentFilters.packages.size}
        @expand-to-section=${(e: CustomEvent) =>
          this.handleExpandToSection(e.detail.section as SidebarSection)}
      ></graph-collapsed-sidebar>
    `;
  }

  private renderNodeDetails(
    node: GraphNode,
    currentZoom: number,
    toggleStates: {
      activeDirectDeps: boolean;
      activeTransitiveDeps: boolean;
      activeDirectDependents: boolean;
      activeTransitiveDependents: boolean;
    },
  ) {
    return html`
      <graph-node-details-panel
        .node=${node}
        .allNodes=${this.allNodes}
        .edges=${this.allEdges}
        .filteredEdges=${this.filteredEdges}
        .clusters=${this.clusters}
        ?active-direct-deps=${toggleStates.activeDirectDeps}
        ?active-transitive-deps=${toggleStates.activeTransitiveDeps}
        ?active-direct-dependents=${toggleStates.activeDirectDependents}
        ?active-transitive-dependents=${toggleStates.activeTransitiveDependents}
        .zoom=${currentZoom}
        @close=${() => selectNode(null)}
        @node-select=${(e: CustomEvent) => selectNode(e.detail.node)}
        @cluster-select=${(e: CustomEvent) => selectCluster(e.detail.clusterId)}
        @node-hover=${(e: CustomEvent) => setHoveredNode(e.detail.nodeId)}
        @toggle-direct-deps=${() => toggleHighlight('direct-deps')}
        @toggle-transitive-deps=${() => toggleHighlight('transitive-deps')}
        @toggle-direct-dependents=${() => toggleHighlight('direct-dependents')}
        @toggle-transitive-dependents=${() => toggleHighlight('transitive-dependents')}
      ></graph-node-details-panel>
    `;
  }

  private renderClusterDetails(
    clusterId: string,
    currentZoom: number,
    toggleStates: {
      activeDirectDeps: boolean;
      activeDirectDependents: boolean;
    },
  ) {
    return html`
      <graph-cluster-details-panel
        .cluster=${this.findClusterById(clusterId)}
        .clusterNodes=${this.allNodes.filter(
          (n) => (n.type === NodeType.Package ? n.name : n.project) === clusterId,
        )}
        .allNodes=${this.allNodes}
        .edges=${this.allEdges}
        .filteredEdges=${this.filteredEdges}
        ?active-direct-deps=${toggleStates.activeDirectDeps}
        ?active-direct-dependents=${toggleStates.activeDirectDependents}
        .zoom=${currentZoom}
        @close=${() => selectCluster(null)}
        @node-select=${(e: CustomEvent) => selectNode(e.detail.node)}
        @node-hover=${(e: CustomEvent) => setHoveredNode(e.detail.nodeId)}
        @toggle-direct-deps=${() => toggleHighlight('direct-deps')}
        @toggle-direct-dependents=${() => toggleHighlight('direct-dependents')}
      ></graph-cluster-details-panel>
    `;
  }

  private renderFilterView(options: FilterViewOptions) {
    const {
      filters: currentFilters,
      searchQuery: currentSearchQuery,
      zoom: currentZoom,
      isFiltersActive,
      expandedSections,
      items,
    } = options;

    return html`
      <div class="filter-content">
        <div class="filter-header">
          <graph-search-bar
            search-query=${currentSearchQuery || ''}
            @search-change=${(e: CustomEvent) => this.handleSearchChange(e.detail.query)}
            @search-clear=${() => this.handleSearchChange('')}
          ></graph-search-bar>

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
        </div>

        <div class="filter-scroll">
          ${
            this.filteredNodes?.length === 0
              ? html`
                <graph-empty-state
                  ?has-active-filters=${isFiltersActive || !!currentSearchQuery}
                  @clear-filters=${() => this.handleClearFilters()}
                ></graph-empty-state>
              `
              : ''
          }

          <div class="filter-sections">
            ${this.renderFilterSections(currentFilters, currentZoom, expandedSections, items)}
          </div>

          <graph-clear-filters-button
            ?is-active=${isFiltersActive || !!currentSearchQuery}
            @clear-filters=${() => this.handleClearFilters()}
          ></graph-clear-filters-button>
        </div>
      </div>
    `;
  }

  private renderFilterSections(
    currentFilters: FilterState,
    currentZoom: number,
    expandedSections: ExpandedSectionsState,
    items: FilterItemsGroup,
  ) {
    const { nodeTypeItems, platformItems, projectItems, packageItems } = items;

    return html`
      <graph-filter-section
        id="productTypes"
        title="Product Types"
        icon-name="product-types"
        .items=${nodeTypeItems}
        .selectedItems=${currentFilters.nodeTypes}
        ?is-expanded=${expandedSections.productTypes}
        filter-type="nodeType"
        .zoom=${currentZoom}
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
        .selectedItems=${currentFilters.platforms}
        ?is-expanded=${expandedSections.platforms}
        filter-type="platform"
        .zoom=${currentZoom}
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
        .selectedItems=${currentFilters.projects}
        ?is-expanded=${expandedSections.projects}
        filter-type="project"
        .zoom=${currentZoom}
        @section-toggle=${() => this.handleToggleSection('projects')}
        @item-toggle=${(e: CustomEvent) =>
          this.handleItemToggle('project', e.detail.key, e.detail.checked)}
        @preview-change=${(e: CustomEvent) => this.handlePreviewChange(e.detail)}
      ></graph-filter-section>

      ${packageItems.length ? html`<div class="section-divider"></div>` : ''}

      ${
        packageItems.length
          ? html`
            <graph-filter-section
              id="packages"
              title="Packages"
              icon-name="packages"
              .items=${packageItems}
              .selectedItems=${currentFilters.packages}
              ?is-expanded=${expandedSections.packages}
              filter-type="package"
              .zoom=${currentZoom}
              @section-toggle=${() => this.handleToggleSection('packages')}
              @item-toggle=${(e: CustomEvent) =>
                this.handleItemToggle('package', e.detail.key, e.detail.checked)}
              @preview-change=${(e: CustomEvent) => this.handlePreviewChange(e.detail)}
            ></graph-filter-section>
          `
          : ''
      }
    `;
  }

  private handleBackToFilters() {
    selectNode(null);
    selectCluster(null);
  }

  private renderDetailsToolbar() {
    return html`
      <div class="details-toolbar">
        <button class="breadcrumb-button" @click=${this.handleBackToFilters}>
          ← Back to Filters
        </button>
        <graph-icon-button
          variant="ghost"
          color="neutral"
          title="Collapse sidebar"
          @click=${this.handleToggleCollapse}
        >
          <graph-sidebar-collapse-icon></graph-sidebar-collapse-icon>
        </graph-icon-button>
      </div>
    `;
  }

  private renderExpandedContent(options: ExpandedContentOptions) {
    const {
      selectedNode,
      selectedCluster,
      activeDirectDeps,
      activeTransitiveDeps,
      activeDirectDependents,
      activeTransitiveDependents,
      zoom: currentZoom,
      filters: currentFilters,
      searchQuery: currentSearchQuery,
      isFiltersActive,
      expandedSections,
      items,
    } = options;

    if (selectedNode) {
      return html`
        ${this.renderDetailsToolbar()}
        ${this.renderNodeDetails(selectedNode, currentZoom, {
          activeDirectDeps,
          activeTransitiveDeps,
          activeDirectDependents,
          activeTransitiveDependents,
        })}
      `;
    }
    if (selectedCluster) {
      return html`
        ${this.renderDetailsToolbar()}
        ${this.renderClusterDetails(selectedCluster, currentZoom, {
          activeDirectDeps,
          activeDirectDependents,
        })}
      `;
    }
    return this.renderFilterView({
      filters: currentFilters,
      searchQuery: currentSearchQuery,
      zoom: currentZoom,
      isFiltersActive,
      expandedSections,
      items,
    });
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    const isCollapsed = this.isCollapsed;
    const expandedSections = this.sidebar.get('expandedSections');
    const filterData = this.filterData;
    const currentFilters = filters.get();
    const currentSearchQuery = searchQuery.get();
    const currentSelectedNode = selectedNode.get();
    const currentSelectedCluster = selectedCluster.get();
    const currentActiveDirectDeps = highlightDirectDeps.get();
    const currentActiveTransitiveDeps = highlightTransitiveDeps.get();
    const currentActiveDirectDependents = highlightDirectDependents.get();
    const currentActiveTransitiveDependents = highlightTransitiveDependents.get();
    const currentZoom = zoom.get();
    const isFiltersActive = filterData.hasActiveFilters(currentFilters);

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

    const sidebarContent = isCollapsed
      ? this.renderCollapsedSidebar(currentFilters)
      : this.renderExpandedContent({
          selectedNode: currentSelectedNode,
          selectedCluster: currentSelectedCluster,
          activeDirectDeps: currentActiveDirectDeps,
          activeTransitiveDeps: currentActiveTransitiveDeps,
          activeDirectDependents: currentActiveDirectDependents,
          activeTransitiveDependents: currentActiveTransitiveDependents,
          zoom: currentZoom,
          filters: currentFilters,
          searchQuery: currentSearchQuery,
          isFiltersActive,
          expandedSections,
          items: { nodeTypeItems, platformItems, projectItems, packageItems },
        });

    return html`
      <aside>
        ${
          !this.isViewingDetails || isCollapsed
            ? html`
            <graph-right-sidebar-header
              title="Project Overview"
              ?is-collapsed=${isCollapsed}
              ?has-active-filters=${isFiltersActive}
              @toggle-collapse=${this.handleToggleCollapse}
            ></graph-right-sidebar-header>
          `
            : ''
        }

        ${sidebarContent}
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

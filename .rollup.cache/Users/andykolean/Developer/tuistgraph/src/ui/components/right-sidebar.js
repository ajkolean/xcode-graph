import { __decorate } from "tslib";
/**
 * RightSidebar Lit Component
 *
 * Main right sidebar orchestrator with Zag state machine and Lit Signals.
 * Manages collapse/expand, tabs, and displays node/cluster details or filters.
 *
 * @example
 * ```html
 * <xcode-graph-right-sidebar
 *   .allNodes=${nodes}
 *   .allEdges=${edges}
 *   .filteredNodes=${filteredNodes}
 *   .filteredEdges=${filteredEdges}
 * ></xcode-graph-right-sidebar>
 * ```
 */
import { generateColorMap } from '@graph/utils/filters';
import { computeFilters } from '@graph/utils/node-utils';
import { SignalWatcher } from '@lit-labs/signals';
import { createMachineController } from '@shared/controllers/zag.controller';
import { sidebarMachine } from '@shared/machines/sidebar.machine';
import { NodeType, Origin } from '@shared/schemas/graph.types';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { getPlatformColor } from '@ui/utils/platform-icons';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import './right-sidebar-header';
import './sidebar-collapse-icon';
import './icon-button.js';
import './collapsed-sidebar';
import './node-details-panel';
import './cluster-details-panel';
import './clear-filters-button';
import './search-bar';
import './filter-section';
import './empty-state';
import './stats-card';
// Import signals
// Import actions
import { highlightDirectDependents, highlightDirectDeps, highlightTransitiveDependents, highlightTransitiveDeps, selectCluster, selectedCluster, selectedNode, selectNode, setHoveredNode, toggleHighlight, } from '@graph/signals/index';
import { filters, searchQuery, setFilters, setPreviewFilter, setSearchQuery, zoom, } from '@shared/signals/index';
const SignalWatcherLitElement = SignalWatcher(LitElement);
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <xcode-graph-collapsed-sidebar></xcode-graph-collapsed-sidebar>
    `, parts: [{ type: 1, index: 0, name: "filteredNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "filteredEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "typeCounts", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "platformCounts", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "node-types-filter-size", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "platforms-filter-size", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "projectCounts", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "packageCounts", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "projects-filter-size", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "packages-filter-size", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "expand-to-section", strings: ["", ""], ctor: E_1 }] };
const lit_template_2 = { h: b_1 `
      <xcode-graph-node-details-panel></xcode-graph-node-details-panel>
    `, parts: [{ type: 1, index: 0, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "allNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "edges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "filteredEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "clusters", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "active-direct-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "active-transitive-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "active-direct-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "active-transitive-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "close", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "cluster-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-direct-deps", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-transitive-deps", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-direct-dependents", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-transitive-dependents", strings: ["", ""], ctor: E_1 }] };
const lit_template_3 = { h: b_1 `
      <xcode-graph-cluster-details-panel></xcode-graph-cluster-details-panel>
    `, parts: [{ type: 1, index: 0, name: "cluster", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "clusterNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "allNodes", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "edges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "filteredEdges", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "active-direct-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "active-direct-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "close", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "node-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-direct-deps", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "toggle-direct-dependents", strings: ["", ""], ctor: E_1 }] };
const lit_template_4 = { h: b_1 `
      <div class="filter-content">
        <div class="filter-scroll">
          <xcode-graph-search-bar></xcode-graph-search-bar>

          <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>

          <div class="stats-row">
            <xcode-graph-stats-card label="Nodes"></xcode-graph-stats-card>
            <xcode-graph-stats-card label="Dependencies"></xcode-graph-stats-card>
          </div>
          <?>

          <div class="filter-sections">
            <?>
          </div>
        </div>
      </div>
    `, parts: [{ type: 1, index: 2, name: "search-query", strings: ["", ""], ctor: A_1 }, { type: 1, index: 2, name: "search-change", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "search-clear", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "is-active", strings: ["", ""], ctor: B_1 }, { type: 1, index: 3, name: "clear-filters", strings: ["", ""], ctor: E_1 }, { type: 1, index: 5, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 5, name: "highlighted", strings: ["", ""], ctor: B_1 }, { type: 1, index: 6, name: "value", strings: ["", "/", ""], ctor: A_1 }, { type: 1, index: 6, name: "highlighted", strings: ["", ""], ctor: B_1 }, { type: 2, index: 7 }, { type: 2, index: 9 }] };
const lit_template_5 = { h: b_1 `
                <xcode-graph-empty-state></xcode-graph-empty-state>
              `, parts: [{ type: 1, index: 0, name: "has-active-filters", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "clear-filters", strings: ["", ""], ctor: E_1 }] };
const lit_template_6 = { h: b_1 `
      <xcode-graph-filter-section id="productTypes" title="Product Types" icon-name="product-types" filter-type="nodeType"></xcode-graph-filter-section>

      <xcode-graph-filter-section id="platforms" title="Platforms" icon-name="platforms" filter-type="platform"></xcode-graph-filter-section>

      <xcode-graph-filter-section id="projects" title="Projects" icon-name="projects" filter-type="project"></xcode-graph-filter-section>

      <?>

      <?>
    `, parts: [{ type: 1, index: 0, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "selectedItems", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "is-expanded", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "section-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "item-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "preview-change", strings: ["", ""], ctor: E_1 }, { type: 1, index: 1, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 1, name: "selectedItems", strings: ["", ""], ctor: P_1 }, { type: 1, index: 1, name: "is-expanded", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 1, name: "section-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 1, name: "item-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 1, name: "preview-change", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "selectedItems", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "is-expanded", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 2, name: "section-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "item-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "preview-change", strings: ["", ""], ctor: E_1 }, { type: 2, index: 3 }, { type: 2, index: 4 }] };
const lit_template_7 = { h: b_1 `<div class="section-divider"></div>`, parts: [] };
const lit_template_8 = { h: b_1 `
            <xcode-graph-filter-section id="packages" title="Packages" icon-name="packages" filter-type="package"></xcode-graph-filter-section>
          `, parts: [{ type: 1, index: 0, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "selectedItems", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "is-expanded", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "section-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "item-toggle", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "preview-change", strings: ["", ""], ctor: E_1 }] };
const lit_template_9 = { h: b_1 `
      <div class="details-toolbar">
        <button class="breadcrumb-button">
          \u2190 Back to Filters
        </button>
        <xcode-graph-icon-button variant="ghost" color="neutral" title="Collapse sidebar">
          <xcode-graph-sidebar-collapse-icon></xcode-graph-sidebar-collapse-icon>
        </xcode-graph-icon-button>
      </div>
    `, parts: [{ type: 1, index: 1, name: "click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 2, name: "click", strings: ["", ""], ctor: E_1 }] };
const lit_template_10 = { h: b_1 `
        <?>
        <?>
      `, parts: [{ type: 2, index: 0 }, { type: 2, index: 1 }] };
const lit_template_11 = { h: b_1 `
        <?>
        <?>
      `, parts: [{ type: 2, index: 0 }, { type: 2, index: 1 }] };
const lit_template_12 = { h: b_1 `
      <aside aria-label="Details and filters">
        <?>

        <?>
      </aside>
    `, parts: [{ type: 2, index: 1 }, { type: 2, index: 2 }] };
const lit_template_13 = { h: b_1 `
            <xcode-graph-right-sidebar-header></xcode-graph-right-sidebar-header>
          `, parts: [{ type: 1, index: 0, name: "title", strings: ["", ""], ctor: A_1 }, { type: 1, index: 0, name: "is-collapsed", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "has-active-filters", strings: ["", ""], ctor: B_1 }, { type: 1, index: 0, name: "toggle-collapse", strings: ["", ""], ctor: E_1 }] };
/**
 * Main right sidebar orchestrator with Zag state machine and Lit Signals.
 * Manages collapse/expand, tabs, and displays node/cluster details or filters.
 *
 * @summary Right sidebar with filters, search, and detail panels
 */
export class GraphRightSidebar extends SignalWatcherLitElement {
    // ========================================
    // State Management
    // ========================================
    // Zag sidebar machine (kept - only replacing Zustand)
    sidebar = createMachineController(this, sidebarMachine, {
        id: 'right-sidebar',
        defaultCollapsed: false,
    });
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
      padding: var(--spacing-3) var(--spacing-md);
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
    get filterData() {
        return computeFilters(this.allNodes);
    }
    findClusterById(clusterId) {
        if (!clusterId)
            return undefined;
        const existing = this.clusters?.find((c) => c.id === clusterId);
        if (existing)
            return existing;
        const clusterNodes = this.allNodes.filter((n) => (n.type === NodeType.Package ? n.name : n.project) === clusterId);
        if (clusterNodes.length === 0)
            return undefined;
        const firstNode = clusterNodes[0];
        if (!firstNode)
            return undefined;
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
        };
    }
    get isCollapsed() {
        return this.sidebar.matches('collapsed');
    }
    get isViewingDetails() {
        return !!selectedNode.get() || !!selectedCluster.get();
    }
    /** Derive workspace name from the largest local project cluster */
    get workspaceName() {
        const projectCounts = new Map();
        for (const node of this.allNodes) {
            if (node.origin === Origin.Local && node.project) {
                projectCounts.set(node.project, (projectCounts.get(node.project) || 0) + 1);
            }
        }
        if (projectCounts.size === 0)
            return 'Project Overview';
        let largest = '';
        let max = 0;
        for (const [name, count] of projectCounts) {
            if (count > max) {
                max = count;
                largest = name;
            }
        }
        return largest || 'Project Overview';
    }
    // ========================================
    // Event Helpers
    // ========================================
    handleSearchChange(query) {
        setSearchQuery(query);
    }
    handleClearFilters() {
        const clearAll = this.filterData.createClearFilters(setFilters);
        clearAll();
        setSearchQuery('');
    }
    handleItemToggle(type, key, checked) {
        const current = filters.get();
        const filterKeyMap = {
            nodeType: 'nodeTypes',
            platform: 'platforms',
            project: 'projects',
            package: 'packages',
        };
        const filterKey = filterKeyMap[type];
        const set = new Set(current[filterKey]);
        if (checked) {
            set.add(key);
        }
        else {
            set.delete(key);
        }
        setFilters({ ...current, [filterKey]: set });
    }
    handlePreviewChange(preview) {
        setPreviewFilter(preview);
    }
    // ========================================
    // Event Handlers
    // ========================================
    handleToggleCollapse() {
        this.sidebar.send({ type: 'TOGGLE' });
    }
    handleToggleSection(section) {
        this.sidebar.send({ type: 'TOGGLE_SECTION', section });
    }
    handleExpandToSection(section) {
        // Clear selections
        if (selectedNode.get())
            selectNode(null);
        if (selectedCluster.get())
            selectCluster(null);
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
    renderCollapsedSidebar(currentFilters) {
        return { ["_$litType$"]: lit_template_1, values: [this.filteredNodes, this.filteredEdges, this.filterData.typeCounts, this.filterData.platformCounts, currentFilters.nodeTypes.size, currentFilters.platforms.size, this.filterData.projectCounts, this.filterData.packageCounts, currentFilters.projects.size, currentFilters.packages.size, (e) => this.handleExpandToSection(e.detail.section)] };
    }
    renderNodeDetails(node, currentZoom, toggleStates) {
        return { ["_$litType$"]: lit_template_2, values: [node, this.allNodes, this.allEdges, this.filteredEdges, this.clusters, toggleStates.activeDirectDeps, toggleStates.activeTransitiveDeps, toggleStates.activeDirectDependents, toggleStates.activeTransitiveDependents, currentZoom, () => selectNode(null), (e) => selectNode(e.detail.node), (e) => selectCluster(e.detail.clusterId), (e) => setHoveredNode(e.detail.nodeId), () => toggleHighlight('direct-deps'), () => toggleHighlight('transitive-deps'), () => toggleHighlight('direct-dependents'), () => toggleHighlight('transitive-dependents')] };
    }
    renderClusterDetails(clusterId, currentZoom, toggleStates) {
        return { ["_$litType$"]: lit_template_3, values: [this.findClusterById(clusterId), this.allNodes.filter((n) => (n.type === NodeType.Package ? n.name : n.project) === clusterId), this.allNodes, this.allEdges, this.filteredEdges, toggleStates.activeDirectDeps, toggleStates.activeDirectDependents, currentZoom, () => selectCluster(null), (e) => selectNode(e.detail.node), (e) => setHoveredNode(e.detail.nodeId), () => toggleHighlight('direct-deps'), () => toggleHighlight('direct-dependents')] };
    }
    renderFilterView(options) {
        const { filters: currentFilters, searchQuery: currentSearchQuery, zoom: currentZoom, expandedSections, items, } = options;
        const nodesFiltered = (this.filteredNodes?.length ?? 0) !== (this.allNodes?.length ?? 0);
        const edgesFiltered = (this.filteredEdges?.length ?? 0) !== (this.allEdges?.length ?? 0);
        const hasAnyFiltering = nodesFiltered || edgesFiltered || !!currentSearchQuery;
        return { ["_$litType$"]: lit_template_4, values: [currentSearchQuery || '', (e) => this.handleSearchChange(e.detail.query), () => this.handleSearchChange(''), hasAnyFiltering, () => this.handleClearFilters(), this.filteredNodes?.length ?? 0, this.allNodes?.length ?? 0, nodesFiltered, this.filteredEdges?.length ?? 0, this.allEdges?.length ?? 0, edgesFiltered, when(this.filteredNodes?.length === 0, () => ({ ["_$litType$"]: lit_template_5, values: [hasAnyFiltering, () => this.handleClearFilters()] })), this.renderFilterSections(currentFilters, currentZoom, expandedSections, items)] };
    }
    renderFilterSections(currentFilters, currentZoom, expandedSections, items) {
        const { nodeTypeItems, platformItems, projectItems, packageItems } = items;
        return { ["_$litType$"]: lit_template_6, values: [nodeTypeItems, currentFilters.nodeTypes, expandedSections.productTypes, currentZoom, () => this.handleToggleSection('productTypes'), (e) => this.handleItemToggle('nodeType', e.detail.key, e.detail.checked), (e) => this.handlePreviewChange(e.detail), platformItems, currentFilters.platforms, expandedSections.platforms, currentZoom, () => this.handleToggleSection('platforms'), (e) => this.handleItemToggle('platform', e.detail.key, e.detail.checked), (e) => this.handlePreviewChange(e.detail), projectItems, currentFilters.projects, expandedSections.projects, currentZoom, () => this.handleToggleSection('projects'), (e) => this.handleItemToggle('project', e.detail.key, e.detail.checked), (e) => this.handlePreviewChange(e.detail), when(packageItems.length, () => ({ ["_$litType$"]: lit_template_7, values: [] })), when(packageItems.length, () => ({ ["_$litType$"]: lit_template_8, values: [packageItems, currentFilters.packages, expandedSections.packages, currentZoom, () => this.handleToggleSection('packages'), (e) => this.handleItemToggle('package', e.detail.key, e.detail.checked), (e) => this.handlePreviewChange(e.detail)] }))] };
    }
    handleBackToFilters() {
        selectNode(null);
        selectCluster(null);
    }
    renderDetailsToolbar() {
        return { ["_$litType$"]: lit_template_9, values: [this.handleBackToFilters, this.handleToggleCollapse] };
    }
    renderExpandedContent(options) {
        const { selectedNode, selectedCluster, activeDirectDeps, activeTransitiveDeps, activeDirectDependents, activeTransitiveDependents, zoom: currentZoom, filters: currentFilters, searchQuery: currentSearchQuery, isFiltersActive, expandedSections, items, } = options;
        if (selectedNode) {
            return { ["_$litType$"]: lit_template_10, values: [this.renderDetailsToolbar(), this.renderNodeDetails(selectedNode, currentZoom, {
                        activeDirectDeps,
                        activeTransitiveDeps,
                        activeDirectDependents,
                        activeTransitiveDependents,
                    })] };
        }
        if (selectedCluster) {
            return { ["_$litType$"]: lit_template_11, values: [this.renderDetailsToolbar(), this.renderClusterDetails(selectedCluster, currentZoom, {
                        activeDirectDeps,
                        activeDirectDependents,
                    })] };
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
    render() {
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
        const ALL_PLATFORMS = ['iOS', 'macOS', 'tvOS', 'watchOS', 'visionOS'];
        const platformItems = ALL_PLATFORMS.map((platform) => ({
            key: platform,
            count: filterData.platformCounts.get(platform) || 0,
            color: getPlatformColor(platform),
        }));
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
        }
        else {
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
        return { ["_$litType$"]: lit_template_12, values: [when(!this.isViewingDetails || isCollapsed, () => ({ ["_$litType$"]: lit_template_13, values: [this.workspaceName, isCollapsed, isFiltersActive, this.handleToggleCollapse] })), sidebarContent] };
    }
}
__decorate([
    property({ attribute: false })
], GraphRightSidebar.prototype, "allNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphRightSidebar.prototype, "allEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphRightSidebar.prototype, "filteredNodes", void 0);
__decorate([
    property({ attribute: false })
], GraphRightSidebar.prototype, "filteredEdges", void 0);
__decorate([
    property({ attribute: false })
], GraphRightSidebar.prototype, "clusters", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-right-sidebar')) {
    customElements.define('xcode-graph-right-sidebar', GraphRightSidebar);
}
//# sourceMappingURL=right-sidebar.js.map
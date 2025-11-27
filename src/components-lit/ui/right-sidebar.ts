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

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import { createMachineController } from '@/controllers/zag.controller';
import { createStoreController } from '@/controllers/zustand.controller';
import { sidebarMachine, type SidebarSection } from '@/machines/sidebar.machine';
import { useGraphStore } from '@/stores/graphStore';
import { useFilterStore } from '@/stores/filterStore';
import { useUIStore } from '@/stores/uiStore';
import { computeFilters } from '@/utils/nodeUtils';
import { generateColorMap, getNodeTypeColor } from '@/utils/filterHelpers';
import { PLATFORM_COLOR } from '@/utils/platformIcons';
import './right-sidebar-header';
import './collapsed-sidebar';
import './node-details-panel';
import './cluster-details-panel';

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
  clusters: Cluster[] | undefined;

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
      (n) => (n.type === 'package' ? n.name : n.project) === clusterId
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

        ${isCollapsed
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
              ${this.selectedNode.value
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
                    ></graph-node-details-panel>
                  `
                : this.selectedCluster.value
                  ? html`
                      <graph-cluster-details-panel
                        .cluster=${this.findClusterById(this.selectedCluster.value)}
                        .clusterNodes=${this.allNodes.filter(
                          (n) =>
                            (n.type === 'package' ? n.name : n.project) === this.selectedCluster.value,
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
                      <slot name="filter-view"></slot>
                    `}
            `}
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

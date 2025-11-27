/**
 * GraphApp Lit Component
 *
 * Main application component - FULL Lit!
 * Uses Zustand stores and utilities for state management.
 *
 * @example
 * ```html
 * <graph-app></graph-app>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { createStoreController } from '@/controllers/zustand.controller';
import { useGraphStore } from '@/stores/graphStore';
import { useFilterStore } from '@/stores/filterStore';
import { useUIStore, type ActiveTab } from '@/stores/uiStore';
import { applyGraphFilters } from '@/utils/graphFilters';
import { computeTransitiveDependencies } from '@/utils/graphTraversal';
import { mockGraphData } from '@/data/mockGraphData';
import './layout/header';
import './layout/sidebar';
import './layout/placeholder-tab';
import './layout/graph-tab';

const TAB_LABELS: Record<ActiveTab, string> = {
  overview: 'Overview',
  builds: 'Builds',
  'test-runs': 'Test Runs',
  'module-cache': 'Module Cache',
  'xcode-cache': 'Xcode Cache',
  previews: 'Previews',
  qa: 'QA',
  bundles: 'Bundles',
  graph: 'Graph',
};

export class GraphApp extends LitElement {
  // ========================================
  // Zustand Store Subscriptions
  // ========================================

  private selectedNode = createStoreController(this, useGraphStore, (s) => s.selectedNode);
  private viewMode = createStoreController(this, useGraphStore, (s) => s.viewMode);
  private filters = createStoreController(this, useFilterStore, (s) => s.filters);
  private searchQuery = createStoreController(this, useFilterStore, (s) => s.searchQuery);
  private activeTab = createStoreController(this, useUIStore, (s) => s.activeTab);

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--color-background);
      color: var(--color-foreground);
      font-family: 'Inter', sans-serif;
    }

    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
      z-index: 20;
      min-height: 0;
    }

    .content-area {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  connectedCallback() {
    super.connectedCallback();

    // Initialize filters from data
    const initializeFromData = this.filters.getAction('initializeFromData');
    const allProjects = new Set(
      mockGraphData.nodes.map((n) => n.project).filter((p): p is string => p !== undefined && p !== ''),
    );
    const allPackages = new Set(
      mockGraphData.nodes.filter((n) => n.type === 'package').map((n) => n.name),
    );
    initializeFromData(allProjects, allPackages);
  }

  // ========================================
  // Computed Values
  // ========================================

  private get filteredData() {
    return applyGraphFilters(
      mockGraphData.nodes,
      mockGraphData.edges,
      this.filters.value,
      this.searchQuery.value || '',
    );
  }

  private get displayData() {
    const { filteredNodes, filteredEdges } = this.filteredData;

    // Compute transitive dependencies if in focused/dependents/both mode
    const { transitiveDeps, transitiveDependents } = computeTransitiveDependencies(
      this.viewMode.value,
      this.selectedNode.value,
      mockGraphData.edges,
    );

    // In focused/dependents modes, filter to show only relevant nodes
    if (this.viewMode.value === 'focused' && transitiveDeps.nodes.size > 0) {
      const relevantNodes = filteredNodes.filter(
        (n) => n.id === this.selectedNode.value?.id || transitiveDeps.nodes.has(n.id),
      );
      const relevantEdges = filteredEdges.filter((e) => transitiveDeps.edges.has(`${e.source}->${e.target}`));
      return { displayNodes: relevantNodes, displayEdges: relevantEdges, transitiveDeps, transitiveDependents };
    }

    if (this.viewMode.value === 'dependents' && transitiveDependents.nodes.size > 0) {
      const relevantNodes = filteredNodes.filter(
        (n) => n.id === this.selectedNode.value?.id || transitiveDependents.nodes.has(n.id),
      );
      const relevantEdges = filteredEdges.filter((e) => transitiveDependents.edges.has(`${e.source}->${e.target}`));
      return { displayNodes: relevantNodes, displayEdges: relevantEdges, transitiveDeps, transitiveDependents };
    }

    if (this.viewMode.value === 'both') {
      const allRelevantNodes = new Set([
        this.selectedNode.value?.id,
        ...transitiveDeps.nodes,
        ...transitiveDependents.nodes,
      ].filter(Boolean));

      const relevantNodes = filteredNodes.filter((n) => allRelevantNodes.has(n.id));
      const allRelevantEdges = new Set([
        ...Array.from(transitiveDeps.edges),
        ...Array.from(transitiveDependents.edges),
      ]);
      const relevantEdges = filteredEdges.filter((e) => allRelevantEdges.has(`${e.source}->${e.target}`));
      return { displayNodes: relevantNodes, displayEdges: relevantEdges, transitiveDeps, transitiveDependents };
    }

    return {
      displayNodes: filteredNodes,
      displayEdges: filteredEdges,
      transitiveDeps,
      transitiveDependents,
    };
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleTabChange(e: CustomEvent<{ tab: ActiveTab }>) {
    const setActiveTab = this.activeTab.getAction('setActiveTab');
    setActiveTab(e.detail.tab);

    // Reset view when changing tabs
    const resetView = this.selectedNode.getAction('resetView');
    resetView();
  }

  // ========================================
  // Render
  // ========================================

  render() {
    const { displayNodes, displayEdges, transitiveDeps, transitiveDependents } = this.displayData;
    const { filteredNodes, filteredEdges } = this.filteredData;

    return html`
      <graph-header></graph-header>

      <div class="main-layout">
        <graph-sidebar
          active-tab=${this.activeTab.value}
          @tab-change=${this.handleTabChange}
        ></graph-sidebar>

        <div class="content-area">
          ${this.activeTab.value === 'graph'
            ? html`
                <graph-tab
                  .displayNodes=${displayNodes}
                  .displayEdges=${displayEdges}
                  .filteredNodes=${filteredNodes}
                  .filteredEdges=${filteredEdges}
                  .allNodes=${mockGraphData.nodes}
                  .allEdges=${mockGraphData.edges}
                  .transitiveDeps=${transitiveDeps}
                  .transitiveDependents=${transitiveDependents}
                ></graph-tab>
              `
            : html`
                <graph-placeholder-tab title=${TAB_LABELS[this.activeTab.value]}></graph-placeholder-tab>
              `}
        </div>
      </div>
    `;
  }
}

// Register custom element
if (!customElements.get('graph-app')) {
  customElements.define('graph-app', GraphApp);
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-app': GraphApp;
  }
}

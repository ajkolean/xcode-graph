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

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { createStoreController } from '@/controllers/zustand.controller';
import { mockGraphData } from '@/data/mockGraphData';
import { GraphDataService } from '@/services/graphDataService';
import { useDataStore } from '@/stores/dataStore';
import { useFilterStore } from '@/stores/filterStore';
import { useGraphStore } from '@/stores/graphStore';
import { type ActiveTab, useUIStore } from '@/stores/uiStore';
import './layout/header';
import './layout/sidebar';
import './layout/placeholder-tab';
import './layout/graph-tab';
import './ui/cycle-warning';

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
  // Data Service
  // ========================================
  private graphDataService = new GraphDataService(mockGraphData.nodes, mockGraphData.edges);

  // ========================================
  // Zustand Store Subscriptions
  // ========================================

  private selectedNode = createStoreController(this, useGraphStore, (s) => s.selectedNode);
  private viewMode = createStoreController(this, useGraphStore, (s) => s.viewMode);
  private circularDependencies = createStoreController(
    this,
    useGraphStore,
    (s) => s.circularDependencies,
  );
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

    // Initialize data store with graph data
    useDataStore.getState().setGraphData(mockGraphData.nodes, mockGraphData.edges);

    // Initialize filters from data
    const initializeFromData = this.filters.getAction('initializeFromData');
    const allProjects = new Set(
      mockGraphData.nodes
        .map((n) => n.project)
        .filter((p): p is string => p !== undefined && p !== ''),
    );
    const allPackages = new Set(
      mockGraphData.nodes.filter((n) => n.type === 'package').map((n) => n.name),
    );
    initializeFromData(allProjects, allPackages);

    // Detect circular dependencies
    const cycles = this.graphDataService.findCircularDependencies();
    const setCircularDependencies = this.circularDependencies.getAction('setCircularDependencies');
    setCircularDependencies(cycles);

    if (cycles.length > 0) {
      console.warn(
        `[GraphApp] Detected ${cycles.length} circular ${cycles.length === 1 ? 'dependency' : 'dependencies'}:`,
        cycles,
      );
    }
  }

  // ========================================
  // Computed Values (Memoized via DataStore)
  // ========================================

  private get filteredData() {
    // Use memoized version from data store
    return useDataStore
      .getState()
      .getFilteredData(this.filters.value, this.searchQuery.value || '');
  }

  private get displayData() {
    // Use memoized version from data store - only recomputes when dependencies change
    const data = useDataStore
      .getState()
      .getDisplayData(
        this.filters.value,
        this.searchQuery.value || '',
        this.viewMode.value,
        this.selectedNode.value,
      );

    return {
      displayNodes: data.filteredNodes,
      displayEdges: data.filteredEdges,
      transitiveDeps: data.transitiveDeps,
      transitiveDependents: data.transitiveDependents,
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

      ${
        this.circularDependencies.value.length > 0
          ? html`<graph-cycle-warning .cycles=${this.circularDependencies.value}></graph-cycle-warning>`
          : null
      }

      <div class="main-layout">
        <graph-sidebar
          active-tab=${this.activeTab.value}
          @tab-change=${this.handleTabChange}
        ></graph-sidebar>

        <div class="content-area">
          ${
            this.activeTab.value === 'graph'
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
              `
          }
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

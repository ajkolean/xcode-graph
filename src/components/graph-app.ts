/**
 * GraphApp Lit Component - Main Application Entry
 *
 * Root application component that orchestrates the entire graph visualization.
 * Uses Lit Signals for state management and coordinates all child components.
 *
 * **Features:**
 * - Tab navigation (Graph, Builds, Test Runs, etc.)
 * - Circular dependency detection and warning
 * - Filter and search state management
 * - Automatic memoized data computation via computed signals
 *
 * @module components/graph-app
 *
 * @example
 * ```html
 * <graph-app></graph-app>
 * ```
 */

import { SignalWatcher } from '@lit-labs/signals';
import type { ActiveTab } from '@shared/schemas';
import { css, html, LitElement } from 'lit';
import { mockGraphData } from '@/fixtures/largeGraph';
import { GraphAnalysisService } from '@/services/graphAnalysisService';
import { GraphDataService } from '@/services/graphDataService';
import '@ui/layout/graph-tab';
import '@ui/layout/header';
import '@ui/layout/placeholder-tab';
import '@ui/layout/sidebar';
import '@ui/components/cycle-warning';
import '@ui/components/error-notification-container';

// Import signals and actions from graph module
import {
  edges as allEdges,
  nodes as allNodes,
  circularDependencies,
  displayData,
  filteredData,
  resetView,
  setCircularDependencies,
  setGraphData,
} from '@graph/signals/index';

// Import signals and actions from shared module
import { activeTab, initializeFromData, setActiveTab } from '@shared/signals/index';

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

export class GraphApp extends SignalWatcher(LitElement) {
  // ========================================
  // Data Service
  // ========================================
  private graphDataService: GraphDataService | null = null;
  private dataFingerprint: string | null = null;
  private filtersInitialized = false;

  private refreshGraphData(nodes: typeof mockGraphData.nodes, edges: typeof mockGraphData.edges) {
    const fingerprint = `${nodes.length}-${edges.length}-${nodes.map((n) => n.id).join(',')}-${edges.map((e) => `${e.source}->${e.target}`).join(',')}`;
    if (fingerprint === this.dataFingerprint) return;
    this.dataFingerprint = fingerprint;

    this.graphDataService = new GraphDataService(nodes, edges);

    // Only seed filters once; otherwise we would overwrite user selections
    if (!this.filtersInitialized) {
      initializeFromData(
        this.graphDataService.getAllProjects(),
        this.graphDataService.getAllPackages(),
      );
      this.filtersInitialized = true;
    }

    const cycles = GraphAnalysisService.findCircularDependencies(this.graphDataService);
    setCircularDependencies(cycles);

    if (cycles.length > 0) {
      console.warn(
        `[GraphApp] Detected ${cycles.length} circular ${cycles.length === 1 ? 'dependency' : 'dependencies'}:`,
        cycles,
      );
    }
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--color-background);
      color: var(--color-foreground);
      font-family: var(--fonts-body);
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

  override connectedCallback() {
    super.connectedCallback();

    // Initialize data signals with graph data
    setGraphData(mockGraphData.nodes, mockGraphData.edges);
    this.refreshGraphData(mockGraphData.nodes, mockGraphData.edges);
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleTabChange(e: CustomEvent<{ tab: ActiveTab }>) {
    setActiveTab(e.detail.tab);
    // Reset view when changing tabs
    resetView();
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    // Keep derived graph data (filters, cycles) in sync if graph data changes later
    this.refreshGraphData(allNodes.get(), allEdges.get());

    // Access computed signals - automatically tracks dependencies
    const display = displayData.get();
    const filtered = filteredData.get();
    const cycles = circularDependencies.get();
    const currentTab = activeTab.get();

    return html`
      <graph-header></graph-header>

      ${
        cycles.length > 0
          ? html`<graph-cycle-warning .cycles=${cycles}></graph-cycle-warning>`
          : null
      }

      <div class="main-layout">
        <graph-sidebar
          active-tab=${currentTab}
          @tab-change=${this.handleTabChange}
        ></graph-sidebar>

        <div class="content-area">
          ${
            currentTab === 'graph'
              ? html`
                <graph-tab
                  .displayNodes=${display.filteredNodes}
                  .displayEdges=${display.filteredEdges}
                  .filteredNodes=${filtered.filteredNodes}
                  .filteredEdges=${filtered.filteredEdges}
                  .allNodes=${allNodes.get()}
                  .allEdges=${allEdges.get()}
                  .transitiveDeps=${display.transitiveDeps}
                  .transitiveDependents=${display.transitiveDependents}
                ></graph-tab>
              `
              : html`
                <graph-placeholder-tab title=${TAB_LABELS[currentTab]}></graph-placeholder-tab>
              `
          }
        </div>
      </div>

      <graph-error-notification-container></graph-error-notification-container>
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

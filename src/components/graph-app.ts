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
import { GraphDataService } from '@/services/graphDataService';
import '@ui/layout/graph-tab';
import '@ui/layout/header';
import '@ui/layout/placeholder-tab';
import '@ui/layout/sidebar';
import '@ui/components/cycle-warning';

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
  private readonly graphDataService = new GraphDataService(
    mockGraphData.nodes,
    mockGraphData.edges,
  );

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

    // Initialize filters from data
    const projects = new Set(
      mockGraphData.nodes
        .map((n) => n.project)
        .filter((p): p is string => p !== undefined && p !== ''),
    );
    const packages = new Set(
      mockGraphData.nodes.filter((n) => n.type === 'package').map((n) => n.name),
    );
    initializeFromData(projects, packages);

    // Detect circular dependencies
    const cycles = this.graphDataService.findCircularDependencies();
    setCircularDependencies(cycles);

    if (cycles.length > 0) {
      console.warn(
        `[GraphApp] Detected ${cycles.length} circular ${cycles.length === 1 ? 'dependency' : 'dependencies'}:`,
        cycles,
      );
    }
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

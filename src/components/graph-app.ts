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
import { css, html, LitElement } from 'lit';
import { tuistGraphData } from '@/fixtures/tuist-graph-data';
import { GraphAnalysisService } from '@/services/graphAnalysisService';
import { GraphDataService } from '@/services/graphDataService';
import '@ui/layout/graph-tab';
import '@ui/components/error-notification-container';

// Import signals and actions from graph module
import {
  edges as allEdges,
  nodes as allNodes,
  displayData,
  filteredData,
  setCircularDependencies,
  setGraphData,
} from '@graph/signals/index';

// Import signals and actions from shared module
import { initializeFromData } from '@shared/signals/index';

export class GraphApp extends SignalWatcher(LitElement) {
  // ========================================
  // Data Service
  // ========================================
  private graphDataService: GraphDataService | null = null;
  private dataFingerprint: string | null = null;
  private filtersInitialized = false;

  private refreshGraphData(nodes: typeof tuistGraphData.nodes, edges: typeof tuistGraphData.edges) {
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
  `;

  // ========================================
  // Lifecycle
  // ========================================

  override connectedCallback() {
    super.connectedCallback();

    // Initialize data signals with graph data
    setGraphData(tuistGraphData.nodes, tuistGraphData.edges);
    this.refreshGraphData(tuistGraphData.nodes, tuistGraphData.edges);
  }

  override updated(): void {
    this.refreshGraphData(allNodes.get(), allEdges.get());
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    const display = displayData.get();
    const filtered = filteredData.get();

    return html`
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

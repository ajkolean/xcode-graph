/**
 * GraphApp Lit Component - Embeddable Graph Visualization
 *
 * Root application component that orchestrates the entire graph visualization.
 * Accepts graph data via `.nodes` and `.edges` properties, making it a
 * self-contained web component that can be embedded in any host application.
 *
 * @module components/graph-app
 *
 * @example
 * ```html
 * <!-- Standalone (uses built-in demo data) -->
 * <graph-app></graph-app>
 *
 * <!-- Embedded with custom data -->
 * <graph-app .nodes=${myNodes} .edges=${myEdges}></graph-app>
 * ```
 */

import { SignalWatcher } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
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
  // Public Properties
  // ========================================

  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  // ========================================
  // Data Service
  // ========================================
  private graphDataService: GraphDataService | null = null;
  private dataFingerprint: string | null = null;
  private filtersInitialized = false;

  private refreshGraphData(nodes: GraphNode[], edges: GraphEdge[]) {
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
      height: 100%;
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
    this.seedData();
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('nodes') || changed.has('edges')) {
      this.seedData();
    }
  }

  private seedData(): void {
    if (!this.nodes?.length) return;
    setGraphData(this.nodes, this.edges ?? []);
    this.refreshGraphData(this.nodes, this.edges ?? []);
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

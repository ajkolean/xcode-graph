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
 * <xcode-graph></xcode-graph>
 *
 * <!-- Embedded with custom data -->
 * <xcode-graph .nodes=${myNodes} .edges=${myEdges}></xcode-graph>
 * ```
 */

import type { LayoutOptions } from '@graph/layout/config';
import { SignalWatcher } from '@lit-labs/signals';
import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { ErrorService } from '@/services/error-service';
import { GraphAnalysisService } from '@/services/graph-analysis-service';
import { GraphDataService } from '@/services/graph-data-service';
import { transformXcodeGraph } from '@/services/xcode-graph.service';
import '@ui/layout/graph-tab';
import '@ui/components/toast-container';
import '@ui/components/file-upload';

import {
  edges as allEdges,
  nodes as allNodes,
  displayData,
  filteredData,
  setCircularDependencies,
  setGraphData,
} from '@graph/signals/index';

import { initializeFromData } from '@shared/signals/index';

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

/**
 * Root application component that orchestrates the entire graph visualization.
 * Accepts graph data via `.nodes` and `.edges` properties, making it a
 * self-contained web component that can be embedded in any host application.
 *
 * @summary Embeddable graph visualization entry point
 */
export class GraphApp extends SignalWatcherLitElement {
  @property({ attribute: false })
  declare nodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  declare layoutOptions: LayoutOptions | undefined;

  @property({ type: Boolean, attribute: 'show-upload' })
  declare showUpload: boolean;

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

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      position: relative;
      height: 100%;
      font-family: var(--fonts-body);
      overflow: hidden;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.seedData();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('nodes') || changed.has('edges')) {
      this.seedData();
    }
  }

  private seedData(): void {
    if (!this.nodes?.length) return;
    setGraphData(this.nodes, this.edges ?? []);
    this.refreshGraphData(this.nodes, this.edges ?? []);
  }

  /**
   * Load raw Tuist graph JSON (the output of `tuist graph --format json`).
   * Transforms it into GraphData and sets nodes/edges automatically.
   * Shows user-facing warnings/errors via ErrorService if the transform has issues.
   */
  public loadRawGraph(raw: unknown): void {
    try {
      const result = transformXcodeGraph(raw);

      if (result.warnings.length > 0) {
        const errorService = ErrorService.getInstance();
        errorService.handleWarning(
          `Graph loaded with ${result.warnings.length} compatibility warning(s)`,
          ErrorCategory.Data,
        );
        for (const warning of result.warnings) {
          console.warn('[GraphApp]', warning);
        }
      }

      if (result.data.nodes.length === 0) {
        const errorService = ErrorService.getInstance();
        errorService.handleError(new Error('Graph transform produced no nodes'), {
          severity: ErrorSeverity.Error,
          category: ErrorCategory.Data,
          userMessage: 'Failed to load graph: no nodes found in the data',
        });
        return;
      }

      this.nodes = result.data.nodes;
      this.edges = result.data.edges;
    } catch (error) {
      const errorService = ErrorService.getInstance();
      errorService.handleError(error, {
        severity: ErrorSeverity.Critical,
        category: ErrorCategory.Data,
        userMessage: 'Failed to load graph data — the format may be incompatible',
        dismissible: false,
      });
    }
  }

  private handleFileLoaded(e: CustomEvent<{ raw: unknown }>) {
    this.loadRawGraph(e.detail.raw);
  }

  override render(): TemplateResult {
    const display = displayData.get();
    const filtered = filteredData.get();

    return html`
      <xcode-graph-tab
        .displayNodes=${display.filteredNodes}
        .displayEdges=${display.filteredEdges}
        .filteredNodes=${filtered.filteredNodes}
        .filteredEdges=${filtered.filteredEdges}
        .allNodes=${allNodes.get()}
        .allEdges=${allEdges.get()}
        .transitiveDeps=${display.transitiveDeps}
        .transitiveDependents=${display.transitiveDependents}
      ></xcode-graph-tab>

      ${
        this.showUpload
          ? html`<xcode-graph-file-upload
            @graph-file-loaded=${this.handleFileLoaded}
          ></xcode-graph-file-upload>`
          : ''
      }

      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `;
  }
}

// Register custom element
if (!customElements.get('xcode-graph')) {
  customElements.define('xcode-graph', GraphApp);
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph': GraphApp;
  }
}

/**
 * GraphTab Lit Component
 *
 * Main graph tab orchestrator - coordinates GraphVisualization and RightSidebar.
 * Uses Lit Signals for state management.
 *
 * @example
 * ```html
 * <graph-tab
 *   .displayNodes=${nodes}
 *   .displayEdges=${edges}
 *   .allNodes=${allNodes}
 * ></graph-tab>
 * ```
 */

import type { GraphCanvas } from '@graph/components/graph-canvas';
import type { TransitiveResult } from '@graph/utils';
import { computed, Signal, SignalWatcher, watch } from '@lit-labs/signals';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@graph/components/graph-canvas';
import '@graph/components/graph-overlays';
import '../components/right-sidebar';

// Import signals
// Import actions
import {
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  hoveredNode,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setHoveredNode,
  viewMode,
} from '@graph/signals/index';
import {
  baseZoom,
  enableAnimation,
  previewFilter,
  searchQuery,
  setZoom,
  toggleAnimation,
  zoom,
  zoomIn,
  zoomOut,
} from '@shared/signals/index';

/** Computed: search query with empty string fallback (avoids attribute removal) */
const searchQueryValue = computed(() => searchQuery.get() || '');

const SignalWatcherLitElement = SignalWatcher(LitElement) as typeof LitElement;

export class GraphTab extends SignalWatcherLitElement {
  // ========================================
  // Properties
  // ========================================

  @query('graph-canvas')
  private declare canvasElement: GraphCanvas;

  @property({ attribute: false })
  declare displayNodes: GraphNode[];

  @property({ attribute: false })
  declare displayEdges: GraphEdge[];

  @property({ attribute: false })
  declare filteredNodes: GraphNode[];

  @property({ attribute: false })
  declare filteredEdges: GraphEdge[];

  @property({ attribute: false })
  declare allNodes: GraphNode[];

  @property({ attribute: false })
  declare allEdges: GraphEdge[];

  @property({ attribute: false })
  declare clusters: Cluster[] | undefined;

  @property({ attribute: false })
  declare transitiveDeps: TransitiveResult;

  @property({ attribute: false })
  declare transitiveDependents: TransitiveResult;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    .content {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
      min-height: 0;
    }

    .graph-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }
  `;

  // ========================================
  // Event Handlers (delegate to signal actions)
  // ========================================

  private handleNodeSelect(e: CustomEvent) {
    selectNode(e.detail.node);
  }

  private handleClusterSelect(e: CustomEvent) {
    selectCluster(e.detail.clusterId);
  }

  private handleNodeHover(e: CustomEvent) {
    setHoveredNode(e.detail.nodeId);
  }

  private handleZoomIn() {
    zoomIn();
  }

  private handleZoomOut() {
    zoomOut();
  }

  private handleZoomStep(e: CustomEvent<number>) {
    setZoom(e.detail);
  }

  private handleZoomReset() {
    // Fit to viewport instead of resetting to 1.0
    this.canvasElement?.fitToViewport();
  }

  private handleToggleAnimation() {
    toggleAnimation();
  }

  private handleZoomChange(e: CustomEvent) {
    setZoom(e.detail);
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    return html`
      <div class="container">
        <!-- Graph + Sidebar -->
        <div class="content">
          <div class="graph-container">
            <graph-controls
              .zoom=${watch(zoom)}
              .baseZoom=${watch(baseZoom)}
              .nodeCount=${this.displayNodes.length}
              .edgeCount=${this.displayEdges.length}
              ?enable-animation=${watch(enableAnimation)}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-step=${this.handleZoomStep}
              @zoom-reset=${this.handleZoomReset}
              @toggle-animation=${this.handleToggleAnimation}
            ></graph-controls>

            <graph-canvas
              .nodes=${this.displayNodes}
              .edges=${this.displayEdges}
              .selectedNode=${watch(selectedNode)}
              .selectedCluster=${watch(selectedCluster)}
              .hoveredNode=${Signal.subtle.untrack(() => hoveredNode.get())}
              search-query=${watch(searchQueryValue)}
              view-mode=${watch(viewMode)}
              .zoom=${watch(zoom)}
              ?enable-animation=${watch(enableAnimation)}
              .transitiveDeps=${this.transitiveDeps}
              .transitiveDependents=${this.transitiveDependents}
              .previewFilter=${watch(previewFilter)}
              ?show-direct-deps=${watch(highlightDirectDeps)}
              ?show-transitive-deps=${watch(highlightTransitiveDeps)}
              ?show-direct-dependents=${watch(highlightDirectDependents)}
              ?show-transitive-dependents=${watch(highlightTransitiveDependents)}
              @node-select=${this.handleNodeSelect}
              @cluster-select=${this.handleClusterSelect}
              @node-hover=${this.handleNodeHover}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-reset=${this.handleZoomReset}
              @zoom-change=${this.handleZoomChange}
              @toggle-animation=${this.handleToggleAnimation}
            ></graph-canvas>
          </div>

          <!-- Right Sidebar -->
          <graph-right-sidebar
            .allNodes=${this.allNodes}
            .allEdges=${this.allEdges}
            .filteredNodes=${this.filteredNodes}
            .filteredEdges=${this.filteredEdges}
            .clusters=${this.clusters}
            collapsed
          >
            <slot name="filter-view" slot="filter-view"></slot>
          </graph-right-sidebar>
        </div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-tab': GraphTab;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-tab')) {
  customElements.define('graph-tab', GraphTab);
}

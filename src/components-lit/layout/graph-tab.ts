/**
 * GraphTab Lit Component
 *
 * Main graph tab orchestrator - coordinates GraphVisualization and RightSidebar.
 * Uses Zustand stores for state management.
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

import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import { createStoreController } from '@/controllers/zustand.controller';
import { useGraphStore } from '@/stores/graphStore';
import { useFilterStore } from '@/stores/filterStore';
import { useUIStore } from '@/stores/uiStore';
import '../graph/graph-visualization';
import '../ui/right-sidebar';

export class GraphTab extends LitElement {
  // ========================================
  // Properties
  // ========================================

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
  declare transitiveDeps: any;

  @property({ attribute: false })
  declare transitiveDependents: any;

  // ========================================
  // Zustand Store Subscriptions
  // ========================================

  // Graph store
  private selectedNode = createStoreController(this, useGraphStore, (s) => s.selectedNode);
  private selectedCluster = createStoreController(this, useGraphStore, (s) => s.selectedCluster);
  private hoveredNode = createStoreController(this, useGraphStore, (s) => s.hoveredNode);
  private viewMode = createStoreController(this, useGraphStore, (s) => s.viewMode);

  // Filter store
  private searchQuery = createStoreController(this, useFilterStore, (s) => s.searchQuery);

  // UI store
  private zoom = createStoreController(this, useUIStore, (s) => s.zoom);
  private enableAnimation = createStoreController(this, useUIStore, (s) => s.enableAnimation);
  private previewFilter = createStoreController(this, useUIStore, (s) => s.previewFilter);

  // ========================================
  // Styles
  // ========================================

  static styles = css`
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
  // Event Handlers (delegate to stores)
  // ========================================

  private handleNodeSelect(e: CustomEvent) {
    const selectNode = this.selectedNode.getAction('selectNode');
    selectNode(e.detail.node);
  }

  private handleClusterSelect(e: CustomEvent) {
    const selectCluster = this.selectedCluster.getAction('selectCluster');
    selectCluster(e.detail.clusterId);
  }

  private handleNodeHover(e: CustomEvent) {
    const setHoveredNode = this.hoveredNode.getAction('setHoveredNode');
    setHoveredNode(e.detail.nodeId);
  }

  private handleZoomIn() {
    const zoomIn = this.zoom.getAction('zoomIn');
    zoomIn();
  }

  private handleZoomOut() {
    const zoomOut = this.zoom.getAction('zoomOut');
    zoomOut();
  }

  private handleZoomReset() {
    const resetZoom = this.zoom.getAction('resetZoom');
    resetZoom();
  }

  private handleToggleAnimation() {
    const toggleAnimation = this.enableAnimation.getAction('toggleAnimation');
    toggleAnimation();
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container">
        <!-- Graph + Sidebar -->
        <div class="content">
          <!-- Graph Visualization -->
          <div class="graph-container">
            <graph-visualization
              .nodes=${this.displayNodes}
              .edges=${this.displayEdges}
              .selectedNode=${this.selectedNode.value}
              .selectedCluster=${this.selectedCluster.value}
              .hoveredNode=${this.hoveredNode.value}
              search-query=${this.searchQuery.value || ''}
              view-mode=${this.viewMode.value}
              .zoom=${this.zoom.value}
              ?enable-animation=${this.enableAnimation.value}
              .transitiveDeps=${this.transitiveDeps}
              .transitiveDependents=${this.transitiveDependents}
              .previewFilter=${this.previewFilter.value}
              @node-select=${this.handleNodeSelect}
              @cluster-select=${this.handleClusterSelect}
              @node-hover=${this.handleNodeHover}
              @zoom-in=${this.handleZoomIn}
              @zoom-out=${this.handleZoomOut}
              @zoom-reset=${this.handleZoomReset}
              @toggle-animation=${this.handleToggleAnimation}
            ></graph-visualization>
          </div>

          <!-- Right Sidebar -->
          <graph-right-sidebar
            .allNodes=${this.allNodes}
            .allEdges=${this.allEdges}
            .filteredNodes=${this.filteredNodes}
            .filteredEdges=${this.filteredEdges}
            .clusters=${this.clusters}
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

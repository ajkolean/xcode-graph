/**
 * ClusterDetailsPanel Lit Component
 *
 * Full cluster details panel orchestrating all cluster detail components.
 *
 * @example
 * ```html
 * <graph-cluster-details-panel
 *   .cluster=${clusterData}
 *   .clusterNodes=${nodes}
 *   .edges=${edges}
 * ></graph-cluster-details-panel>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import { computeClusterStats } from '@/utils/nodeUtils';
import { generateColor } from '@/utils/colorGenerator';
import { adjustColorForZoom } from '@/utils/zoomColorUtils';
import './cluster-header';
import './cluster-type-badge';
import './cluster-stats';
import './cluster-targets-list';

@customElement('graph-cluster-details-panel')
export class GraphClusterDetailsPanel extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare cluster: Cluster;

  @property({ attribute: false })
  declare clusterNodes: GraphNode[];

  @property({ attribute: false })
  declare allNodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  filteredEdges: GraphEdge[] | undefined;

  @property({ type: Number })
  zoom: number = 1.0;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .scrollable {
      flex: 1;
      overflow-y: auto;
    }
  `;

  // ========================================
  // Computed Values
  // ========================================

  private get stats() {
    return computeClusterStats(this.clusterNodes, this.edges, this.filteredEdges);
  }

  private get clusterColor() {
    return adjustColorForZoom(generateColor(this.cluster.name, this.cluster.type), this.zoom);
  }

  // ========================================
  // Event Handlers
  // ========================================

  private bubbleEvent(eventName: string, detail?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.cluster) return html``;

    const isExternal = this.cluster.name === 'External';

    return html`
      <graph-cluster-header
        cluster-name=${this.cluster.name}
        cluster-type=${this.cluster.type}
        cluster-color=${this.clusterColor}
        ?is-external=${isExternal}
        @back=${() => this.bubbleEvent('close')}
      ></graph-cluster-header>

      <graph-cluster-type-badge
        cluster-type=${this.cluster.type}
        cluster-color=${this.clusterColor}
      ></graph-cluster-type-badge>

      <div class="scrollable">
        <graph-cluster-stats
          filtered-dependencies=${this.stats.filteredDependencies}
          total-dependencies=${this.stats.totalDependencies}
          filtered-dependents=${this.stats.filteredDependents}
          total-dependents=${this.stats.totalDependents}
          .platforms=${this.stats.platforms}
        ></graph-cluster-stats>

        <graph-cluster-targets-list
          .clusterNodes=${this.clusterNodes}
          @node-select=${(e: CustomEvent) => this.bubbleEvent('node-select', e.detail)}
          @node-hover=${(e: CustomEvent) => this.bubbleEvent('node-hover', e.detail)}
        ></graph-cluster-targets-list>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-cluster-details-panel': GraphClusterDetailsPanel;
  }
}

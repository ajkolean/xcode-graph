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

import { computeClusterStats } from '@graph/utils/node-utils';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { generateColor } from '@ui/utils/color-generator';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import './cluster-header';
import './cluster-type-badge';
import './cluster-stats';
import './cluster-targets-list';

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
  declare filteredEdges: GraphEdge[] | undefined;

  @property({ type: Number })
  declare zoom: number;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
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

  private bubbleEvent(eventName: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.cluster) return html``;

    const isExternal = this.cluster.origin === 'external';

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
          .nodesByType=${this.clusterNodes.reduce(
            (acc, node) => {
              const type = node.type;
              acc[type] ??= [];
              acc[type].push(node);
              return acc;
            },
            {} as Record<string, GraphNode[]>,
          )}
          filtered-targets-count=${this.stats.filteredTargetsCount}
          total-targets-count=${this.clusterNodes.length}
          .edges=${this.edges}
          .zoom=${this.zoom}
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

// Register custom element with HMR support
if (!customElements.get('graph-cluster-details-panel')) {
  customElements.define('graph-cluster-details-panel', GraphClusterDetailsPanel);
}

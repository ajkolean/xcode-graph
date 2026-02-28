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
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './cluster-composition.js';
import './cluster-header';
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

  @property({ type: Boolean, attribute: 'active-direct-deps' })
  declare activeDirectDeps: boolean;

  @property({ type: Boolean, attribute: 'active-direct-dependents' })
  declare activeDirectDependents: boolean;

  @property({ type: Number })
  declare zoom: number;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      animation: panelSlideIn var(--durations-slow) var(--easings-out);
    }

    @keyframes panelSlideIn {
      from {
        opacity: 0;
        transform: translateX(12px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .scrollable {
      flex: 1;
      overflow-y: auto;
      padding-bottom: var(--spacing-lg);
      scrollbar-width: thin;
      scrollbar-color: rgba(var(--colors-primary-rgb), var(--opacity-20)) transparent;
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

  private get targetBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const node of this.clusterNodes) {
      breakdown[node.type] = (breakdown[node.type] || 0) + 1;
    }
    return breakdown;
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

  override render(): TemplateResult {
    if (!this.cluster) return html``;

    const isExternal = this.cluster.origin === 'external';

    return html`
      <div class="scrollable">
        <graph-cluster-header
          cluster-name=${this.cluster.name}
          cluster-type=${this.cluster.type}
          cluster-color=${this.clusterColor}
          cluster-path=${this.cluster.path || ''}
          ?is-external=${isExternal}
          @back=${() => this.bubbleEvent('close')}
        ></graph-cluster-header>

        <graph-cluster-stats
          filtered-dependencies=${this.stats.filteredDependencies}
          total-dependencies=${this.stats.totalDependencies}
          filtered-dependents=${this.stats.filteredDependents}
          total-dependents=${this.stats.totalDependents}
          ?active-direct-deps=${this.activeDirectDeps}
          ?active-direct-dependents=${this.activeDirectDependents}
          .platforms=${this.stats.platforms}
          .targetBreakdown=${this.targetBreakdown}
        ></graph-cluster-stats>

        <graph-cluster-composition
          .nodes=${this.clusterNodes}
        ></graph-cluster-composition>

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

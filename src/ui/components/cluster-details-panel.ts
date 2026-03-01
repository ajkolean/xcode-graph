/**
 * ClusterDetailsPanel Lit Component
 *
 * Full cluster details panel orchestrating all cluster detail components.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-details-panel
 *   .cluster=${clusterData}
 *   .clusterNodes=${nodes}
 *   .edges=${edges}
 * ></xcode-graph-cluster-details-panel>
 * ```
 */

import { computeClusterStats } from '@graph/utils/node-utils';
import { FocusTrapController } from '@shared/controllers/focus-trap.controller';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { generateColor } from '@ui/utils/color-generator';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import './cluster-composition.js';
import './cluster-header';
import './cluster-stats';
import './cluster-targets-list';

/**
 * Full cluster details panel orchestrating all cluster detail components
 * including header, stats, composition, and targets list.
 *
 * @summary Cluster details panel with header, stats, and targets
 *
 * @fires close - Dispatched when the back button is clicked
 * @fires node-select - Dispatched when a target node is selected (detail: { node })
 * @fires node-hover - Dispatched when a target node is hovered (detail: { nodeId })
 */
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
  // Controllers
  // ========================================

  private readonly focusTrap = new FocusTrapController(this, {
    isActive: () => !!this.cluster,
    onDeactivate: () => this.bubbleEvent('close'),
    escapeDeactivates: true,
    clickOutsideDeactivates: true,
  });

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
    // Reference focusTrap to ensure controller is not tree-shaken
    void this.focusTrap.active;
    if (!this.cluster) return html``;

    const isExternal = this.cluster.origin === 'external';

    return html`
      <div class="scrollable">
        <xcode-graph-cluster-header
          cluster-name=${this.cluster.name}
          cluster-type=${this.cluster.type}
          cluster-color=${this.clusterColor}
          cluster-path=${this.cluster.path || ''}
          ?is-external=${isExternal}
          @back=${() => this.bubbleEvent('close')}
        ></xcode-graph-cluster-header>

        <xcode-graph-cluster-stats
          filtered-dependencies=${this.stats.filteredDependencies}
          total-dependencies=${this.stats.totalDependencies}
          filtered-dependents=${this.stats.filteredDependents}
          total-dependents=${this.stats.totalDependents}
          ?active-direct-deps=${this.activeDirectDeps}
          ?active-direct-dependents=${this.activeDirectDependents}
          .platforms=${this.stats.platforms}
          .targetBreakdown=${this.targetBreakdown}
        ></xcode-graph-cluster-stats>

        <xcode-graph-cluster-composition
          .nodes=${this.clusterNodes}
        ></xcode-graph-cluster-composition>

        <xcode-graph-cluster-targets-list
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
          @node-select=${(e: CustomEvent<{ node: GraphNode | null }>) => this.bubbleEvent('node-select', e.detail)}
          @node-hover=${(e: CustomEvent<{ nodeId: string | null }>) => this.bubbleEvent('node-hover', e.detail)}
        ></xcode-graph-cluster-targets-list>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cluster-details-panel': GraphClusterDetailsPanel;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-details-panel')) {
  customElements.define('xcode-graph-cluster-details-panel', GraphClusterDetailsPanel);
}

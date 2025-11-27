/**
 * NodeDetailsPanel Lit Component
 *
 * Full node details panel orchestrating all node detail components.
 * Uses utility function for dependency computation.
 *
 * @example
 * ```html
 * <graph-node-details-panel
 *   .node=${nodeData}
 *   .allNodes=${nodes}
 *   .edges=${edges}
 *   zoom="1.0"
 * ></graph-node-details-panel>
 * ```
 *
 * @fires close, node-select, cluster-select, node-hover, focus-node, show-dependents, show-impact
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import { computeNodeDependencies } from '@/utils/nodeUtils';
import './node-header';
import './node-info';
import './node-actions';
import './dependencies-list';
import './dependents-list';

@customElement('graph-node-details-panel')
export class GraphNodeDetailsPanel extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  @property({ attribute: false })
  declare allNodes: GraphNode[];

  @property({ attribute: false })
  declare edges: GraphEdge[];

  @property({ attribute: false })
  filteredEdges: GraphEdge[] | undefined;

  @property({ attribute: false })
  clusters: Cluster[] | undefined;

  @property({ type: String, attribute: 'view-mode' })
  viewMode: string = '';

  @property({ type: Number })
  declare zoom: number;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
  `;

  // ========================================
  // Computed Values
  // ========================================

  private get nodeData() {
    return computeNodeDependencies(this.node, this.allNodes, this.edges, this.filteredEdges);
  }

  // ========================================
  // Event Handlers (bubble up)
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
    if (!this.node) return html``;

    const { dependencies, dependents, metrics } = this.nodeData;

    return html`
      <graph-node-header
        .node=${this.node}
        .zoom=${this.zoom}
        @close=${() => this.bubbleEvent('close')}
        @cluster-click=${(e: CustomEvent) => this.bubbleEvent('cluster-select', e.detail)}
      ></graph-node-header>

      <graph-metrics-section
        dependencies-count=${metrics.dependencyCount}
        dependents-count=${metrics.dependentCount}
        total-dependencies-count=${metrics.totalDependencyCount}
        total-dependents-count=${metrics.totalDependentCount}
      ></graph-metrics-section>

      <graph-node-actions
        .node=${this.node}
        view-mode=${this.viewMode}
        @focus-node=${(e: CustomEvent) => this.bubbleEvent('focus-node', e.detail)}
        @show-dependents=${(e: CustomEvent) => this.bubbleEvent('show-dependents', e.detail)}
        @show-impact=${(e: CustomEvent) => this.bubbleEvent('show-impact', e.detail)}
      ></graph-node-actions>

      <graph-dependencies-list
        .dependencies=${dependencies}
        @node-select=${(e: CustomEvent) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent) => this.bubbleEvent('node-hover', e.detail)}
      ></graph-dependencies-list>

      <graph-dependents-list
        .dependents=${dependents}
        @node-select=${(e: CustomEvent) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent) => this.bubbleEvent('node-hover', e.detail)}
      ></graph-dependents-list>

      <graph-node-info .node=${this.node}></graph-node-info>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-details-panel': GraphNodeDetailsPanel;
  }
}

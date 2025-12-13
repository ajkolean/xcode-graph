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

import { computeNodeDependencies } from '@graph/utils/node-utils';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { css, html, LitElement, nothing } from 'lit';
import './build-settings.js';
import './node-header';
import './node-info';
import './node-actions';
import './node-list.js';
import type { Cluster } from '@shared/schemas';

export class GraphNodeDetailsPanel extends LitElement {
  static override readonly properties = {
    node: { attribute: false },
    allNodes: { attribute: false },
    edges: { attribute: false },
    filteredEdges: { attribute: false },
    clusters: { attribute: false },
    viewMode: { type: String, attribute: 'view-mode' },
    zoom: { type: Number },
  };

  // ========================================
  // Properties
  // ========================================

  declare node: GraphNode;

  declare allNodes: GraphNode[];

  declare edges: GraphEdge[];

  declare filteredEdges: GraphEdge[] | undefined;

  declare clusters: Cluster[] | undefined;

  declare viewMode: string;

  declare zoom: number;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(64, 224, 208, 0.2) transparent;
      animation: panelSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

    :host::-webkit-scrollbar {
      width: 6px;
    }

    :host::-webkit-scrollbar-track {
      background: transparent;
    }

    :host::-webkit-scrollbar-thumb {
      background: rgba(var(--colors-accent-rgb), var(--opacity-20));
      border-radius: var(--radii-md);
    }

    :host::-webkit-scrollbar-thumb:hover {
      background: rgba(var(--colors-accent-rgb), 0.35);
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
        ?is-high-fan-in=${metrics.isHighFanIn}
        ?is-high-fan-out=${metrics.isHighFanOut}
      ></graph-metrics-section>

      <graph-node-actions
        .node=${this.node}
        view-mode=${this.viewMode}
        @focus-node=${(e: CustomEvent) => this.bubbleEvent('focus-node', e.detail)}
        @show-dependents=${(e: CustomEvent) => this.bubbleEvent('show-dependents', e.detail)}
        @show-impact=${(e: CustomEvent) => this.bubbleEvent('show-impact', e.detail)}
      ></graph-node-actions>

      <graph-node-list
        title="Dependencies"
        .items=${dependencies}
        suffix="direct"
        empty-message="No dependencies"
        .zoom=${this.zoom}
        show-kind
        @node-select=${(e: CustomEvent) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent) => this.bubbleEvent('node-hover', e.detail)}
      ></graph-node-list>

      <graph-node-list
        title="Dependents"
        .items=${dependents}
        suffix="direct"
        empty-message="No dependents"
        .zoom=${this.zoom}
        show-kind
        @node-select=${(e: CustomEvent) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent) => this.bubbleEvent('node-hover', e.detail)}
      ></graph-node-list>

      <graph-node-info .node=${this.node}></graph-node-info>

      ${
        this.node.buildSettings
          ? html`
            <graph-build-settings
              .settings=${this.node.buildSettings}
            ></graph-build-settings>
          `
          : nothing
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-details-panel': GraphNodeDetailsPanel;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-details-panel')) {
  customElements.define('graph-node-details-panel', GraphNodeDetailsPanel);
}

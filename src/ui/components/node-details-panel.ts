/**
 * NodeDetailsPanel Lit Component
 *
 * Full node details panel orchestrating all node detail components.
 * Uses utility function for dependency computation.
 *
 * @example
 * ```html
 * <xcode-graph-node-details-panel
 *   .node=${nodeData}
 *   .allNodes=${nodes}
 *   .edges=${edges}
 *   zoom="1.0"
 * ></xcode-graph-node-details-panel>
 * ```
 */

import { computeNodeDependencies } from '@graph/utils/node-utils';
import { FocusTrapController } from '@shared/controllers/focus-trap.controller';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import './build-settings.js';
import './metrics-section';
import './node-header';
import './node-info';
import './node-list.js';

/**
 * Full node details panel orchestrating all node detail sub-components.
 * Uses utility function for dependency computation.
 *
 * @summary Node details panel with metrics, info, and dependency lists
 * @fires close - Dispatched when the panel close/back button is clicked
 * @fires node-select - Dispatched when a dependency or dependent node is clicked (detail: { node })
 * @fires cluster-select - Dispatched when a cluster badge is clicked (detail: { clusterId })
 * @fires node-hover - Dispatched when hovering a dependency or dependent node (detail: { nodeId })
 * @fires toggle-direct-deps - Dispatched when the direct dependencies metric card is toggled
 * @fires toggle-transitive-deps - Dispatched when the transitive dependencies metric card is toggled
 * @fires toggle-direct-dependents - Dispatched when the direct dependents metric card is toggled
 * @fires toggle-transitive-dependents - Dispatched when the transitive dependents metric card is toggled
 */
export class GraphNodeDetailsPanel extends LitElement {
  static override readonly properties: Record<string, object> = {
    node: { attribute: false },
    allNodes: { attribute: false },
    edges: { attribute: false },
    filteredEdges: { attribute: false },
    clusters: { attribute: false },
    activeDirectDeps: { type: Boolean, attribute: 'active-direct-deps' },
    activeTransitiveDeps: { type: Boolean, attribute: 'active-transitive-deps' },
    activeDirectDependents: { type: Boolean, attribute: 'active-direct-dependents' },
    activeTransitiveDependents: { type: Boolean, attribute: 'active-transitive-dependents' },
    zoom: { type: Number },
  };

  /** The node to display details for */
  declare node: GraphNode;

  /** All nodes in the graph (for dependency resolution) */
  declare allNodes: GraphNode[];

  /** All edges in the graph */
  declare edges: GraphEdge[];

  /** Edges remaining after filter application */
  declare filteredEdges: GraphEdge[] | undefined;

  /** Available clusters for cluster navigation */
  declare clusters: Cluster[] | undefined;

  /** Whether direct dependencies highlighting is active */
  declare activeDirectDeps: boolean;

  /** Whether transitive dependencies highlighting is active */
  declare activeTransitiveDeps: boolean;

  /** Whether direct dependents highlighting is active */
  declare activeDirectDependents: boolean;

  /** Whether transitive dependents highlighting is active */
  declare activeTransitiveDependents: boolean;

  /** Current canvas zoom level for color adjustments */
  declare zoom: number;

  private readonly focusTrap = new FocusTrapController(this, {
    isActive: () => Boolean(this.node),
    onDeactivate: () => this.bubbleEvent('close'),
    escapeDeactivates: true,
    clickOutsideDeactivates: true,
  });

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding-bottom: var(--spacing-lg);
      scrollbar-width: thin;
      scrollbar-color: rgba(var(--colors-primary-rgb), var(--opacity-20)) transparent;
      animation: panelSlideIn var(--durations-slow) var(--easings-default);
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

    @media (prefers-reduced-motion: reduce) {
      :host {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
    }
  `;

  private get nodeData() {
    return computeNodeDependencies(this.node, this.allNodes, this.edges, this.filteredEdges);
  }

  private bubbleEvent(eventName: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    // Reference focusTrap to ensure controller is not tree-shaken
    void this.focusTrap.active; // skipcq: JS-0098
    if (!this.node) return html``;

    const { dependencies, dependents, metrics } = this.nodeData;

    return html`
      <xcode-graph-node-header
        .node=${this.node}
        .zoom=${this.zoom}
        @close=${() => this.bubbleEvent('close')}
        @cluster-click=${(e: CustomEvent) => this.bubbleEvent('cluster-select', e.detail)}
      ></xcode-graph-node-header>

      <xcode-graph-metrics-section
        dependencies-count=${metrics.dependencyCount}
        dependents-count=${metrics.dependentCount}
        total-dependencies-count=${metrics.totalDependencyCount}
        total-dependents-count=${metrics.totalDependentCount}
        transitive-dependencies-count=${metrics.transitiveDependencyCount}
        transitive-dependents-count=${metrics.transitiveDependentCount}
        ?is-high-fan-in=${metrics.isHighFanIn}
        ?is-high-fan-out=${metrics.isHighFanOut}
        ?active-direct-deps=${this.activeDirectDeps}
        ?active-transitive-deps=${this.activeTransitiveDeps}
        ?active-direct-dependents=${this.activeDirectDependents}
        ?active-transitive-dependents=${this.activeTransitiveDependents}
      ></xcode-graph-metrics-section>

      <xcode-graph-node-info .node=${this.node}></xcode-graph-node-info>

      <xcode-graph-node-list
        title="Dependencies"
        .items=${dependencies}
        suffix="direct"
        empty-message="No dependencies"
        .zoom=${this.zoom}
        show-kind
        @node-select=${(e: CustomEvent<{ node: GraphNode | null }>) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent<{ nodeId: string | null }>) => this.bubbleEvent('node-hover', e.detail)}
      ></xcode-graph-node-list>

      <xcode-graph-node-list
        title="Dependents"
        .items=${dependents}
        suffix="direct"
        empty-message="No dependents"
        .zoom=${this.zoom}
        show-kind
        @node-select=${(e: CustomEvent<{ node: GraphNode | null }>) => this.bubbleEvent('node-select', e.detail)}
        @node-hover=${(e: CustomEvent<{ nodeId: string | null }>) => this.bubbleEvent('node-hover', e.detail)}
      ></xcode-graph-node-list>

      ${
        this.node.buildSettings
          ? html`
            <xcode-graph-build-settings
              .settings=${this.node.buildSettings}
            ></xcode-graph-build-settings>
          `
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-node-details-panel': GraphNodeDetailsPanel;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-details-panel')) {
  customElements.define('xcode-graph-node-details-panel', GraphNodeDetailsPanel);
}

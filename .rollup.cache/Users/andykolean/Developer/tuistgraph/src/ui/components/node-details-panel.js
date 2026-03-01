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
import { css, html, LitElement, nothing } from 'lit';
import './build-settings.js';
import './metrics-section';
import './node-header';
import './node-info';
import './node-list.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { AttributePart: A_1, PropertyPart: P_1, BooleanAttributePart: B_1, EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `<!--?-->`, parts: [] };
const lit_template_2 = { h: b_1 `
      <xcode-graph-node-header></xcode-graph-node-header>

      <xcode-graph-metrics-section></xcode-graph-metrics-section>

      <xcode-graph-node-info></xcode-graph-node-info>

      <xcode-graph-node-list title="Dependencies" suffix="direct" empty-message="No dependencies" show-kind=""></xcode-graph-node-list>

      <xcode-graph-node-list title="Dependents" suffix="direct" empty-message="No dependents" show-kind=""></xcode-graph-node-list>

      <?>
    `, parts: [{ type: 1, index: 0, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 0, name: "close", strings: ["", ""], ctor: E_1 }, { type: 1, index: 0, name: "cluster-click", strings: ["", ""], ctor: E_1 }, { type: 1, index: 1, name: "dependencies-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "dependents-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "total-dependencies-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "total-dependents-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "transitive-dependencies-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "transitive-dependents-count", strings: ["", ""], ctor: A_1 }, { type: 1, index: 1, name: "is-high-fan-in", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "is-high-fan-out", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "active-direct-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "active-transitive-deps", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "active-direct-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 1, name: "active-transitive-dependents", strings: ["", ""], ctor: B_1 }, { type: 1, index: 2, name: "node", strings: ["", ""], ctor: P_1 }, { type: 1, index: 3, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 3, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 3, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 3, name: "node-hover", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "items", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "zoom", strings: ["", ""], ctor: P_1 }, { type: 1, index: 4, name: "node-select", strings: ["", ""], ctor: E_1 }, { type: 1, index: 4, name: "node-hover", strings: ["", ""], ctor: E_1 }, { type: 2, index: 5 }] };
const lit_template_3 = { h: b_1 `
            <xcode-graph-build-settings></xcode-graph-build-settings>
          `, parts: [{ type: 1, index: 0, name: "settings", strings: ["", ""], ctor: P_1 }] };
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
    static properties = {
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
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
  `;
    // ========================================
    // Computed Values
    // ========================================
    get nodeData() {
        return computeNodeDependencies(this.node, this.allNodes, this.edges, this.filteredEdges);
    }
    // ========================================
    // Event Handlers (bubble up)
    // ========================================
    bubbleEvent(eventName, detail) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (!this.node)
            return { ["_$litType$"]: lit_template_1, values: [] };
        const { dependencies, dependents, metrics } = this.nodeData;
        return { ["_$litType$"]: lit_template_2, values: [this.node, this.zoom, () => this.bubbleEvent('close'), (e) => this.bubbleEvent('cluster-select', e.detail), metrics.dependencyCount, metrics.dependentCount, metrics.totalDependencyCount, metrics.totalDependentCount, metrics.transitiveDependencyCount, metrics.transitiveDependentCount, metrics.isHighFanIn, metrics.isHighFanOut, this.activeDirectDeps, this.activeTransitiveDeps, this.activeDirectDependents, this.activeTransitiveDependents, this.node, dependencies, this.zoom, (e) => this.bubbleEvent('node-select', e.detail), (e) => this.bubbleEvent('node-hover', e.detail), dependents, this.zoom, (e) => this.bubbleEvent('node-select', e.detail), (e) => this.bubbleEvent('node-hover', e.detail), this.node.buildSettings
                    ? { ["_$litType$"]: lit_template_3, values: [this.node.buildSettings] } : nothing] };
    }
}
// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-details-panel')) {
    customElements.define('xcode-graph-node-details-panel', GraphNodeDetailsPanel);
}
//# sourceMappingURL=node-details-panel.js.map
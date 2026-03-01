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
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './build-settings.js';
import './metrics-section';
import './node-header';
import './node-info';
import './node-list.js';
import type { Cluster } from '@shared/schemas';
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
export declare class GraphNodeDetailsPanel extends LitElement {
    static readonly properties: Record<string, object>;
    node: GraphNode;
    allNodes: GraphNode[];
    edges: GraphEdge[];
    filteredEdges: GraphEdge[] | undefined;
    clusters: Cluster[] | undefined;
    activeDirectDeps: boolean;
    activeTransitiveDeps: boolean;
    activeDirectDependents: boolean;
    activeTransitiveDependents: boolean;
    zoom: number;
    static readonly styles: CSSResultGroup;
    private get nodeData();
    private bubbleEvent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-node-details-panel': GraphNodeDetailsPanel;
    }
}

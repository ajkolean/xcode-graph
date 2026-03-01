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
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
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
export declare class GraphClusterDetailsPanel extends LitElement {
    cluster: Cluster;
    clusterNodes: GraphNode[];
    allNodes: GraphNode[];
    edges: GraphEdge[];
    filteredEdges: GraphEdge[] | undefined;
    activeDirectDeps: boolean;
    activeDirectDependents: boolean;
    zoom: number;
    static readonly styles: CSSResultGroup;
    private get stats();
    private get clusterColor();
    private get targetBreakdown();
    private bubbleEvent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-details-panel': GraphClusterDetailsPanel;
    }
}

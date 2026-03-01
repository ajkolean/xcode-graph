/**
 * ClusterGroup Lit Component
 *
 * Renders a cluster with its card background, internal edges, and nodes.
 * Orchestrates ClusterCard, GraphEdges, and GraphNode components.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-cluster-group
 *     .cluster=${clusterData}
 *     .clusterPosition=${position}
 *     .nodes=${nodesArray}
 *     .edges=${edgesArray}
 *     .finalNodePositions=${positionsMap}
 *     zoom="1.0"
 *   ></xcode-graph-cluster-group>
 * </svg>
 * ```
 *
 * @fires node-mouseenter, node-mouseleave, node-mousedown, node-click
 * @fires cluster-mouseenter, cluster-mouseleave, cluster-click
 */
import type { TransitiveResult } from '@graph/utils';
import type { Cluster, ClusterPosition, NodePosition, ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode as GraphNodeType } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
import './cluster-card';
import './graph-edges';
import './graph-node';
/**
 * Renders a cluster with its card background, internal edges, and nodes.
 * Orchestrates ClusterCard, GraphEdges, and GraphNode components.
 *
 * @summary Cluster group orchestrating card, edges, and nodes
 * @fires cluster-mouseenter - Dispatched when the cluster is hovered
 * @fires cluster-mouseleave - Dispatched when the cluster hover ends
 * @fires cluster-click - Dispatched when the cluster is clicked
 * @fires node-mouseenter - Dispatched when a child node is hovered (detail: { nodeId })
 * @fires node-mouseleave - Dispatched when a child node hover ends
 * @fires node-mousedown - Dispatched on child node mouse down (detail: { nodeId, originalEvent })
 * @fires node-click - Dispatched on child node click (detail: { node, originalEvent })
 */
export declare class GraphClusterGroup extends LitElement {
    protected createRenderRoot(): this;
    cluster: Cluster | undefined;
    clusterPosition: ClusterPosition | undefined;
    nodes: GraphNodeType[] | undefined;
    edges: GraphEdge[] | undefined;
    finalNodePositions: Map<string, NodePosition> | undefined;
    selectedNode: GraphNodeType | null | undefined;
    hoveredNode: string | null | undefined;
    hoveredClusterId: string | null | undefined;
    searchQuery: string | undefined;
    zoom: number | undefined;
    viewMode: ViewMode | undefined;
    transitiveDeps: TransitiveResult | undefined;
    transitiveDependents: TransitiveResult | undefined;
    isSelected: boolean | undefined;
    previewFilter: PreviewFilter | undefined;
    private isClusterHovered;
    private hoverUpdatePending;
    private pendingHoverState;
    /**
     * Throttled hover update using requestAnimationFrame
     */
    private scheduleHoverUpdate;
    private handleClusterMouseEnter;
    private handleClusterMouseLeave;
    private handleClusterClick;
    private handleClusterKeyDown;
    private hasSignificantZoomChange;
    private hasHoverStateChange;
    shouldUpdate(changedProps: PropertyValues): boolean;
    private get connectedNodes();
    private get clusterNodes();
    private isNodeDimmed;
    private matchesPreview;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-group': GraphClusterGroup;
    }
}
//# sourceMappingURL=cluster-group.d.ts.map
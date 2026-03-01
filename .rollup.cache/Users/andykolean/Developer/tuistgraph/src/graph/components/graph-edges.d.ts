/**
 * GraphEdges Lit Component
 *
 * Renders all edges in the graph with depth-based opacity and highlighting.
 * Handles both cross-cluster and intra-cluster edges.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-edges
 *     .edges=${edgesArray}
 *     .nodes=${nodesArray}
 *     .finalNodePositions=${positionsMap}
 *   ></xcode-graph-edges>
 * </svg>
 * ```
 */
import { type ClusterPosition, type NodePosition, ViewMode } from '@shared/schemas';
import type { GraphEdge as GraphEdgeType, GraphNode } from '@shared/schemas/graph.types';
import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
import './graph-edge';
/**
 * Renders all edges in the graph with depth-based opacity and highlighting.
 * Handles both cross-cluster and intra-cluster edges.
 *
 * @summary Collection renderer for all graph edges
 */
export declare class GraphEdges extends LitElement {
    protected createRenderRoot(): this;
    edges: GraphEdgeType[] | undefined;
    nodes: GraphNode[] | undefined;
    finalNodePositions: Map<string, NodePosition> | undefined;
    clusterPositions: Map<string, ClusterPosition> | undefined;
    selectedNode: GraphNode | null | undefined;
    hoveredNode: string | null | undefined;
    clusterId: string | undefined;
    hoveredClusterId: string | null | undefined;
    viewMode: ViewMode | undefined;
    transitiveDeps: {
        nodes: Set<string>;
        edges: Set<string>;
        edgeDepths: Map<string, number>;
        maxDepth: number;
    } | undefined;
    transitiveDependents: {
        nodes: Set<string>;
        edges: Set<string>;
        edgeDepths: Map<string, number>;
        maxDepth: number;
    } | undefined;
    zoom: number | undefined;
    private nodeToEdgesCache;
    private buildNodeToEdgesCache;
    private computeDepthOpacity;
    private getEdgeOpacity;
    willUpdate(changedProps: PropertyValues<this>): void;
    shouldUpdate(changedProps: PropertyValues<this>): boolean;
    /**
     * Determines whether an edge should be visible based on cluster context.
     * Returns false if the edge should be filtered out.
     */
    private isEdgeVisibleForCluster;
    /**
     * Computes the final opacity for an edge, considering hover dimming.
     */
    private computeEdgeFinalOpacity;
    private renderEdge;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-edges': GraphEdges;
    }
}

/**
 * ClusterTargetsList Lit Component
 *
 * List of cluster target nodes GROUPED BY TYPE using ListItemRow components.
 * Matches React version with full grouping and stats.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-targets-list
 *   .nodesByType=${nodesByType}
 *   .edges=${edges}
 *   filtered-targets-count="5"
 *   total-targets-count="10"
 * ></xcode-graph-cluster-targets-list>
 * ```
 *
 * @fires node-select - Dispatched when target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, type TemplateResult } from 'lit';
import { NodeListEventsBase } from './node-list-events';
import './list-item-row';
/**
 * List of cluster target nodes grouped by type using ListItemRow components.
 * Shows targets organized by node type with dependency/dependent counts.
 *
 * @summary Collapsible cluster targets list grouped by node type
 *
 * @fires node-select - Dispatched when a target is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
export declare class GraphClusterTargetsList extends NodeListEventsBase {
    clusterNodes: GraphNode[];
    nodesByType: Record<string, GraphNode[]>;
    filteredTargetsCount: number;
    totalTargetsCount: number;
    edges: GraphEdge[];
    zoom: number;
    /**
     * Whether to start expanded (default: true)
     */
    expanded: boolean;
    private isExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private get flatItems();
    private getNodeStats;
    private formatNodeStatsSubtitle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-targets-list': GraphClusterTargetsList;
    }
}
//# sourceMappingURL=cluster-targets-list.d.ts.map
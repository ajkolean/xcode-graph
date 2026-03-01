/**
 * NodeList Lit Component
 *
 * A unified list component for displaying nodes with section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @example
 * ```html
 * <xcode-graph-node-list
 *   title="Dependencies"
 *   .items=${dependencies}
 *   suffix="direct"
 *   empty-message="No dependencies"
 *   zoom="1.0"
 * ></xcode-graph-node-list>
 * ```
 *
 * @fires node-select - Dispatched when node is clicked (detail: { node })
 * @fires node-hover - Dispatched on hover (detail: { nodeId })
 */
import type { NodeWithEdge } from '@graph/utils/node-utils';
import { type GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, type TemplateResult } from 'lit';
import './badge.js';
import './list-item-row.js';
import { NodeListEventsBase } from './node-list-events';
/**
 * A unified list component for displaying nodes with a section header.
 * Used for dependencies, dependents, and other node list displays.
 * Supports displaying dependency kind badges when edge information is provided.
 *
 * @summary Collapsible node list with section header and kind badges
 * @fires node-select - Dispatched when a node row is clicked (detail: { node })
 * @fires node-hover - Dispatched on node row hover (detail: { nodeId })
 */
export declare class GraphNodeList extends NodeListEventsBase {
    /**
     * Section title (e.g., "Dependencies", "Dependents")
     */
    title: string;
    /**
     * Array of nodes with edge info to display
     */
    items: NodeWithEdge[];
    /**
     * @deprecated Use items instead. Legacy support for plain node arrays.
     */
    nodes: GraphNode[];
    /**
     * Suffix for count display (e.g., "direct")
     */
    suffix: string;
    /**
     * Message to show when list is empty
     */
    emptyMessage: string;
    /**
     * Zoom level for color adjustments
     */
    zoom: number;
    /**
     * Whether to show dependency kind badges
     */
    showKind: boolean;
    private isExpanded;
    constructor();
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private get itemList();
    private getNodeSubtitle;
    private renderKindBadge;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-node-list': GraphNodeList;
    }
}
//# sourceMappingURL=node-list.d.ts.map
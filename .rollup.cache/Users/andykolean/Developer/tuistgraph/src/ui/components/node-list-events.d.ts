/**
 * Node List Event Handlers Base Class
 *
 * Provides shared event forwarding logic for node list components.
 * Used by GraphNodeList, GraphClusterTargetsList, and similar components.
 *
 * @module components/ui/node-list-events
 */
import type { GraphNode } from '@shared/schemas/graph.types';
import { LitElement } from 'lit';
/**
 * Base class that adds node list event handling methods to LitElement.
 *
 * Provides:
 * - handleNodeSelect: Forwards row-select events as node-select
 * - handleNodeHover: Forwards row-hover events as node-hover
 * - handleHoverEnd: Dispatches node-hover with null nodeId
 */
export declare class NodeListEventsBase extends LitElement {
    /**
     * Forward node selection event
     */
    protected handleNodeSelect(e: CustomEvent<{
        node: GraphNode;
    }>): void;
    /**
     * Forward node hover event
     */
    protected handleNodeHover(e: CustomEvent<{
        nodeId: string;
    }>): void;
    /**
     * Handle hover end - dispatch with null nodeId
     */
    protected handleHoverEnd(): void;
}

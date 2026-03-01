/**
 * Node List Event Handlers Base Class
 *
 * Provides shared event forwarding logic for node list components.
 * Used by GraphNodeList, GraphClusterTargetsList, and similar components.
 *
 * @module components/ui/node-list-events
 */
import { LitElement } from 'lit';
/**
 * Base class that adds node list event handling methods to LitElement.
 *
 * Provides:
 * - handleNodeSelect: Forwards row-select events as node-select
 * - handleNodeHover: Forwards row-hover events as node-hover
 * - handleHoverEnd: Dispatches node-hover with null nodeId
 */
export class NodeListEventsBase extends LitElement {
    /**
     * Forward node selection event
     */
    handleNodeSelect(e) {
        this.dispatchEvent(new CustomEvent('node-select', {
            detail: { node: e.detail.node },
            bubbles: true,
            composed: true,
        }));
    }
    /**
     * Forward node hover event
     */
    handleNodeHover(e) {
        this.dispatchEvent(new CustomEvent('node-hover', {
            detail: { nodeId: e.detail.nodeId },
            bubbles: true,
            composed: true,
        }));
    }
    /**
     * Handle hover end - dispatch with null nodeId
     */
    handleHoverEnd() {
        this.dispatchEvent(new CustomEvent('node-hover', {
            detail: { nodeId: null },
            bubbles: true,
            composed: true,
        }));
    }
}
//# sourceMappingURL=node-list-events.js.map
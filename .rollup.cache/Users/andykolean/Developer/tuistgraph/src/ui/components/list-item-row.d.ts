/**
 * ListItemRow Lit Component - Mission Control Theme
 *
 * Reusable row component for displaying nodes in lists.
 * Features sharp edges, accent borders, and monospace typography.
 *
 * @example
 * ```html
 * <xcode-graph-list-item-row
 *   .node=${nodeData}
 *   subtitle="Framework"
 *   zoom="1.0"
 *   is-selected
 * ></xcode-graph-list-item-row>
 * ```
 *
 * @fires row-select - Dispatched when row is clicked (detail: { node })
 * @fires row-hover - Dispatched on mouse enter (detail: { nodeId })
 * @fires row-hover-end - Dispatched on mouse leave
 */
import type { GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Reusable row component for displaying nodes in lists.
 * Features sharp edges, accent borders, and monospace typography.
 *
 * @summary Node list row with icon, name, and chevron
 * @fires row-select - Dispatched when the row is clicked (detail: { node })
 * @fires row-hover - Dispatched on mouse enter (detail: { nodeId })
 * @fires row-hover-end - Dispatched on mouse leave
 */
export declare class GraphListItemRow extends LitElement {
    node: GraphNode;
    subtitle: string;
    zoom: number;
    isSelected: boolean;
    private isHovered;
    constructor();
    static readonly styles: CSSResultGroup;
    private handleClick;
    private handleMouseEnter;
    private handleMouseLeave;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-list-item-row': GraphListItemRow;
    }
}

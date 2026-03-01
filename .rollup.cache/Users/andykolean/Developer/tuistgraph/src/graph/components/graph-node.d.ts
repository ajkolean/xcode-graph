/**
 * GraphNode Lit Component - Mission Control Theme
 *
 * SVG node in the graph visualization with icon, label, and sonar pulse animations.
 * Features dramatic hover states, enhanced glows, and amber/teal color scheme.
 *
 * @module components/graph/graph-node
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-node
 *     .node=${nodeData}
 *     x="100"
 *     y="100"
 *     size="24"
 *     color="#F59E0B"
 *     is-selected
 *   ></xcode-graph-node>
 * </svg>
 * ```
 *
 * @fires node-mouseenter - Dispatched on mouse enter
 * @fires node-mouseleave - Dispatched on mouse leave
 * @fires node-mousedown - Dispatched on mouse down
 * @fires node-click - Dispatched on click
 */
import type { GraphNode as GraphNodeType } from '@shared/schemas/graph.types';
import { LitElement, type PropertyDeclarations, type TemplateResult } from 'lit';
/**
 * SVG node in the graph visualization with icon, label, and sonar pulse animations.
 * Features dramatic hover states, enhanced glows, and amber/teal color scheme.
 *
 * @summary SVG graph node with icon and label
 * @fires node-mouseenter - Dispatched on mouse enter
 * @fires node-mouseleave - Dispatched on mouse leave
 * @fires node-mousedown - Dispatched on mouse down (detail: { originalEvent })
 * @fires node-click - Dispatched on click (detail: { originalEvent })
 */
export declare class GraphNode extends LitElement {
    static readonly properties: PropertyDeclarations;
    protected createRenderRoot(): this;
    node: GraphNodeType | undefined;
    x: number | undefined;
    y: number | undefined;
    size: number | undefined;
    color: string | undefined;
    isSelected: boolean | undefined;
    isHovered: boolean | undefined;
    isDimmed: boolean | undefined;
    zoom: number | undefined;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleMouseDown;
    private handleClick;
    private handleKeyDown;
    private getDisplayName;
    private getShowTooltip;
    private renderSonarPulses;
    private renderGlowRings;
    private renderLabel;
    private getNodeScale;
    private getIconStrokeWidth;
    private renderBackgroundCircle;
    private renderIconShape;
    private getRenderProps;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-node': GraphNode;
    }
}

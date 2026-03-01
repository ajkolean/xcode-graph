/**
 * GraphEdge Lit Component
 *
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-edge
 *     x1="100"
 *     y1="100"
 *     x2="200"
 *     y2="200"
 *     color="#8B5CF6"
 *     is-highlighted
 *     animated
 *   ></xcode-graph-edge>
 * </svg>
 * ```
 */
import { LitElement, type TemplateResult } from 'lit';
/**
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @summary SVG edge connection between graph nodes
 */
export declare class GraphEdge extends LitElement {
    protected createRenderRoot(): this;
    x1: number | undefined;
    y1: number | undefined;
    x2: number | undefined;
    y2: number | undefined;
    color: string | undefined;
    isHighlighted: boolean | undefined;
    isDependent: boolean | undefined;
    opacity: number | undefined;
    zoom: number | undefined;
    animated: boolean | undefined;
    private resolveEdgeProps;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-edge': GraphEdge;
    }
}

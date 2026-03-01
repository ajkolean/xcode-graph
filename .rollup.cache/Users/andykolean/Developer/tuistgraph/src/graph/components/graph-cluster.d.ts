/**
 * GraphCluster Lit Component
 *
 * SVG cluster container with background, border, and glow effects.
 * Renders as a rounded rectangle with label, target count, and children.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-cluster
 *     cluster-id="MyProject"
 *     x="100"
 *     y="100"
 *     width="200"
 *     height="150"
 *     color="#8B5CF6"
 *     node-count="5"
 *     origin="local"
 *   >
 *     <!-- child nodes and edges -->
 *   </xcode-graph-cluster>
 * </svg>
 * ```
 *
 * @fires cluster-mouseenter - Dispatched on mouse enter
 * @fires cluster-mouseleave - Dispatched on mouse leave
 * @fires cluster-click - Dispatched on click
 */
import { Origin } from '@shared/schemas/graph.types';
import { LitElement, type TemplateResult } from 'lit';
/**
 * SVG cluster container with background, border, and glow effects.
 * Renders as a rounded rectangle with label, target count, and children.
 *
 * @summary SVG cluster container with label and glow effects
 * @fires cluster-mouseenter - Dispatched on mouse enter
 * @fires cluster-mouseleave - Dispatched on mouse leave
 * @fires cluster-click - Dispatched on click
 * @slot - Default slot for child nodes and edges
 */
export declare class GraphCluster extends LitElement {
    protected createRenderRoot(): this;
    clusterId: string | undefined;
    x: number | undefined;
    y: number | undefined;
    width: number | undefined;
    height: number | undefined;
    color: string | undefined;
    nodeCount: number | undefined;
    origin: Origin | undefined;
    isHovered: boolean | undefined;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleClick;
    private handleKeyDown;
    private resolveClusterProps;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster': GraphCluster;
    }
}

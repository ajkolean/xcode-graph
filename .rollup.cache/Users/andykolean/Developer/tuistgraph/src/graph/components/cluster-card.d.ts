/**
 * ClusterCard Lit Component
 *
 * SVG card background for cluster visualization.
 * Renders rounded rectangle with cluster name and target count.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-cluster-card
 *     .cluster=${clusterData}
 *     x="100"
 *     y="100"
 *     width="200"
 *     height="150"
 *   ></xcode-graph-cluster-card>
 * </svg>
 * ```
 *
 * @fires cluster-click - Dispatched when card is clicked
 */
import type { Cluster } from '@shared/schemas';
import { LitElement, type SVGTemplateResult } from 'lit';
/**
 * SVG card background for cluster visualization.
 * Renders a rounded rectangle with cluster name and target count.
 *
 * @summary SVG cluster card background
 * @fires cluster-click - Dispatched when the card is clicked (detail: { cluster })
 */
export declare class GraphClusterCard extends LitElement {
    protected createRenderRoot(): this;
    cluster: Cluster | undefined;
    x: number | undefined;
    y: number | undefined;
    width: number | undefined;
    height: number | undefined;
    isHighlighted: boolean | undefined;
    isDimmed: boolean | undefined;
    isSelected: boolean | undefined;
    zoom: number | undefined;
    clickable: boolean | undefined;
    private handleClick;
    private handleKeyDown;
    private resolveRenderProps;
    private computeCardStyles;
    render(): SVGTemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-card': GraphClusterCard;
    }
}

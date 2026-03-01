/**
 * NodeHeader Lit Component
 *
 * Header for node details panel with icon, name, and type badges.
 * Uses graph-panel-header for consistent layout.
 *
 * @example
 * ```html
 * <xcode-graph-node-header
 *   .node=${nodeData}
 *   zoom="1.0"
 * ></xcode-graph-node-header>
 * ```
 *
 * @fires close - Dispatched when back/close button clicked
 * @fires cluster-click - Dispatched when cluster badge clicked (detail: { clusterId })
 */
import { type GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './badge.js';
import './panel-header.js';
import './tag-badge.js';
/**
 * Header for the node details panel with icon, name, type badges, and tags.
 * Uses graph-panel-header for consistent layout.
 *
 * @summary Node details header with icon, badges, and tags
 * @fires close - Dispatched when the back/close button is clicked
 * @fires cluster-click - Dispatched when a cluster badge is clicked (detail: { clusterId })
 */
export declare class GraphNodeHeader extends LitElement {
    node: GraphNode;
    zoom: number;
    showClusterLink: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    private handleBack;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-node-header': GraphNodeHeader;
    }
}

/**
 * NodeInfo Lit Component
 *
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @example
 * ```html
 * <xcode-graph-node-info .node=${nodeData}></xcode-graph-node-info>
 * ```
 */
import { type GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './deployment-targets.js';
import './info-row.js';
/**
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @summary Collapsible node information details section
 */
export declare class GraphNodeInfo extends LitElement {
    node: GraphNode;
    expanded: boolean;
    private isExpanded;
    private scriptExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private get originLabel();
    private get hasDeploymentTargets();
    private get hasDestinations();
    private renderForeignBuild;
    private renderExpandedContent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-node-info': GraphNodeInfo;
    }
}
//# sourceMappingURL=node-info.d.ts.map
/**
 * ClusterComposition Lit Component
 *
 * Shows composition statistics for a cluster:
 * - Total source files across all targets
 * - Total resources (with notable ones highlighted)
 * - Largest targets by source count
 *
 * @example
 * ```html
 * <xcode-graph-cluster-composition
 *   .nodes=${clusterNodes}
 * ></xcode-graph-cluster-composition>
 * ```
 */
import type { GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, nothing, type TemplateResult } from 'lit';
import './section-header.js';
/**
 * Shows composition statistics for a cluster including total source files,
 * total resources (with notable ones highlighted), and largest targets by source count.
 *
 * @summary Collapsible cluster composition statistics
 */
export declare class GraphClusterComposition extends LitElement {
    /**
     * Nodes in the cluster
     */
    nodes: GraphNode[];
    /**
     * Whether to start expanded (default: collapsed)
     */
    expanded: boolean;
    private isExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private get totalSources();
    private get totalResources();
    private get notableResources();
    private get hasPrivacyManifest();
    private get largestTargets();
    private get hasContent();
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-composition': GraphClusterComposition;
    }
}
//# sourceMappingURL=cluster-composition.d.ts.map
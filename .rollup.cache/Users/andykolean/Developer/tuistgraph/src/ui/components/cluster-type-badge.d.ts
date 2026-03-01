/**
 * ClusterTypeBadge Lit Component - Mission Control Theme
 *
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-type-badge
 *   cluster-type="package"
 *   cluster-color="#F59E0B"
 * ></xcode-graph-cluster-type-badge>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './badge.js';
/**
 * Displays package/project badge with sharp styling and monospace typography.
 * Wrapper around graph-badge with container styling.
 *
 * @summary Cluster type badge showing package or project
 */
export declare class GraphClusterTypeBadge extends LitElement {
    /**
     * The type of cluster (package or project)
     */
    clusterType: 'package' | 'project';
    /**
     * The color to use for the badge (hex or CSS color)
     */
    clusterColor: string;
    static readonly styles: CSSResultGroup;
    private get badgeLabel();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-type-badge': GraphClusterTypeBadge;
    }
}

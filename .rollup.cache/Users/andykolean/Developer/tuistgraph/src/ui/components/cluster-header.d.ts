/**
 * ClusterHeader Lit Component
 *
 * Header for cluster details panel with back button, icon, and cluster info.
 * Uses graph-panel-header for consistent layout.
 * Shows source type (Local/Registry/Git) and provides path copy button.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-header
 *   cluster-name="MyPackage"
 *   cluster-type="package"
 *   cluster-color="#8B5CF6"
 *   cluster-path="/path/to/package"
 *   is-external
 * ></xcode-graph-cluster-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './badge.js';
import './panel-header.js';
/**
 * Header for cluster details panel with back button, icon, and cluster info.
 * Shows source type (Local/Registry/Git) and provides path copy button.
 *
 * @summary Cluster details panel header with icon, badges, and path
 *
 * @fires back - Dispatched when back button is clicked
 */
export declare class GraphClusterHeader extends LitElement {
    clusterName: string;
    clusterType: 'package' | 'project';
    clusterColor: string;
    clusterPath: string;
    isExternal: boolean;
    private copied;
    constructor();
    static readonly styles: CSSResultGroup;
    private getSourceType;
    private getShortPath;
    private handleCopyPath;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-header': GraphClusterHeader;
    }
}

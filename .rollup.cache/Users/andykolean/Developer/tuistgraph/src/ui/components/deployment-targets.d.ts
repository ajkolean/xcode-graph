/**
 * DeploymentTargets Lit Component
 *
 * Displays platform deployment targets (minimum OS versions) and
 * supported destinations (device types) for a node.
 *
 * @example
 * ```html
 * <xcode-graph-deployment-targets
 *   .deploymentTargets=${{ iOS: '14.0', macOS: '12.0' }}
 *   .destinations=${['iPhone', 'iPad', 'mac']}
 * ></xcode-graph-deployment-targets>
 * ```
 */
import type { DeploymentTargets, Destination } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, nothing, type TemplateResult } from 'lit';
import './badge.js';
/**
 * Displays platform deployment targets (minimum OS versions) and
 * supported destinations (device types) for a node.
 *
 * @summary Platform deployment targets and destination badges
 */
export declare class GraphDeploymentTargets extends LitElement {
    /**
     * Deployment targets with minimum OS versions per platform
     */
    deploymentTargets: DeploymentTargets | undefined;
    /**
     * Supported destinations (device types)
     */
    destinations: Destination[] | undefined;
    /**
     * Whether to show in compact mode (badges only, no labels)
     */
    compact: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    private renderPlatformTargets;
    private renderDestinations;
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-deployment-targets': GraphDeploymentTargets;
    }
}

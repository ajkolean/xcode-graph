/**
 * ClusterStats Lit Component
 *
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @example
 * ```html
 * <xcode-graph-cluster-stats
 *   filtered-dependencies="5"
 *   total-dependencies="10"
 *   .platforms=${platformsSet}
 *   .targetBreakdown=${{ framework: 3, library: 2, test: 1 }}
 * ></xcode-graph-cluster-stats>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './badge.js';
import './stats-card';
/**
 * Statistics section for cluster details using StatsCard components.
 * Shows dependencies, dependents, target breakdown, and platform badges.
 *
 * @summary Collapsible cluster metrics with stats cards and breakdowns
 *
 * @fires toggle-direct-deps - Dispatched when dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when dependents card is toggled
 */
export declare class GraphClusterStats extends LitElement {
    filteredDependencies: number;
    totalDependencies: number;
    filteredDependents: number;
    totalDependents: number;
    activeDirectDeps: boolean;
    activeDirectDependents: boolean;
    platforms: Set<string>;
    /**
     * Target breakdown by node type (e.g., { framework: 3, library: 2 })
     */
    targetBreakdown: Record<string, number>;
    expanded: boolean;
    private isExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private handleCardToggle;
    private renderTargetBreakdown;
    private renderExpandedContent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cluster-stats': GraphClusterStats;
    }
}
//# sourceMappingURL=cluster-stats.d.ts.map
/**
 * MetricsSection Lit Component
 *
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @example
 * ```html
 * <xcode-graph-metrics-section
 *   dependencies-count="5"
 *   total-dependencies-count="10"
 *   active-direct-deps
 * ></xcode-graph-metrics-section>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './stats-card';
/**
 * Displays node metrics using StatsCard components in a grid.
 * Cards can be toggleable to control edge highlighting on the canvas.
 *
 * @summary Metrics grid with toggleable stats cards
 * @fires toggle-direct-deps - Dispatched when direct dependencies card is toggled
 * @fires toggle-transitive-deps - Dispatched when transitive dependencies card is toggled
 * @fires toggle-direct-dependents - Dispatched when direct dependents card is toggled
 * @fires toggle-transitive-dependents - Dispatched when transitive dependents card is toggled
 */
export declare class GraphMetricsSection extends LitElement {
    dependenciesCount: number;
    dependentsCount: number;
    totalDependenciesCount: number;
    totalDependentsCount: number;
    transitiveDependenciesCount: number;
    transitiveDependentsCount: number;
    isHighFanIn: boolean;
    isHighFanOut: boolean;
    activeDirectDeps: boolean;
    activeTransitiveDeps: boolean;
    activeDirectDependents: boolean;
    activeTransitiveDependents: boolean;
    expanded: boolean;
    private isExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private handleCardToggle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-metrics-section': GraphMetricsSection;
    }
}
//# sourceMappingURL=metrics-section.d.ts.map
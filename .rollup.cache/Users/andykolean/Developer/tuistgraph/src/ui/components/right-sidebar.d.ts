/**
 * RightSidebar Lit Component
 *
 * Main right sidebar orchestrator with Zag state machine and Lit Signals.
 * Manages collapse/expand, tabs, and displays node/cluster details or filters.
 *
 * @example
 * ```html
 * <xcode-graph-right-sidebar
 *   .allNodes=${nodes}
 *   .allEdges=${edges}
 *   .filteredNodes=${filteredNodes}
 *   .filteredEdges=${filteredEdges}
 * ></xcode-graph-right-sidebar>
 * ```
 */
import type { Cluster } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
import './right-sidebar-header';
import './sidebar-collapse-icon';
import './icon-button.js';
import './collapsed-sidebar';
import './node-details-panel';
import './cluster-details-panel';
import './clear-filters-button';
import './search-bar';
import './filter-section';
import './empty-state';
import './stats-card';
declare const SignalWatcherLitElement: typeof LitElement;
/**
 * Main right sidebar orchestrator with Zag state machine and Lit Signals.
 * Manages collapse/expand, tabs, and displays node/cluster details or filters.
 *
 * @summary Right sidebar with filters, search, and detail panels
 */
export declare class GraphRightSidebar extends SignalWatcherLitElement {
    allNodes: GraphNode[];
    allEdges: GraphEdge[];
    filteredNodes: GraphNode[];
    filteredEdges: GraphEdge[];
    clusters: Cluster[] | undefined;
    private readonly sidebar;
    static readonly styles: CSSResultGroup;
    private get filterData();
    private findClusterById;
    private get isCollapsed();
    private get isViewingDetails();
    /** Derive workspace name from the largest local project cluster */
    private get workspaceName();
    private handleSearchChange;
    private handleClearFilters;
    private handleItemToggle;
    private handlePreviewChange;
    private handleToggleCollapse;
    private handleToggleSection;
    private handleExpandToSection;
    private renderCollapsedSidebar;
    private renderNodeDetails;
    private renderClusterDetails;
    private renderFilterView;
    private renderFilterSections;
    private handleBackToFilters;
    private renderDetailsToolbar;
    private renderExpandedContent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-right-sidebar': GraphRightSidebar;
    }
}
export {};
//# sourceMappingURL=right-sidebar.d.ts.map
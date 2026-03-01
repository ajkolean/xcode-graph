/**
 * CollapsedSidebar Lit Component
 *
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @example
 * ```html
 * <xcode-graph-collapsed-sidebar
 *   .filteredNodes=${nodes}
 *   .filteredEdges=${edges}
 *   node-types-filter-size="3"
 * ></xcode-graph-collapsed-sidebar>
 * ```
 *
 * @fires expand-to-section - Dispatched when section icon clicked (detail: { section })
 */
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Vertical icon bar shown when sidebar is collapsed.
 * Displays filter section icons with active filter badges.
 *
 * @summary Collapsed sidebar icon bar with filter badges
 *
 * @fires expand-to-section - Dispatched when a section icon is clicked (detail: { section })
 */
export declare class GraphCollapsedSidebar extends LitElement {
    filteredNodes: GraphNode[];
    filteredEdges: GraphEdge[];
    typeCounts: Map<string, number>;
    platformCounts: Map<string, number>;
    projectCounts: Map<string, number>;
    packageCounts: Map<string, number>;
    nodeTypesFilterSize: number;
    platformsFilterSize: number;
    projectsFilterSize: number;
    packagesFilterSize: number;
    static readonly styles: CSSResultGroup;
    private handleExpandToSection;
    private renderProductTypesIcon;
    private renderPlatformsIcon;
    private renderProjectsIcon;
    private renderPackagesIcon;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-collapsed-sidebar': GraphCollapsedSidebar;
    }
}

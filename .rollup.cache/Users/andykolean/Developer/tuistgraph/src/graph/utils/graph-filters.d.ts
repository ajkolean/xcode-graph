/**
 * Graph filtering utilities
 * Converted from useGraphFilters hook
 */
import type { FilterState } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * Filter graph nodes and edges by active filter criteria and an optional search query.
 *
 * Nodes are tested against node type, platform, origin, project, and package filters.
 * Edges are kept only when both endpoints survive filtering.
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @param filters - Active filter state (node types, platforms, origins, projects, packages)
 * @param searchQuery - Free-text search string (case-insensitive, matched against node name)
 * @returns Filtered nodes, filtered edges, and a search result count (`null` when no query is active)
 *
 * @example
 * ```ts
 * const { filteredNodes, filteredEdges, searchResults } = applyGraphFilters(
 *   nodes,
 *   edges,
 *   filters,
 *   'MyFramework',
 * );
 * ```
 */
export declare function applyGraphFilters(nodes: GraphNode[], edges: GraphEdge[], filters: FilterState, searchQuery: string): {
    filteredNodes: GraphNode[];
    filteredEdges: GraphEdge[];
    searchResults: number | null;
};
//# sourceMappingURL=graph-filters.d.ts.map
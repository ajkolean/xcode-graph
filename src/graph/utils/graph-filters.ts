/**
 * Graph filtering utilities
 * Converted from useGraphFilters hook
 */

import type { FilterState } from '@shared/schemas';
import {
  type GraphEdge,
  type GraphNode,
  NodeType,
  type Platform,
} from '@shared/schemas/graph.types';
import { getFuzzyMatchIds } from './fuzzy-search';

/**
 * Check if a node matches the search query using fuzzy matching.
 * Searches node name, type, and project fields via Fuse.js.
 *
 * @public
 */
export function matchesSearch(node: GraphNode, searchQuery: string): boolean {
  if (!searchQuery) return true;

  const matchSet = getFuzzyMatchIds([node], searchQuery);
  return matchSet?.has(node.id) ?? false;
}

/**
 * Tests whether a node passes all active filter criteria (node type, platform, origin, project, package).
 * @param node - The graph node to test
 * @param filters - Current filter state
 * @returns `true` if the node matches all filter criteria
 */
function matchesFilterCriteria(node: GraphNode, filters: FilterState): boolean {
  if (!filters.nodeTypes.has(node.type)) return false;
  if (node.deploymentTargets) {
    const nodePlatforms = Object.keys(node.deploymentTargets);
    if (!nodePlatforms.some((p) => filters.platforms.has(p as Platform))) return false;
  } else {
    if (!filters.platforms.has(node.platform)) return false;
  }
  if (!filters.origins.has(node.origin)) return false;

  // Project filter: only applies to non-package nodes with a project
  if (node.project && node.type !== NodeType.Package && !filters.projects.has(node.project))
    return false;

  // Package filter: only applies to package nodes
  return !(node.type === NodeType.Package && !filters.packages.has(node.name));
}

/**
 * Filter graph nodes and edges by active filter criteria and an optional search query.
 *
 * Nodes are tested against node type, platform, origin, project, and package filters.
 * Edges are kept only when both endpoints survive filtering.
 * Search uses Fuse.js fuzzy matching across name, project, and type fields.
 *
 * @param nodes - All graph nodes
 * @param edges - All graph edges
 * @param filters - Active filter state (node types, platforms, origins, projects, packages)
 * @param searchQuery - Free-text search string (fuzzy-matched against node name, project, type)
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
 *
 * @public
 */
export function applyGraphFilters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filters: FilterState,
  searchQuery: string,
): { filteredNodes: GraphNode[]; filteredEdges: GraphEdge[]; searchResults: number | null } {
  const normalizedQuery = searchQuery.trim();

  // Compute fuzzy match set once for all nodes
  const fuzzyMatchSet = getFuzzyMatchIds(nodes, normalizedQuery);

  const filteredNodes = nodes.filter((node) => {
    if (!matchesFilterCriteria(node, filters)) return false;
    // If no search query, include all filter-passing nodes
    if (fuzzyMatchSet === null) return true;
    // Otherwise, node must also match fuzzy search
    return fuzzyMatchSet.has(node.id);
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
  );

  return {
    filteredNodes,
    filteredEdges,
    searchResults: normalizedQuery ? filteredNodes.length : null,
  };
}

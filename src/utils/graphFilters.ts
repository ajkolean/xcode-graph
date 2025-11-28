/**
 * Graph filtering utilities
 * Converted from useGraphFilters hook
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { FilterState } from '../types/app';

export function applyGraphFilters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filters: FilterState,
  searchQuery: string,
) {
  // Filter nodes
  const filteredNodes = nodes.filter((node) => {
    if (!filters.nodeTypes.has(node.type)) return false;
    if (!filters.platforms.has(node.platform)) return false;
    if (!filters.origins.has(node.origin)) return false;
    if (node.project && node.type !== 'package' && !filters.projects.has(node.project))
      return false;
    if (node.type === 'package' && !filters.packages.has(node.name)) return false;

    // Search filter
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
  );

  const searchResults = searchQuery ? filteredNodes.length : null;

  return {
    filteredNodes,
    filteredEdges,
    searchResults,
  };
}

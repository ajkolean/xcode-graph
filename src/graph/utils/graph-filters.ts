/**
 * Graph filtering utilities
 * Converted from useGraphFilters hook
 */

import type { FilterState } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

export function applyGraphFilters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filters: FilterState,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter nodes
  const filteredNodes = nodes.filter((node) => {
    if (!filters.nodeTypes.has(node.type)) return false;
    if (!filters.platforms.has(node.platform)) return false;
    if (!filters.origins.has(node.origin)) return false;
    if (node.project && node.type !== 'package' && !filters.projects.has(node.project))
      return false;
    if (node.type === 'package' && !filters.packages.has(node.name)) return false;

    // Search filter
    if (normalizedQuery) {
      const matchesName = node.name.toLowerCase().includes(normalizedQuery);
      const matchesProject = node.project?.toLowerCase().includes(normalizedQuery);
      const matchesPackage =
        node.type === 'package' && node.name.toLowerCase().includes(normalizedQuery);

      if (!matchesName && !matchesProject && !matchesPackage) {
        return false;
      }
    }

    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
  );

  const searchResults = normalizedQuery ? filteredNodes.length : null;

  return {
    filteredNodes,
    filteredEdges,
    searchResults,
  };
}

/**
 * Graph filtering utilities
 * Converted from useGraphFilters hook
 */

import type { FilterState } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

function matchesFilterCriteria(node: GraphNode, filters: FilterState): boolean {
  if (!filters.nodeTypes.has(node.type)) return false;
  if (!filters.platforms.has(node.platform)) return false;
  if (!filters.origins.has(node.origin)) return false;

  // Project filter: only applies to non-package nodes with a project
  if (node.project && node.type !== 'package' && !filters.projects.has(node.project)) return false;

  // Package filter: only applies to package nodes
  if (node.type === 'package' && !filters.packages.has(node.name)) return false;

  return true;
}

function matchesSearch(node: GraphNode, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  const matchesName = node.name.toLowerCase().includes(normalizedQuery);
  const matchesProject = node.project?.toLowerCase().includes(normalizedQuery);
  const matchesPackage =
    node.type === 'package' && node.name.toLowerCase().includes(normalizedQuery);

  return !!(matchesName || matchesProject || matchesPackage);
}

export function applyGraphFilters(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filters: FilterState,
  searchQuery: string,
): { filteredNodes: GraphNode[]; filteredEdges: GraphEdge[]; searchResults: number | null } {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredNodes = nodes.filter(
    (node) => matchesFilterCriteria(node, filters) && matchesSearch(node, normalizedQuery),
  );

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

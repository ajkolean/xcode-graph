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
} from '@shared/schemas/graph.schema';
import { matchesSearch } from './visibility';

function matchesFilterCriteria(node: GraphNode, filters: FilterState): boolean {
  if (!filters.nodeTypes.has(node.type)) return false;
  // Check if any of the node's platforms match the filter
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
  if (node.type === NodeType.Package && !filters.packages.has(node.name)) return false;

  return true;
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

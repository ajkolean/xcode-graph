import type { GraphNode as GraphNodeType } from '@shared/schemas/graph.types';

/**
 * Check if a node matches the search query.
 * Searches node name, type, and project fields (case-insensitive).
 */
export function matchesSearch(node: GraphNodeType, searchQuery: string): boolean {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  return (
    node.name.toLowerCase().includes(query) ||
    node.type.toLowerCase().includes(query) ||
    node.project?.toLowerCase().includes(query) ||
    false
  );
}

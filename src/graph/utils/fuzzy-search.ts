/**
 * Fuzzy Search Module
 *
 * Weighted fuzzy search over graph nodes using Fuse.js.
 * Replaces substring-only matchesSearch with multi-field fuzzy matching.
 */

import type { GraphNode } from '@shared/schemas/graph.types';
import Fuse from 'fuse.js';

const FUSE_OPTIONS: Fuse.IFuseOptions<GraphNode> = {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'project', weight: 1 },
    { name: 'type', weight: 0.5 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
};

let fuseInstance: Fuse<GraphNode> | null = null;
let cachedNodes: GraphNode[] = [];

/**
 * Get the set of node IDs matching a fuzzy search query.
 *
 * Returns `null` when the query is empty (meaning "no filtering").
 * Caches the Fuse index by nodes array reference for efficiency.
 *
 * @param nodes - All graph nodes to search
 * @param query - Search query string
 * @returns Set of matching node IDs, or null if query is empty
 *
 * @public
 */
export function getFuzzyMatchIds(nodes: GraphNode[], query: string): Set<string> | null {
  if (!query.trim()) return null; // null = no filtering

  if (nodes !== cachedNodes) {
    fuseInstance = new Fuse(nodes, FUSE_OPTIONS);
    cachedNodes = nodes;
  }

  // biome-ignore lint/style/noNonNullAssertion: fuseInstance is always set when cachedNodes matches
  const results = fuseInstance!.search(query);
  return new Set(results.map((r) => r.item.id));
}

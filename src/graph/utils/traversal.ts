/**
 * Graph traversal utilities with memoization
 * Converted from useTransitiveDependencies hook
 *
 * Performance optimization: Caches transitive dependency computations
 * to avoid repeated DFS traversals on the same graph structure.
 */

import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';

export interface TransitiveResult {
  /** Set of visited node IDs */
  nodes: Set<string>;
  /** Set of visited edge keys (formatted as `"source->target"`) */
  edges: Set<string>;
  /** Map from edge key to its depth in the traversal */
  edgeDepths: Map<string, number>;
  /** Map from node ID to its depth in the traversal */
  nodeDepths: Map<string, number>;
  /** Maximum depth reached during traversal */
  maxDepth: number;
}

interface CacheEntry {
  result: TransitiveResult;
  timestamp: number;
}

class TransitiveCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // LRU cache size
  private edgesReference: GraphEdge[] | null = null;
  private version = 0;

  /**
   * Check if edges have changed and invalidate cache if needed.
   * Uses reference identity as the primary check, with a monotonic
   * version counter to ensure cache keys are always unique per change.
   */
  invalidateIfEdgesChanged(edges: GraphEdge[]): void {
    if (this.edgesReference !== edges) {
      this.cache.clear();
      this.version++;
      this.edgesReference = edges;
    }
  }

  /**
   * Get cached result if available
   */
  get(nodeId: string, direction: 'dependencies' | 'dependents'): TransitiveResult | null {
    const key = `${nodeId}:${direction}:${this.version}`;
    const entry = this.cache.get(key);
    if (!entry) return null;

    entry.timestamp = Date.now();
    return entry.result;
  }

  /**
   * Store result in cache with LRU eviction
   */
  set(nodeId: string, direction: 'dependencies' | 'dependents', result: TransitiveResult): void {
    const key = `${nodeId}:${direction}:${this.version}`;

    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      let oldestKey: string | null = null;
      let oldestTime = Number.POSITIVE_INFINITY;

      for (const [k, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { result, timestamp: Date.now() });
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      version: this.version,
    };
  }
}

// Singleton cache instance
const transitiveCache = new TransitiveCache();

/**
 * Build outgoing and incoming adjacency lists from a list of edges.
 *
 * @returns An object with `outgoing` (source → targets) and `incoming` (target → sources) maps
 *
 * @example
 * ```ts
 * const edges = [{ source: 'A', target: 'B' }, { source: 'A', target: 'C' }];
 * const { outgoing, incoming } = buildAdjacency(edges);
 * outgoing.get('A'); // ['B', 'C']
 * incoming.get('B'); // ['A']
 * ```
 */
export function buildAdjacency(edges: GraphEdge[]): {
  outgoing: Map<string, string[]>;
  incoming: Map<string, string[]>;
} {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const edge of edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);

    outgoing.get(edge.source)?.push(edge.target);
    incoming.get(edge.target)?.push(edge.source);
  }

  return { outgoing: outgoing, incoming: incoming };
}

/**
 * Generic graph traversal using DFS
 *
 * @param startId - Starting node ID
 * @param getNeighbors - Function to get neighboring node IDs
 * @param getEdgeKey - Function to construct edge key from current and neighbor IDs
 * @returns Traversal result with visited nodes, edges, depths, and max depth
 */
export function traverseGraph(
  startId: string,
  getNeighbors: (id: string) => string[],
  getEdgeKey: (currentId: string, neighborId: string) => string,
): TransitiveResult {
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  const edgeDepths = new Map<string, number>();
  const nodeDepths = new Map<string, number>();
  let maxDepth = 0;

  const stack: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) break;
    const { id, depth } = item;
    if (visitedNodes.has(id)) continue;
    visitedNodes.add(id);
    nodeDepths.set(id, depth);
    maxDepth = Math.max(maxDepth, depth);

    for (const neighbor of getNeighbors(id)) {
      const edgeKey = getEdgeKey(id, neighbor);
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        edgeDepths.set(edgeKey, depth);
      }
      stack.push({ id: neighbor, depth: depth + 1 });
    }
  }

  return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, nodeDepths, maxDepth };
}

/** Empty result for when traversal is not needed */
const EMPTY_RESULT: TransitiveResult = {
  nodes: new Set<string>(),
  edges: new Set<string>(),
  edgeDepths: new Map(),
  nodeDepths: new Map(),
  maxDepth: 0,
};

/**
 * Compute transitive dependencies and/or dependents for a selected node.
 *
 * Results are memoized via an internal LRU cache keyed by edge identity.
 *
 * @param viewMode - Which direction to traverse (`'focused'` for deps, `'dependents'`, or `'both'`)
 * @param selectedNode - The node to start traversal from (or `null` for empty result)
 * @param edges - All graph edges
 * @returns Object containing `transitiveDeps` and `transitiveDependents` traversal results
 */
export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  // Invalidate cache if edges changed
  transitiveCache.invalidateIfEdgesChanged(edges);

  let adjacencyBuilt = false;
  let outgoing = new Map<string, string[]>();
  let incoming = new Map<string, string[]>();

  const buildAdjacencyOnce = () => {
    if (!adjacencyBuilt) {
      const adj = buildAdjacency(edges);
      outgoing = adj.outgoing;
      incoming = adj.incoming;
      adjacencyBuilt = true;
    }
    return { outgoing, incoming };
  };

  // Dependencies (outgoing edges) - with caching
  let transitiveDeps: TransitiveResult = EMPTY_RESULT;
  if ((viewMode === 'focused' || viewMode === 'both') && selectedNode) {
    const cached = transitiveCache.get(selectedNode.id, 'dependencies');
    if (cached) {
      transitiveDeps = cached;
    } else {
      const { outgoing: out } = buildAdjacencyOnce();
      transitiveDeps = traverseGraph(
        selectedNode.id,
        (id) => out.get(id) ?? [],
        (current, neighbor) => `${current}->${neighbor}`,
      );
      transitiveCache.set(selectedNode.id, 'dependencies', transitiveDeps);
    }
  }

  // Dependents (incoming edges) - with caching
  let transitiveDependents: TransitiveResult = EMPTY_RESULT;
  if (['dependents', 'both'].includes(viewMode) && selectedNode) {
    const cached = transitiveCache.get(selectedNode.id, 'dependents');
    if (cached) {
      transitiveDependents = cached;
    } else {
      const { incoming: inc } = buildAdjacencyOnce();
      transitiveDependents = traverseGraph(
        selectedNode.id,
        (id) => inc.get(id) ?? [],
        (current, neighbor) => `${neighbor}->${current}`,
      );
      transitiveCache.set(selectedNode.id, 'dependents', transitiveDependents);
    }
  }

  return { transitiveDeps, transitiveDependents };
}

/**
 * Export cache stats for debugging and testing
 */
export function getTransitiveCacheStats(): { size: number; maxSize: number; version: number } {
  return transitiveCache.getStats();
}

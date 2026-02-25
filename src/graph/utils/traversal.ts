/**
 * Graph traversal utilities with memoization
 * Converted from useTransitiveDependencies hook
 *
 * Performance optimization: Caches transitive dependency computations
 * to avoid repeated DFS traversals on the same graph structure.
 */

import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

export interface TransitiveResult {
  nodes: Set<string>;
  edges: Set<string>;
  edgeDepths: Map<string, number>;
  nodeDepths: Map<string, number>;
  maxDepth: number;
}

// ==================== Memoization Cache ====================

interface CacheEntry {
  result: TransitiveResult;
  timestamp: number;
}

class TransitiveCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // LRU cache size
  private edgesReference: GraphEdge[] | null = null;
  private edgesHash = '';

  /**
   * Generate a simple hash from edges array
   * Uses length and first/last edges as a quick fingerprint
   */
  private hashEdges(edges: GraphEdge[]): string {
    if (edges.length === 0) return 'empty';
    if (edges.length <= 2) {
      return edges.map((e) => `${e.source}→${e.target}`).join('|');
    }
    // Use length + first + last edges as fingerprint
    const first = edges[0]!;
    const last = edges[edges.length - 1]!;
    return `${edges.length}:${first.source}→${first.target}|${last.source}→${last.target}`;
  }

  /**
   * Check if edges have changed and invalidate cache if needed
   */
  invalidateIfEdgesChanged(edges: GraphEdge[]): void {
    const newHash = this.hashEdges(edges);
    if (this.edgesHash !== newHash || this.edgesReference !== edges) {
      this.cache.clear();
      this.edgesHash = newHash;
      this.edgesReference = edges;
    }
  }

  /**
   * Get cached result if available
   */
  get(nodeId: string, direction: 'dependencies' | 'dependents'): TransitiveResult | null {
    const key = `${nodeId}:${direction}:${this.edgesHash}`;
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    return entry.result;
  }

  /**
   * Store result in cache with LRU eviction
   */
  set(nodeId: string, direction: 'dependencies' | 'dependents', result: TransitiveResult): void {
    const key = `${nodeId}:${direction}:${this.edgesHash}`;

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
      edgesHash: this.edgesHash,
    };
  }
}

// Singleton cache instance
const transitiveCache = new TransitiveCache();

export function buildAdjacency(edges: GraphEdge[]) {
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const edge of edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);

    outgoing.get(edge.source)!.push(edge.target);
    incoming.get(edge.target)!.push(edge.source);
  }

  return { outgoing, incoming };
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
    const { id, depth } = stack.pop()!;
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

export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  // Invalidate cache if edges changed
  transitiveCache.invalidateIfEdgesChanged(edges);

  // Build adjacency only if we need to compute (not cached)
  let adjacencyBuilt = false;
  let outgoing: Map<string, string[]> | null = null;
  let incoming: Map<string, string[]> | null = null;

  const buildAdjacencyOnce = () => {
    if (!adjacencyBuilt) {
      const adj = buildAdjacency(edges);
      outgoing = adj.outgoing;
      incoming = adj.incoming;
      adjacencyBuilt = true;
    }
    return { outgoing: outgoing!, incoming: incoming! };
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
export function getTransitiveCacheStats(): { size: number; maxSize: number; edgesHash: string } {
  return transitiveCache.getStats();
}

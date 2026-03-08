/**
 * Graph traversal utilities with memoization
 *
 * Performance optimization: Caches transitive dependency computations
 * to avoid repeated traversals on the same graph structure.
 *
 * Uses graphology for adjacency when available, with standalone BFS/DFS
 * functions as fallback for contexts without a full graph instance.
 */

import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { DirectedGraph } from 'graphology';

/** @public */
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

/** LRU cache for transitive traversal results, keyed by node ID, direction, and edge version. */
class TransitiveCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 500; // LRU cache size (larger to reduce thrashing on big graphs)
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
 *
 * @public
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

  return { outgoing, incoming };
}

/**
 * Generic graph traversal using DFS
 *
 * @param startId - Starting node ID
 * @param getNeighbors - Function to get neighboring node IDs
 * @param getEdgeKey - Function to construct edge key from current and neighbor IDs
 * @returns Traversal result with visited nodes, edges, depths, and max depth
 *
 * @public
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
    /* v8 ignore next */
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

/**
 * Generic graph traversal using BFS (breadth-first search)
 *
 * Unlike DFS, BFS guarantees shortest-path depths because it explores
 * all nodes at depth N before moving to depth N+1.
 *
 * @param startId - Starting node ID
 * @param getNeighbors - Function to get neighboring node IDs
 * @param getEdgeKey - Function to construct edge key from current and neighbor IDs
 * @returns Traversal result with visited nodes, edges, depths, and max depth
 *
 * @public
 */
export function bfsTraverseGraph(
  startId: string,
  getNeighbors: (id: string) => string[],
  getEdgeKey: (currentId: string, neighborId: string) => string,
): TransitiveResult {
  const visitedNodes = new Set<string>([startId]);
  const visitedEdges = new Set<string>();
  const edgeDepths = new Map<string, number>();
  const nodeDepths = new Map<string, number>();
  nodeDepths.set(startId, 0);
  let maxDepth = 0;

  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const item = queue.shift();
    /* v8 ignore next */
    if (!item) break;
    const { id, depth } = item;

    for (const neighbor of getNeighbors(id)) {
      const edgeKey = getEdgeKey(id, neighbor);
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        edgeDepths.set(edgeKey, depth);
      }

      if (!visitedNodes.has(neighbor)) {
        visitedNodes.add(neighbor);
        const neighborDepth = depth + 1;
        nodeDepths.set(neighbor, neighborDepth);
        maxDepth = Math.max(maxDepth, neighborDepth);
        queue.push({ id: neighbor, depth: neighborDepth });
      }
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

/** Format an edge key based on traversal direction. */
function formatEdgeKey(direction: 'out' | 'in', id: string, neighbor: string): string {
  return direction === 'out' ? `${id}->${neighbor}` : `${neighbor}->${id}`;
}

/** Get neighbors based on traversal direction. */
function getDirectedNeighbors(graph: DirectedGraph, id: string, direction: 'out' | 'in'): string[] {
  return direction === 'out' ? graph.outNeighbors(id) : graph.inNeighbors(id);
}

/**
 * BFS traversal over a graphology DirectedGraph instance.
 * Used internally by computeTransitiveDependencies for efficient cached traversal.
 */
function bfsGraphology(
  graph: DirectedGraph,
  startId: string,
  direction: 'out' | 'in',
): TransitiveResult {
  const visitedNodes = new Set<string>([startId]);
  const visitedEdges = new Set<string>();
  const edgeDepths = new Map<string, number>();
  const nodeDepths = new Map<string, number>();
  nodeDepths.set(startId, 0);
  let maxDepth = 0;

  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id, depth } = item;

    for (const neighbor of getDirectedNeighbors(graph, id, direction)) {
      const edgeKey = formatEdgeKey(direction, id, neighbor);
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        edgeDepths.set(edgeKey, depth);
      }

      if (!visitedNodes.has(neighbor)) {
        visitedNodes.add(neighbor);
        const neighborDepth = depth + 1;
        nodeDepths.set(neighbor, neighborDepth);
        maxDepth = Math.max(maxDepth, neighborDepth);
        queue.push({ id: neighbor, depth: neighborDepth });
      }
    }
  }

  return { nodes: visitedNodes, edges: visitedEdges, edgeDepths, nodeDepths, maxDepth };
}

/** Cached graphology instance for computeTransitiveDependencies */
let cachedGraph: DirectedGraph | null = null;
let cachedEdgesRef: GraphEdge[] | null = null;

/** Build or reuse a graphology instance from edges */
function getGraphForEdges(edges: GraphEdge[]): DirectedGraph {
  if (cachedEdgesRef === edges && cachedGraph) return cachedGraph;

  const graph = new DirectedGraph();
  // Collect unique node IDs from edges
  for (const edge of edges) {
    if (!graph.hasNode(edge.source)) graph.addNode(edge.source);
    if (!graph.hasNode(edge.target)) graph.addNode(edge.target);
    graph.addEdge(edge.source, edge.target);
  }
  cachedGraph = graph;
  cachedEdgesRef = edges;
  return graph;
}

/**
 * Compute transitive dependencies and/or dependents for a selected node.
 *
 * Results are memoized via an internal LRU cache keyed by edge identity.
 * Uses graphology for efficient adjacency traversal.
 *
 * @param viewMode - Which direction to traverse (`'focused'` for deps, `'dependents'`, or `'both'`)
 * @param selectedNode - The node to start traversal from (or `null` for empty result)
 * @param edges - All graph edges
 * @returns Object containing `transitiveDeps` and `transitiveDependents` traversal results
 *
 * @public
 */
/** Resolve a traversal result from cache or compute via BFS. */
function resolveTraversal(
  nodeId: string,
  edges: GraphEdge[],
  cacheKey: 'dependencies' | 'dependents',
  direction: 'out' | 'in',
): TransitiveResult {
  const cached = transitiveCache.get(nodeId, cacheKey);
  if (cached) return cached;

  let result: TransitiveResult = EMPTY_RESULT;
  const graph = getGraphForEdges(edges);
  if (graph.hasNode(nodeId)) {
    result = bfsGraphology(graph, nodeId, direction);
  }
  transitiveCache.set(nodeId, cacheKey, result);
  return result;
}

/** @public */
export function computeTransitiveDependencies(
  viewMode: ViewMode,
  selectedNode: GraphNode | null,
  edges: GraphEdge[],
): { transitiveDeps: TransitiveResult; transitiveDependents: TransitiveResult } {
  transitiveCache.invalidateIfEdgesChanged(edges);

  const wantDeps = (viewMode === 'focused' || viewMode === 'both') && selectedNode;
  const wantDependents = (viewMode === 'dependents' || viewMode === 'both') && selectedNode;

  const transitiveDeps = wantDeps
    ? resolveTraversal(selectedNode.id, edges, 'dependencies', 'out')
    : EMPTY_RESULT;

  const transitiveDependents = wantDependents
    ? resolveTraversal(selectedNode.id, edges, 'dependents', 'in')
    : EMPTY_RESULT;

  return { transitiveDeps, transitiveDependents };
}

/**
 * Export cache stats for debugging and testing
 */
export function getTransitiveCacheStats(): { size: number; maxSize: number; version: number } {
  return transitiveCache.getStats();
}

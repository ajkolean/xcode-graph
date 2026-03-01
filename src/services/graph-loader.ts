/** Loads large graphs incrementally in priority-ordered chunks to avoid blocking the UI. */

import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';

/**
 * Progress update during graph loading
 */
export interface LoadProgress {
  /** Whether this is a chunk update or completion */
  type: 'chunk' | 'complete';
  loadedNodes: number;
  totalNodes: number;
  loadedEdges: number;
  totalEdges: number;
  /** Loading percentage (0-100) */
  percentage: number;
  /** The current chunk being loaded */
  chunk?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

/**
 * Configuration for progressive graph loading
 */
export interface ProgressiveLoadConfig {
  /** Number of nodes to load per chunk (default: 100) */
  chunkSize?: number;
  /** Milliseconds to wait between chunks for UI responsiveness (default: 10) */
  delayBetweenChunks?: number;
  /** Cluster IDs to load first (default: []) */
  priorityClusterIds?: string[];
}

export class GraphLoader {
  private readonly config: Required<ProgressiveLoadConfig>;

  /**
   * Priority ordering for node types during loading
   * Lower numbers are loaded first
   */
  private static readonly TYPE_PRIORITY: Record<string, number> = {
    app: 1,
    framework: 2,
    library: 3,
    cli: 4,
    package: 5,
    'test-unit': 6,
    'test-ui': 7,
  };

  constructor(config: ProgressiveLoadConfig = {}) {
    this.config = {
      chunkSize: config.chunkSize ?? 100,
      delayBetweenChunks: config.delayBetweenChunks ?? 10,
      priorityClusterIds: config.priorityClusterIds ?? [],
    };
  }

  async loadGraphProgressive(
    nodes: GraphNode[],
    edges: GraphEdge[],
    onProgress: (progress: LoadProgress) => void,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    if (nodes.length === 0) {
      onProgress({
        type: 'complete',
        loadedNodes: 0,
        totalNodes: 0,
        loadedEdges: 0,
        totalEdges: 0,
        percentage: 100,
      });
      return { nodes: [], edges: [] };
    }

    // Prioritize nodes by cluster
    const prioritizedNodes = this.prioritizeNodes(nodes);

    const loadedNodes: GraphNode[] = [];
    const loadedNodeIds = new Set<string>();

    // Load nodes in chunks
    for (let i = 0; i < prioritizedNodes.length; i += this.config.chunkSize) {
      const chunk = prioritizedNodes.slice(i, i + this.config.chunkSize);

      loadedNodes.push(...chunk);
      chunk.forEach((node) => {
        loadedNodeIds.add(node.id);
      });

      // Find edges for this chunk
      const chunkEdges = edges.filter(
        (edge) => loadedNodeIds.has(edge.source) && loadedNodeIds.has(edge.target),
      );

      // Send progress update
      onProgress({
        type: 'chunk',
        loadedNodes: loadedNodes.length,
        totalNodes: nodes.length,
        loadedEdges: chunkEdges.length,
        totalEdges: edges.length,
        percentage: (loadedNodes.length / nodes.length) * 100,
        chunk: {
          nodes: chunk,
          edges: chunkEdges,
        },
      });

      // Yield to UI thread
      if (i + this.config.chunkSize < prioritizedNodes.length) {
        await this.delay(this.config.delayBetweenChunks);
      }
    }

    // Final complete message
    onProgress({
      type: 'complete',
      loadedNodes: nodes.length,
      totalNodes: nodes.length,
      loadedEdges: edges.length,
      totalEdges: edges.length,
      percentage: 100,
    });

    return { nodes, edges };
  }

  /**
   * Load graph by cluster priority
   * Loads priority clusters first, then others
   */
  async loadByClusterPriority(
    clusters: Cluster[],
    nodes: GraphNode[],
    edges: GraphEdge[],
    onProgress: (progress: LoadProgress) => void,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const priorityClusters = clusters.filter((c) => this.config.priorityClusterIds.includes(c.id));
    const otherClusters = clusters.filter((c) => !this.config.priorityClusterIds.includes(c.id));

    const orderedClusters = [...priorityClusters, ...otherClusters];

    const loadedNodes: GraphNode[] = [];
    const loadedNodeIds = new Set<string>();

    // Load cluster by cluster
    for (let i = 0; i < orderedClusters.length; i++) {
      const cluster = orderedClusters[i];
      if (!cluster) continue;
      const clusterNodes = cluster.nodes;

      loadedNodes.push(...clusterNodes);
      clusterNodes.forEach((node) => {
        loadedNodeIds.add(node.id);
      });

      // Find edges for loaded nodes so far
      const currentEdges = edges.filter(
        (edge) => loadedNodeIds.has(edge.source) && loadedNodeIds.has(edge.target),
      );

      onProgress({
        type: 'chunk',
        loadedNodes: loadedNodes.length,
        totalNodes: nodes.length,
        loadedEdges: currentEdges.length,
        totalEdges: edges.length,
        percentage: (loadedNodes.length / nodes.length) * 100,
        chunk: {
          nodes: clusterNodes,
          edges: currentEdges,
        },
      });

      // Yield to UI
      if (i + 1 < orderedClusters.length) {
        await this.delay(this.config.delayBetweenChunks);
      }
    }

    onProgress({
      type: 'complete',
      loadedNodes: nodes.length,
      totalNodes: nodes.length,
      loadedEdges: edges.length,
      totalEdges: edges.length,
      percentage: 100,
    });

    return { nodes, edges };
  }

  estimateLoadTime(nodeCount: number): {
    chunks: number;
    estimatedMs: number;
    recommendation: 'instant' | 'fast' | 'progressive';
  } {
    const chunks = Math.ceil(nodeCount / this.config.chunkSize);
    const estimatedMs = chunks * this.config.delayBetweenChunks;

    let recommendation: 'instant' | 'fast' | 'progressive';
    if (nodeCount < 100) {
      recommendation = 'instant';
    } else if (nodeCount < 500) {
      recommendation = 'fast';
    } else {
      recommendation = 'progressive';
    }

    return { chunks, estimatedMs, recommendation };
  }

  private prioritizeNodes(nodes: GraphNode[]): GraphNode[] {
    // Prioritize by:
    // 1. Priority clusters (if specified)
    // 2. Node type (apps/frameworks first, tests last)
    // 3. Number of dependencies (hubs first)

    return nodes.slice().sort((a, b) => {
      // Priority clusters
      const aIsPriority = this.config.priorityClusterIds.includes(a.project || '');
      const bIsPriority = this.config.priorityClusterIds.includes(b.project || '');

      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;

      // Node type priority
      const aPriority = GraphLoader.TYPE_PRIORITY[a.type] || 10;
      const bPriority = GraphLoader.TYPE_PRIORITY[b.type] || 10;

      return aPriority - bPriority;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Progressive Graph Loading Service
 *
 * Loads and renders large graphs incrementally to prevent UI blocking.
 * Uses chunking strategy to progressively build the graph.
 *
 * Benefits:
 * - Large graphs don't freeze the UI on load
 * - Users see partial graph immediately
 * - Better perceived performance
 * - Priority-based loading (visible clusters first)
 */
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
/**
 * Progress update during graph loading
 */
export interface LoadProgress {
    /** Whether this is a chunk update or completion */
    type: 'chunk' | 'complete';
    /** Number of nodes loaded so far */
    loadedNodes: number;
    /** Total nodes to load */
    totalNodes: number;
    /** Number of edges loaded so far */
    loadedEdges: number;
    /** Total edges to load */
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
export declare class GraphLoader {
    private readonly config;
    /**
     * Priority ordering for node types during loading
     * Lower numbers are loaded first
     */
    private static readonly TYPE_PRIORITY;
    constructor(config?: ProgressiveLoadConfig);
    /**
     * Load graph progressively with callbacks for each chunk
     */
    loadGraphProgressive(nodes: GraphNode[], edges: GraphEdge[], onProgress: (progress: LoadProgress) => void): Promise<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }>;
    /**
     * Load graph by cluster priority
     * Loads priority clusters first, then others
     */
    loadByClusterPriority(clusters: Cluster[], nodes: GraphNode[], edges: GraphEdge[], onProgress: (progress: LoadProgress) => void): Promise<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }>;
    /**
     * Estimate load time for a graph
     */
    estimateLoadTime(nodeCount: number): {
        chunks: number;
        estimatedMs: number;
        recommendation: 'instant' | 'fast' | 'progressive';
    };
    private prioritizeNodes;
    private delay;
}

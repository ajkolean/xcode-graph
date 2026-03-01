/**
 * Web Worker API Types
 *
 * Defines the contract between main thread and layout worker.
 * Uses Comlink for type-safe, promise-based worker communication.
 */
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
/**
 * Input data for layout computation
 */
export interface LayoutInput {
    nodes: GraphNode[];
    edges: GraphEdge[];
    enableAnimation?: boolean;
    animationTicks?: number;
}
/**
 * Output data from layout computation
 */
export interface LayoutOutput {
    nodePositions: Map<string, NodePosition>;
    clusterPositions: Map<string, ClusterPosition>;
    clusters: Cluster[];
    isAnimating: boolean;
    tickCount: number;
    totalTicks: number;
}
/**
 * Progress update during animation
 */
export interface LayoutProgress {
    type: 'progress' | 'complete';
    tickCount: number;
    totalTicks: number;
    nodePositions?: Map<string, NodePosition>;
    clusterPositions?: Map<string, ClusterPosition>;
}
/**
 * Layout Worker API
 * Exposed to main thread via Comlink
 */
export interface LayoutWorkerAPI {
    /**
     * Compute initial deterministic layout
     * Fast, synchronous computation
     */
    computeInitialLayout(input: LayoutInput): Promise<LayoutOutput>;
    /**
     * Compute animated layout with physics
     * Returns initial layout immediately, then streams updates via callback
     */
    computeAnimatedLayout(input: LayoutInput, onProgress: (progress: LayoutProgress) => void): Promise<LayoutOutput>;
    /**
     * Cancel ongoing animation
     */
    cancelAnimation(): Promise<void>;
    /**
     * Get worker status
     */
    getStatus(): Promise<{
        isAnimating: boolean;
        currentTick: number;
        totalTicks: number;
    }>;
}
/**
 * Serializable versions of Map for worker communication
 */
export type SerializedNodePositions = Array<[string, NodePosition]>;
export type SerializedClusterPositions = Array<[string, ClusterPosition]>;
/**
 * Helper to serialize Map for worker transfer
 */
export declare function serializeMap<K, V>(map: Map<K, V>): Array<[K, V]>;
/**
 * Helper to deserialize Map from worker transfer
 */
export declare function deserializeMap<K, V>(entries: Array<[K, V]>): Map<K, V>;
//# sourceMappingURL=layout-api.d.ts.map
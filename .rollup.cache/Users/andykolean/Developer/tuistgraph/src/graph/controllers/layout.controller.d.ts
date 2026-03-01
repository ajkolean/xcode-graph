/**
 * Layout Controller - Deterministic graph layout computation
 *
 * Handles deterministic layout computation only, separated from physics
 * and animation for single responsibility principle compliance.
 *
 * **Responsibilities:**
 * - Cluster grouping and analysis
 * - Deterministic position calculation (via ELK)
 * - Initial layout state preparation
 *
 * **Architecture:**
 * This controller only computes static positions. Physics and animation
 * are handled by separate controllers (PhysicsController, AnimationController).
 *
 * @module controllers/layout
 */
import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Result of layout computation
 */
export interface LayoutResult {
    nodePositions: Map<string, NodePosition>;
    clusterPositions: Map<string, ClusterPosition>;
    clusters: Cluster[];
    /** Aggregated edges between clusters (Arteries) */
    clusterEdges?: {
        source: string;
        target: string;
        weight: number;
    }[] | undefined;
    /** Port-routed edges for cross-cluster connections */
    routedEdges?: RoutedEdge[] | undefined;
    /** Nodes that are part of cycles (SCC size > 1) */
    cycleNodes?: Set<string> | undefined;
    /** SCC ID for each node (nodes in same SCC share an ID) - for cycle edge detection */
    nodeSccId?: Map<string, number> | undefined;
    /** Size of each SCC (size > 1 indicates a cycle) */
    sccSizes?: Map<number, number> | undefined;
}
/**
 * Reactive controller for deterministic graph layout
 *
 * Computes cluster-based hierarchical layouts with caching for performance.
 * Positions are initialized with zero velocity for physics simulation.
 */
export declare class LayoutController implements ReactiveController {
    private host;
    private cachedResult;
    private cachedNodes;
    private cachedEdges;
    isComputing: boolean;
    constructor(host: ReactiveControllerHost);
    /**
     * Compute deterministic layout positions (Async)
     * Returns positions with velocities initialized to 0
     *
     * @param nodes - All graph nodes
     * @param edges - All graph edges
     * @param forceRecompute - Force recomputation even if cached
     * @returns Promise resolving to Layout result with positions and clusters
     */
    computeLayout(nodes: GraphNode[], edges: GraphEdge[], forceRecompute?: boolean): Promise<LayoutResult>;
    /**
     * Clear cached layout (force recomputation on next call)
     */
    clearCache(): void;
    /**
     * Get current cached result (if any)
     */
    getCachedResult(): LayoutResult | null;
    private isSameInput;
    private cacheResult;
    hostConnected(): void;
    hostDisconnected(): void;
}
//# sourceMappingURL=layout.controller.d.ts.map
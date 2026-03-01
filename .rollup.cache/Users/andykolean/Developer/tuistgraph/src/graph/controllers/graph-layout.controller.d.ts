/**
 * Graph Layout Controller - Unified layout orchestration
 *
 * **This is the default/recommended controller for graph layout.**
 *
 * Unified controller that composes Layout, Physics, and Animation controllers
 * for graph layout computation with optional physics-based settling animation.
 * Runs on the main thread, which is suitable for most graphs (<1000 nodes).
 *
 * ## When to Use This Controller
 *
 * **Use GraphLayoutController when:**
 * - Graph has <1000 nodes (most use cases)
 * - You want a simpler, synchronous API
 * - Main thread blocking is acceptable (~10-50ms for typical graphs)
 *
 * **Use {@link LayoutWorkerController} instead when:**
 * - Graph has 1000+ nodes where layout computation takes >100ms
 * - UI responsiveness is critical during layout (e.g., concurrent drag interactions)
 * - You need progress callbacks during animated layout
 *
 * ## Architecture
 * - Single Responsibility Principle (each sub-controller has one job)
 * - DRY (no duplicate collision code)
 * - Better testability (each controller tested independently)
 * - Lower cognitive complexity
 *
 * ## Sub-Controllers
 * - `LayoutController`: Computes initial deterministic positions
 * - `PhysicsController`: Calculates physics forces
 * - `AnimationController`: Manages animation loop
 *
 * @module controllers/graph-layout
 * @see {@link LayoutWorkerController} - Alternative for large graphs (1000+ nodes)
 */
import type { RoutedEdge } from '@graph/layout/types';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Configuration for graph layout with optional animation
 */
export interface GraphLayoutConfig {
    enableAnimation?: boolean;
    animationTicks?: number;
    nodeCollisionStrength?: number;
    clusterCollisionStrength?: number;
}
/**
 * Unified layout controller with composed sub-controllers
 */
export declare class GraphLayoutController implements ReactiveController {
    private readonly host;
    private readonly layoutController;
    enableAnimation: boolean;
    get nodePositions(): Map<string, NodePosition>;
    get clusterPositions(): Map<string, ClusterPosition>;
    get clusters(): Cluster[];
    get isSettling(): boolean;
    /** Nodes that are part of cycles (SCC size > 1) */
    get cycleNodes(): Set<string> | undefined;
    /** SCC ID for each node - nodes in same SCC share an ID */
    get nodeSccId(): Map<string, number> | undefined;
    /** Size of each SCC (size > 1 indicates a cycle) */
    get sccSizes(): Map<number, number> | undefined;
    /** Aggregated edges between clusters (Arteries) */
    get clusterEdges(): {
        source: string;
        target: string;
        weight: number;
    }[] | undefined;
    /** Port-routed edges for cross-cluster connections */
    get routedEdges(): RoutedEdge[] | undefined;
    private _nodePositions;
    private _clusterPositions;
    private _clusters;
    private _cycleNodes;
    private _nodeSccId;
    private _sccSizes;
    private _clusterEdges;
    private _routedEdges;
    constructor(host: ReactiveControllerHost, config?: GraphLayoutConfig);
    /**
     * Compute layout - ELK runs asynchronously
     */
    computeLayout(nodes: GraphNode[], edges: GraphEdge[]): Promise<void>;
    /**
     * Stop animation - no-op (D3 runs synchronously)
     */
    stopAnimation(): void;
    /**
     * Get animation progress - always complete
     */
    getProgress(): number;
    /**
     * Check if animation is active - always false
     */
    isAnimationActive(): boolean;
    setEnableAnimation(enabled: boolean): void;
    setAnimationTicks(_ticks: number): void;
    setNodeCollisionStrength(_strength: number): void;
    setClusterCollisionStrength(_strength: number): void;
    hostConnected(): void;
    hostDisconnected(): void;
}

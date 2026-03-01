/**
 * Graph Statistics Service
 *
 * Calculates statistics for nodes, clusters, and the entire graph.
 * Stateless service that operates on GraphDataService.
 */
import type { GraphDataService } from './graph-data-service';
export declare const GraphStatsService: {
    /**
     * Get node statistics
     */
    readonly getNodeStats: (service: GraphDataService, nodeId: string) => {
        dependencies: number;
        dependents: number;
        transitiveDeps: number;
        transitiveDependents: number;
    };
    /**
     * Get cluster statistics
     */
    readonly getClusterStats: (service: GraphDataService, clusterId: string) => {
        nodeCount: number;
        dependencies: number;
        dependents: number;
        platforms: Set<string>;
    };
    /**
     * Get overall graph statistics
     */
    readonly getGraphStats: (service: GraphDataService) => {
        totalNodes: number;
        totalEdges: number;
        avgDependencies: number;
        maxDependencies: number;
        isolatedNodes: number;
    };
};
//# sourceMappingURL=graph-stats-service.d.ts.map
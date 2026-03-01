/**
 * Graph Analysis Service
 *
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 */
import type { GraphDataService } from './graph-data-service';
export declare const GraphAnalysisService: {
    /**
     * Check if there's a path between two nodes
     */
    readonly hasPath: (service: GraphDataService, fromId: string, toId: string) => boolean;
    /**
     * Detect circular dependencies in the graph
     */
    readonly findCircularDependencies: (service: GraphDataService) => string[][];
};

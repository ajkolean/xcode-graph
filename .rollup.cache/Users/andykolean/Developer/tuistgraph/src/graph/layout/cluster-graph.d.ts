import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
export interface ClusterEdge {
    source: string;
    target: string;
    weight: number;
    tieStrength: number;
}
export interface ClusterGraph {
    nodes: Cluster[];
    edges: ClusterEdge[];
    nodeToCluster: Map<string, string>;
}
/**
 * Build the weighted Cluster Meta-Graph
 *
 * Compresses the node graph into a cluster graph where:
 * - Nodes are Clusters
 * - Edges are aggregated dependencies between clusters
 * - Weights reflect the number of dependencies (strata/attraction)
 */
export declare function buildClusterGraph(_nodes: GraphNode[], edges: GraphEdge[], clusters: Cluster[]): ClusterGraph;
//# sourceMappingURL=cluster-graph.d.ts.map
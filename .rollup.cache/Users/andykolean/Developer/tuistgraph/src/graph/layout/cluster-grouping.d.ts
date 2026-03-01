import { type Cluster, type ClusterLayoutConfig } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * Groups nodes into clusters by project/package
 */
export declare function groupIntoClusters(nodes: GraphNode[], edges: GraphEdge[]): Cluster[];
/**
 * Arranges clusters in a grid layout
 */
export declare function arrangeClusterGrid(clusters: Cluster[], config?: ClusterLayoutConfig): Map<string, {
    x: number;
    y: number;
}>;

/**
 * Layout Reporter - Position dump and analysis utilities
 *
 * Generates human-readable reports of cluster and node positions
 * for layout review and optimization.
 */
import type { GraphEdge } from '@shared/schemas/graph.types';
import type { HierarchicalLayoutResult } from './types';
export interface ClusterReport {
    id: string;
    stratum: number;
    x: number;
    y: number;
    width: number;
    height: number;
    nodeCount: number;
}
export interface NodeReport {
    id: string;
    clusterId: string;
    relativeX: number;
    relativeY: number;
    absoluteX: number;
    absoluteY: number;
}
export interface LayoutSummary {
    totalClusters: number;
    totalNodes: number;
    boundingBox: {
        width: number;
        height: number;
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    };
    aspectRatio: number;
    strataCount: number;
}
export interface PositionReport {
    clusters: ClusterReport[];
    nodes: NodeReport[];
    summary: LayoutSummary;
}
/**
 * Generate a complete position report from layout results
 */
export declare function generatePositionReport(result: HierarchicalLayoutResult, strataSpacing?: number): PositionReport;
/**
 * Print formatted cluster position table
 */
export declare function printClusterTable(result: HierarchicalLayoutResult, strataSpacing?: number): void;
/**
 * Print nodes grouped by cluster
 */
export declare function printNodesByCluster(result: HierarchicalLayoutResult, maxNodesPerCluster?: number): void;
/**
 * Print ASCII visualization of cluster strata
 */
export declare function printStrataVisualization(result: HierarchicalLayoutResult, strataSpacing?: number): void;
/**
 * Print layout summary
 */
export declare function printLayoutSummary(report: PositionReport): void;
/**
 * Export position report to JSON string
 */
export declare function exportToJSON(report: PositionReport): string;
/**
 * Export cluster positions to CSV string
 */
export declare function exportClustersToCSV(report: PositionReport): string;
/**
 * Export node positions to CSV string
 */
export declare function exportNodesToCSV(report: PositionReport): string;
/**
 * Find clusters with most cross-stratum edges (hub clusters)
 */
export declare function findHubClusters(result: HierarchicalLayoutResult, edges: GraphEdge[], nodeToCluster: Map<string, string>, strataSpacing?: number): Array<{
    clusterId: string;
    crossStrataEdges: number;
    connectedStrata: number;
}>;
/**
 * Find isolated clusters (few or no cross-cluster connections)
 */
export declare function findIsolatedClusters(result: HierarchicalLayoutResult, edges: GraphEdge[], nodeToCluster: Map<string, string>): Array<{
    clusterId: string;
    connectionCount: number;
}>;

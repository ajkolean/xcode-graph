/**
 * Layout Module
 *
 * Exports the main layout engine and configuration.
 * Retains backward compatibility for cluster analysis tools.
 */
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { LayoutOptions } from './config';
import type { HierarchicalLayoutResult } from './types';
export { analyzeCluster, determineRole, identifyAnchors, } from './cluster-analysis';
export { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';
export * from './config';
export * from './types';
/**
 * Main layout computation function.
 * Wraps the core engine with default Role-based Z-offset logic.
 *
 * NOTE: This is now ASYNCHRONOUS as it uses ELK.
 */
export declare function computeHierarchicalLayout(nodes: GraphNode[], edges: GraphEdge[], clusters: Cluster[], opts?: LayoutOptions): Promise<HierarchicalLayoutResult>;
//# sourceMappingURL=index.d.ts.map
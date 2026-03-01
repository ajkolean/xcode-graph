/**
 * Layout Module
 *
 * Exports the main layout engine and configuration.
 * Retains backward compatibility for cluster analysis tools.
 */

import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import type { LayoutOptions } from './config';
import { computeHierarchicalLayout as computeEngine } from './hierarchical-layout';
import type { HierarchicalLayoutResult } from './types';

export {
  analyzeCluster,
  determineRole,
  identifyAnchors,
} from './cluster-analysis';

export { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';
export * from './config';
export * from './types';

/**
 * Main layout computation function.
 * Delegates to the core ELK-based engine.
 *
 * NOTE: This is ASYNCHRONOUS as it uses ELK.
 */
export async function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
): Promise<HierarchicalLayoutResult> {
  return computeEngine(nodes, edges, clusters, opts);
}

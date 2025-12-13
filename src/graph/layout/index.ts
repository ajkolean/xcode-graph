/**
 * Layout Module
 * 
 * Exports the main layout engine and configuration.
 * Retains backward compatibility for cluster analysis tools.
 */

import { NodeRole } from '@shared/schemas/cluster.schema';
import type { Cluster } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { computeHierarchicalLayout as computeEngine } from './engine';
import { type LayoutOptions } from './config';

export {
  analyzeCluster,
  determineRole,
  identifyAnchors,
} from './cluster-analysis';

export { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';

export * from './types';
export * from './config';

/**
 * Role-based Z-axis offsets (solar system depth model)
 * Preserved for backward compatibility via the default adapter below.
 */
const ROLE_Z_OFFSET: Record<NodeRole, number> = {
  [NodeRole.Entry]: -100,
  [NodeRole.InternalFramework]: +50,
  [NodeRole.InternalLib]: +20,
  [NodeRole.Utility]: 0,
  [NodeRole.Test]: -100,
  [NodeRole.Tool]: -100,
};

/**
 * Main layout computation function.
 * Wraps the core engine with default Role-based Z-offset logic.
 */
export function computeHierarchicalLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  opts: LayoutOptions = {},
) {
  // Pre-compute role map for performance
  const nodeRoles = new Map<string, NodeRole>();
  for (const cluster of clusters) {
    if (!cluster.metadata) continue;
    for (const [nodeId, meta] of cluster.metadata) {
      if (meta.role) {
        nodeRoles.set(nodeId, meta.role);
      }
    }
  }

  // Inject default Z-offset resolver if not present
  const options: LayoutOptions = {
    ...opts,
    getNodeZOffset: opts.getNodeZOffset ?? ((nodeId: string) => {
      const role = nodeRoles.get(nodeId);
      return role ? (ROLE_Z_OFFSET[role] ?? 0) : 0;
    }),
  };

  return computeEngine(nodes, edges, clusters, options);
}

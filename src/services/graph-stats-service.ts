/**
 * Graph Statistics Service
 *
 * Calculates statistics for nodes, clusters, and the entire graph.
 * Stateless service that operates on GraphDataService.
 */

import type { GraphDataService } from './graph-data-service';

export const GraphStatsService = {
  getNodeStats(
    service: GraphDataService,
    nodeId: string,
  ): {
    dependencies: number;
    dependents: number;
    transitiveDeps: number;
    transitiveDependents: number;
  } {
    const deps = service.getDirectDependencies(nodeId);
    const dependents = service.getDirectDependents(nodeId);
    const transitiveDeps = service.getTransitiveDependencies(nodeId);
    const transitiveDependents = service.getTransitiveDependents(nodeId);

    return {
      dependencies: deps.length,
      dependents: dependents.length,
      transitiveDeps: transitiveDeps.nodes.size - 1, // Exclude self
      transitiveDependents: transitiveDependents.nodes.size - 1, // Exclude self
    };
  },

  getClusterStats(
    service: GraphDataService,
    clusterId: string,
  ): {
    nodeCount: number;
    dependencies: number;
    dependents: number;
    platforms: Set<string>;
  } {
    const clusterNodes = service.getClusterNodes(clusterId);

    let dependencies = 0;
    for (const node of clusterNodes) {
      dependencies += service.getOutgoingEdges(node.id).length;
    }

    let dependents = 0;
    for (const node of clusterNodes) {
      dependents += service.getIncomingEdges(node.id).length;
    }

    const platforms = new Set(clusterNodes.map((n) => n.platform).filter(Boolean));

    return {
      nodeCount: clusterNodes.length,
      dependencies,
      dependents,
      platforms,
    };
  },

  getGraphStats(service: GraphDataService): {
    totalNodes: number;
    totalEdges: number;
    avgDependencies: number;
    maxDependencies: number;
    isolatedNodes: number;
  } {
    const nodes = service.getAllNodes();
    const edges = service.getAllEdges();

    const depCounts = new Map<string, number>();

    for (const node of nodes) {
      depCounts.set(node.id, 0);
    }

    for (const node of nodes) {
      const outgoing = service.getOutgoingEdges(node.id);
      depCounts.set(node.id, outgoing.length);
    }

    const counts = Array.from(depCounts.values());
    const totalDeps = counts.reduce((sum, c) => sum + c, 0);
    const avgDeps = nodes.length > 0 ? totalDeps / nodes.length : 0;
    const maxDeps = Math.max(0, ...counts);

    const isolated = nodes.filter((node) => {
      const outgoing = service.getOutgoingEdges(node.id).length;
      const incoming = service.getIncomingEdges(node.id).length;
      return outgoing === 0 && incoming === 0;
    }).length;

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      avgDependencies: avgDeps,
      maxDependencies: maxDeps,
      isolatedNodes: isolated,
    };
  },
} as const;

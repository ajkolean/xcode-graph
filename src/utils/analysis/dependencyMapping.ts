/**
 * Dependency mapping utilities for cluster analysis
 */

import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { Cluster } from '../../types/cluster';

/**
 * Builds dependency maps for a cluster
 */
export function buildDependencyMaps(
  cluster: Cluster,
  allEdges: GraphEdge[]
): {
  dependents: Map<string, Set<string>>;
  dependencies: Map<string, Set<string>>;
} {
  const nodeIds = new Set(cluster.nodes.map(n => n.id));
  const dependents = new Map<string, Set<string>>();
  const dependencies = new Map<string, Set<string>>();
  
  // Initialize maps
  cluster.nodes.forEach(node => {
    dependents.set(node.id, new Set());
    dependencies.set(node.id, new Set());
  });

  // Build dependency relationships
  allEdges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      dependencies.get(edge.source)?.add(edge.target);
      dependents.get(edge.target)?.add(edge.source);
    }
  });
  
  return { dependents, dependencies };
}

/**
 * Counts external dependents for each node
 */
export function countExternalDependents(
  cluster: Cluster,
  allEdges: GraphEdge[]
): Map<string, number> {
  const nodeIds = new Set(cluster.nodes.map(n => n.id));
  const externalDependents = new Map<string, number>();
  
  cluster.nodes.forEach(node => {
    const count = allEdges.filter(e => 
      e.target === node.id && !nodeIds.has(e.source)
    ).length;
    externalDependents.set(node.id, count);
  });
  
  return externalDependents;
}

/**
 * Gets all dependencies for a node
 */
export function getNodeDependencies(
  nodeId: string,
  dependencies: Map<string, Set<string>>
): string[] {
  return Array.from(dependencies.get(nodeId) || []);
}

/**
 * Gets all dependents for a node
 */
export function getNodeDependents(
  nodeId: string,
  dependents: Map<string, Set<string>>
): string[] {
  return Array.from(dependents.get(nodeId) || []);
}

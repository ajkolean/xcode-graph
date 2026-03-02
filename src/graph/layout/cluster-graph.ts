import type { Cluster } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';

/** Directed edge between two clusters in the meta-graph */
export interface ClusterEdge {
  /** Source cluster ID */
  source: string;
  /** Target cluster ID */
  target: string;
  /** Directed dependency count (source -> target) */
  weight: number;
  /** Undirected tie strength: W(A->B) + W(B->A) */
  tieStrength: number;
}

/** Meta-graph of clusters and their aggregated inter-cluster edges */
export interface ClusterGraph {
  /** All clusters as nodes */
  nodes: Cluster[];
  /** Aggregated directed edges between clusters */
  edges: ClusterEdge[];
  /** Lookup from node ID to its containing cluster ID */
  nodeToCluster: Map<string, string>;
}

/**
 * Build the weighted Cluster Meta-Graph.
 *
 * Compresses the node graph into a cluster graph where:
 * - Nodes are Clusters
 * - Edges are aggregated dependencies between clusters
 * - Weights reflect the number of dependencies (strata/attraction)
 *
 * @param edges - All node-level graph edges
 * @param clusters - All clusters to include
 * @returns The cluster meta-graph with aggregated edges
 */
export function buildClusterGraph(edges: GraphEdge[], clusters: Cluster[]): ClusterGraph {
  const nodeToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      nodeToCluster.set(node.id, cluster.id);
    }
  }

  const edgeMap = new Map<string, { source: string; target: string; weight: number }>();

  for (const edge of edges) {
    const cSrc = nodeToCluster.get(edge.source);
    const cTgt = nodeToCluster.get(edge.target);

    if (cSrc && cTgt && cSrc !== cTgt) {
      const key = `${cSrc}->${cTgt}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { source: cSrc, target: cTgt, weight: 0 });
      }
      const entry = edgeMap.get(key);
      if (entry) entry.weight += 1;
    }
  }

  const clusterEdges: ClusterEdge[] = [];

  // Compute undirected tie strength: U(A,B) = W(A->B) + W(B->A)
  const directedEdges = Array.from(edgeMap.values());

  for (const edge of directedEdges) {
    const reverseKey = `${edge.target}->${edge.source}`;
    const reverseWeight = edgeMap.get(reverseKey)?.weight ?? 0;

    clusterEdges.push({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      tieStrength: edge.weight + reverseWeight,
    });
  }

  return {
    nodes: clusters,
    edges: clusterEdges,
    nodeToCluster,
  };
}

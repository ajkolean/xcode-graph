import type { Cluster } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';

export interface ClusterEdge {
  source: string;
  target: string;
  weight: number; // W: Directed dependency count
  tieStrength: number; // U: Total connection strength (undirected)
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
export function buildClusterGraph(edges: GraphEdge[], clusters: Cluster[]): ClusterGraph {
  const nodeToCluster = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      nodeToCluster.set(node.id, cluster.id);
    }
  }

  // Map "Source|Target" -> { directed, undirected }
  const edgeMap = new Map<string, { source: string; target: string; w: number }>();

  for (const edge of edges) {
    const cSrc = nodeToCluster.get(edge.source);
    const cTgt = nodeToCluster.get(edge.target);

    if (cSrc && cTgt && cSrc !== cTgt) {
      const key = `${cSrc}->${cTgt}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { source: cSrc, target: cTgt, w: 0 });
      }
      const entry = edgeMap.get(key);
      if (entry) entry.w += 1;
    }
  }

  const clusterEdges: ClusterEdge[] = [];

  // Calculate final edges
  // We need to compute undirected tie strength U for A<->B
  // U = W(A->B) + W(B->A)

  // First pass: Collect all directed edges
  const directedEdges = Array.from(edgeMap.values());

  // Second pass: Compute ties
  for (const edge of directedEdges) {
    const reverseKey = `${edge.target}->${edge.source}`;
    const reverseWeight = edgeMap.get(reverseKey)?.w ?? 0;

    clusterEdges.push({
      source: edge.source,
      target: edge.target,
      weight: edge.w,
      tieStrength: edge.w + reverseWeight,
    });
  }

  return {
    nodes: clusters,
    edges: clusterEdges,
    nodeToCluster,
  };
}

/**
 * Optimal cluster layout using layered DAG placement
 * Computes coreScore, layers projects by depth, reduces crossings
 */

import type { GraphEdge } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';

interface ClusterScore {
  clusterId: string;
  fanIn: number;
  fanOut: number;
  coreScore: number;
}

interface LayerInfo {
  layer: number;
  position: number;
}

/**
 * Computes optimal cluster positions using layered DAG layout
 */
export function layoutClustersOptimal(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  if (clusters.length === 0) {
    return new Map();
  }

  if (clusters.length === 1) {
    return new Map([[clusters[0].id, { x: 0, y: 0 }]]);
  }

  // Step 1: Build cluster graph and compute scores
  const _clusterNodes = new Set(clusters.map((c) => c.id));
  const clusterEdges = buildClusterGraph(clusters, allEdges);
  const scores = computeClusterScores(clusters, clusterEdges);

  // Step 2: Compute DAG layers (topological ordering)
  const layers = computeDAGLayers(clusters, clusterEdges, scores);

  // Step 3: Reduce crossings with median heuristic
  const optimizedLayers = reduceCrossings(layers, clusterEdges);

  // Step 4: Generate positions
  return generateClusterPositions(clusters, optimizedLayers);
}

/**
 * Builds cluster-level graph (cross-project dependencies)
 */
function buildClusterGraph(clusters: Cluster[], allEdges: GraphEdge[]): Map<string, Set<string>> {
  const clusterGraph = new Map<string, Set<string>>();

  // Initialize
  clusters.forEach((c) => clusterGraph.set(c.id, new Set()));

  // Build node-to-cluster mapping
  const nodeToCluster = new Map<string, string>();
  clusters.forEach((cluster) => {
    cluster.nodes.forEach((node) => {
      nodeToCluster.set(node.id, cluster.id);
    });
  });

  // Add cross-cluster edges
  allEdges.forEach((edge) => {
    const srcCluster = nodeToCluster.get(edge.source);
    const tgtCluster = nodeToCluster.get(edge.target);

    if (srcCluster && tgtCluster && srcCluster !== tgtCluster) {
      clusterGraph.get(srcCluster)!.add(tgtCluster);
    }
  });

  return clusterGraph;
}

/**
 * Computes coreScore = fanIn * 2 + fanOut
 */
function computeClusterScores(
  clusters: Cluster[],
  clusterGraph: Map<string, Set<string>>,
): Map<string, ClusterScore> {
  const scores = new Map<string, ClusterScore>();

  // Count fanIn and fanOut
  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();

  clusters.forEach((c) => {
    fanIn.set(c.id, 0);
    fanOut.set(c.id, 0);
  });

  clusterGraph.forEach((targets, source) => {
    fanOut.set(source, targets.size);
    targets.forEach((target) => {
      fanIn.set(target, (fanIn.get(target) || 0) + 1);
    });
  });

  // Compute coreScore
  clusters.forEach((cluster) => {
    const fIn = fanIn.get(cluster.id) || 0;
    const fOut = fanOut.get(cluster.id) || 0;
    const coreScore = fIn * 2 + fOut;

    scores.set(cluster.id, {
      clusterId: cluster.id,
      fanIn: fIn,
      fanOut: fOut,
      coreScore,
    });
  });

  return scores;
}

/**
 * Computes DAG layers using topological ordering
 * Higher coreScore clusters go in inner layers
 */
function computeDAGLayers(
  clusters: Cluster[],
  clusterGraph: Map<string, Set<string>>,
  scores: Map<string, ClusterScore>,
): Map<string, LayerInfo> {
  const layers = new Map<string, LayerInfo>();

  // Topological sort with depth tracking
  const inDegree = new Map<string, number>();
  clusters.forEach((c) => inDegree.set(c.id, 0));

  clusterGraph.forEach((targets) => {
    targets.forEach((target) => {
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });
  });

  // Start with zero in-degree nodes (roots)
  const queue: { id: string; depth: number }[] = [];
  clusters.forEach((cluster) => {
    if (inDegree.get(cluster.id) === 0) {
      queue.push({ id: cluster.id, depth: 0 });
    }
  });

  // BFS to assign layers
  const depths = new Map<string, number>();
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);
    depths.set(id, depth);

    const targets = clusterGraph.get(id) || new Set();
    targets.forEach((targetId) => {
      const currentDepth = depths.get(targetId) || 0;
      const newDepth = Math.max(currentDepth, depth + 1);
      depths.set(targetId, newDepth);

      if (!visited.has(targetId)) {
        queue.push({ id: targetId, depth: newDepth });
      }
    });
  }

  // Handle any cycles (assign to layer 0)
  clusters.forEach((cluster) => {
    if (!depths.has(cluster.id)) {
      depths.set(cluster.id, 0);
    }
  });

  // Group by depth
  const layerGroups = new Map<number, string[]>();
  depths.forEach((depth, clusterId) => {
    if (!layerGroups.has(depth)) {
      layerGroups.set(depth, []);
    }
    layerGroups.get(depth)!.push(clusterId);
  });

  // Within each layer, sort by coreScore (high score first)
  layerGroups.forEach((clusterIds, layer) => {
    clusterIds.sort((a, b) => {
      const scoreA = scores.get(a)?.coreScore || 0;
      const scoreB = scores.get(b)?.coreScore || 0;
      return scoreB - scoreA;
    });

    clusterIds.forEach((clusterId, position) => {
      layers.set(clusterId, { layer, position });
    });
  });

  return layers;
}

/**
 * Reduces edge crossings using median heuristic
 * Reorders nodes within layers to minimize crossings
 */
function reduceCrossings(
  layers: Map<string, LayerInfo>,
  clusterGraph: Map<string, Set<string>>,
): Map<string, LayerInfo> {
  // Group clusters by layer
  const layerGroups = new Map<number, string[]>();
  layers.forEach((info, clusterId) => {
    if (!layerGroups.has(info.layer)) {
      layerGroups.set(info.layer, []);
    }
    layerGroups.get(info.layer)!.push(clusterId);
  });

  const maxLayer = Math.max(...layerGroups.keys());

  // Run multiple passes of median heuristic
  for (let pass = 0; pass < 3; pass++) {
    // Forward pass (top to bottom)
    for (let layer = 0; layer <= maxLayer; layer++) {
      const clusterIds = layerGroups.get(layer) || [];
      if (clusterIds.length <= 1) continue;

      // Compute median position based on connections to previous layer
      const medians = clusterIds.map((clusterId) => {
        const positions: number[] = [];

        // Find incoming edges from previous layer
        if (layer > 0) {
          const prevLayer = layerGroups.get(layer - 1) || [];
          prevLayer.forEach((prevId) => {
            const targets = clusterGraph.get(prevId) || new Set();
            if (targets.has(clusterId)) {
              const prevPos = layers.get(prevId)?.position || 0;
              positions.push(prevPos);
            }
          });
        }

        // Compute median
        if (positions.length === 0) {
          return { clusterId, median: layers.get(clusterId)!.position };
        }

        positions.sort((a, b) => a - b);
        const median = positions[Math.floor(positions.length / 2)];
        return { clusterId, median };
      });

      // Sort by median
      medians.sort((a, b) => a.median - b.median);

      // Update positions
      medians.forEach((item, position) => {
        layers.set(item.clusterId, { layer, position });
      });
    }
  }

  return layers;
}

/**
 * Generates final (x, y) positions from layer assignments
 * Uses radial layout with layers as rings
 */
function generateClusterPositions(
  clusters: Cluster[],
  layers: Map<string, LayerInfo>,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Find max layer
  let maxLayer = 0;
  layers.forEach((info) => {
    maxLayer = Math.max(maxLayer, info.layer);
  });

  // Group by layer
  const layerGroups = new Map<number, string[]>();
  layers.forEach((info, clusterId) => {
    if (!layerGroups.has(info.layer)) {
      layerGroups.set(info.layer, []);
    }
    layerGroups.get(info.layer)!.push(clusterId);
  });

  // Compute bounds for each cluster
  const clusterSizes = new Map<string, number>();
  clusters.forEach((cluster) => {
    const size = Math.max(cluster.bounds?.width || 200, cluster.bounds?.height || 200);
    clusterSizes.set(cluster.id, size);
  });

  // Base radius and spacing
  const baseRadius = 250;
  const ringSpacing = 450;

  // Position each layer as a ring
  layerGroups.forEach((clusterIds, layer) => {
    const radius = layer === 0 ? 0 : baseRadius + (layer - 1) * ringSpacing;
    const angleStep = (2 * Math.PI) / Math.max(clusterIds.length, 1);

    clusterIds.forEach((clusterId, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      positions.set(clusterId, { x, y });
    });
  });

  return positions;
}

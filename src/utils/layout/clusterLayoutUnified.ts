/**
 * Cluster layout using unified ring algorithm
 * Treats clusters as nodes and applies the same hierarchical layout
 */

import type { GraphEdge } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';
import {
  identifyAnchorsByCoreScore,
  type LayoutEdge,
  type LayoutNode,
  layoutItemsInRings,
} from './unifiedRingLayout';

/**
 * Layout clusters using ring-based algorithm
 * Core clusters (high fanIn/fanOut) become anchors in center
 * Other clusters radiate outward based on dependency depth
 */
export function layoutClustersUnified(
  clusters: Cluster[],
  allEdges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  if (clusters.length === 0) {
    return new Map();
  }

  if (clusters.length === 1) {
    return new Map([[clusters[0].id, { x: 0, y: 0 }]]);
  }

  // Step 1: Build cluster graph (cross-project dependencies)
  const nodeToCluster = new Map<string, string>();
  clusters.forEach((cluster) => {
    cluster.nodes.forEach((node) => {
      nodeToCluster.set(node.id, cluster.id);
    });
  });

  // Build cluster-level edges
  const clusterEdges: LayoutEdge[] = [];
  const edgeSet = new Set<string>(); // Deduplicate

  allEdges.forEach((edge) => {
    const srcCluster = nodeToCluster.get(edge.source);
    const tgtCluster = nodeToCluster.get(edge.target);

    if (srcCluster && tgtCluster && srcCluster !== tgtCluster) {
      const key = `${srcCluster}->${tgtCluster}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        clusterEdges.push({
          source: srcCluster,
          target: tgtCluster,
        });
      }
    }
  });

  // Step 2: Convert clusters to LayoutNodes
  const layoutNodes: LayoutNode[] = clusters.map((c) => ({
    id: c.id,
    metadata: c,
  }));

  // Step 3: Identify anchor clusters using coreScore
  const anchors = identifyAnchorsByCoreScore(layoutNodes, clusterEdges, 1);

  // Step 4: Apply unified ring layout
  const positioned = layoutItemsInRings(layoutNodes, clusterEdges, anchors, {
    baseRadius: 600, // Larger spacing for clusters
    ringGap: 500, // More space between rings
    anchorRadius: 0, // Single anchor at center
  });

  // Step 5: Convert to position map
  const positions = new Map<string, { x: number; y: number }>();
  positioned.forEach((item) => {
    positions.set(item.id, { x: item.x, y: item.y });
  });

  return positions;
}

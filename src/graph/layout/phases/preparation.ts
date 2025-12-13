import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import type { Cluster } from '@shared/schemas';
import { type LayoutConfig } from '../config';
import type { SimNode, ClusterCenter, LayoutDimension } from '../types';
import {
  computeNodeStrata,
  computeFanIn,
  computeCrossClusterWeights,
  type StrataResult,
} from '../graph-strata';
import {
  buildClusterDag,
  computeClusterStrata,
  seedClustersByStrata,
  type ClusterStrataResult,
} from '../cluster-strata';

export interface PreparationResult {
  simNodes: SimNode[];
  simLinks: Array<{ source: string; target: string; sameCluster: boolean }>;
  clusterCenters: Map<string, ClusterCenter>;
  nodeToCluster: Map<string, string>;
  strataResult: StrataResult;
  clusterStrataResult: ClusterStrataResult;
  fanIn: Map<string, number>;
  crossClusterWeights: Map<string, number>;
  clusterSizes: Map<string, number>;
  clusterTargetPositions: Map<string, { x: number; y: number }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildNodeToClusterMap(clusters: Cluster[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const cluster of clusters) {
    for (const node of cluster.nodes) {
      map.set(node.id, cluster.id);
    }
  }
  return map;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// Main Preparation Function
// ============================================================================

export function prepareLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Cluster[],
  config: LayoutConfig,
  dimension: LayoutDimension = '2d',
): PreparationResult {
  // 1. Basic mappings
  const nodeToCluster = buildNodeToClusterMap(clusters);
  const nodeIdSet = new Set(nodes.map((n) => n.id));

  // 2. Global Analysis (Strata & Fan-in)
  const strataResult = computeNodeStrata(nodes, edges);
  const fanIn = computeFanIn(nodes, edges);

  // 3. Cluster Analysis
  const clusterDag = buildClusterDag(edges, nodeToCluster);
  const clusterStrataResult = computeClusterStrata(
    clusters.map((c) => c.id),
    clusterDag,
  );
  
  const crossClusterWeights = computeCrossClusterWeights(edges, nodeToCluster);

  // 4. Cluster Sizing & Seeding
  const clusterSizes = new Map<string, number>();
  for (const cluster of clusters) {
    const size = config.minClusterSize + cluster.nodes.length * config.clusterNodeSpacing;
    clusterSizes.set(cluster.id, size);
  }

  const strataPositions = seedClustersByStrata(
    clusters,
    clusterStrataResult,
    clusterSizes,
    {
      strataSpacing: config.clusterStrataSpacing,
      horizontalSpacing: config.clusterHorizontalSpacing,
      maxRowWidth: config.clusterMaxRowWidth,
    },
  );

  // 5. Create SimNodes
  const simNodes = nodes.map((n): SimNode => {
    const hash = hashString(n.id);
    const clusterId = nodeToCluster.get(n.id);
    const clusterPos = clusterId ? strataPositions.get(clusterId) : null;

    const baseX = clusterPos?.x ?? 0;
    const baseY = clusterPos?.y ?? 0;

    return {
      id: n.id,
      clusterId,
      x: baseX + (seededRandom(hash) - 0.5) * 60,
      y: baseY + (seededRandom(hash + 1) - 0.5) * 60,
      z: dimension === '3d' ? (seededRandom(hash + 2) - 0.5) * config.initialZSpread : 0,
      vx: 0,
      vy: 0,
      vz: 0,
    };
  });

  // 6. Create SimLinks
  const simLinks = edges
    .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
    .map((e) => {
      const sourceCluster = nodeToCluster.get(e.source);
      const targetCluster = nodeToCluster.get(e.target);
      const sameCluster = sourceCluster === targetCluster;

      return {
        source: e.source,
        target: e.target,
        sameCluster,
      };
    });

  // 7. Create ClusterCenters
  const clusterCenterMap = new Map<string, ClusterCenter>();
  for (const cluster of clusters) {
    const size = clusterSizes.get(cluster.id) ?? config.minClusterSize;
    const pos = strataPositions.get(cluster.id) ?? { x: 0, y: 0 };

    clusterCenterMap.set(cluster.id, {
      id: cluster.id,
      cx: pos.x,
      cy: pos.y,
      radius: size / 2,
    });
  }

  return {
    simNodes,
    simLinks,
    clusterCenters: clusterCenterMap,
    nodeToCluster,
    strataResult,
    clusterStrataResult,
    fanIn,
    crossClusterWeights,
    clusterSizes,
    clusterTargetPositions: strataPositions,
  };
}

import {
  type Cluster,
  type ClusterLayoutConfig,
  ClusterType,
  DEFAULT_CLUSTER_CONFIG,
} from '@shared/schemas';
import { type GraphEdge, type GraphNode, Origin } from '@shared/schemas/graph.types';
import { analyzeCluster } from './cluster-analysis';

/**
 * Groups nodes into clusters by project or package name.
 * Each cluster is analyzed for node roles, anchors, and layers.
 *
 * @param nodes - All graph nodes to group
 * @param edges - All graph edges (used for cluster analysis)
 * @returns Array of clusters with metadata populated
 *
 * @public
 */
export function groupIntoClusters(nodes: GraphNode[], edges: GraphEdge[]): Cluster[] {
  const clusterMap = new Map<string, Cluster>();

  nodes.forEach((node) => {
    const clusterId = node.project || node.name;

    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, {
        id: clusterId,
        name: clusterId,
        type: node.origin === Origin.External ? ClusterType.Package : ClusterType.Project,
        origin: node.origin,
        path: node.path,
        nodes: [],
        metadata: new Map(),
        anchors: [],
      });
    }

    const cluster = clusterMap.get(clusterId);
    /* v8 ignore next 1 -- clusterId was just set via clusterMap.set above */
    if (!cluster) return;
    if (!cluster.path && node.path) {
      cluster.path = node.path;
    }

    cluster.nodes.push(node);
  });

  // Analyze each cluster and assign metadata
  clusterMap.forEach((cluster) => {
    analyzeCluster(cluster, edges);
  });

  return Array.from(clusterMap.values());
}

/**
 * Arrange clusters in a simple grid layout, sorted by origin (local first) and size.
 *
 * @param clusters - Clusters to arrange
 * @param config - Layout config with spacing parameters
 * @returns Map of cluster ID to grid position
 *
 * @public
 */
export function arrangeClusterGrid(
  clusters: Cluster[],
  config: ClusterLayoutConfig = DEFAULT_CLUSTER_CONFIG,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const sortedClusters = [...clusters].sort((a, b) => {
    if (a.origin !== b.origin) {
      /* v8 ignore next 1 -- both branches are valid; V8 TimSort order is non-deterministic */
      return a.origin === Origin.Local ? -1 : 1;
    }
    return b.nodes.length - a.nodes.length;
  });

  // Simple grid layout
  const cols = Math.ceil(Math.sqrt(sortedClusters.length));
  let x = 0;
  let y = 0;
  let maxHeightInRow = 0;
  let col = 0;

  sortedClusters.forEach((cluster, _index) => {
    positions.set(cluster.id, { x, y });

    const bounds = cluster.bounds || { width: 300, height: 300 };
    maxHeightInRow = Math.max(maxHeightInRow, bounds.height);

    col++;
    if (col >= cols) {
      // Move to next row
      col = 0;
      x = 0;
      y += maxHeightInRow + config.clusterSpacing;
      maxHeightInRow = 0;
    } else {
      // Move to next column
      x += bounds.width + config.clusterSpacing;
    }
  });

  return positions;
}

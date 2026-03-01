import { ClusterType, DEFAULT_CLUSTER_CONFIG, } from '@shared/schemas';
import { Origin } from '@shared/schemas/graph.types';
import { analyzeCluster } from './cluster-analysis';
/**
 * Groups nodes into clusters by project/package
 */
export function groupIntoClusters(nodes, edges) {
    const clusterMap = new Map();
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
        // Update path if not set (use first available node path)
        const cluster = clusterMap.get(clusterId);
        if (!cluster)
            return;
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
 * Arranges clusters in a grid layout
 */
export function arrangeClusterGrid(clusters, config = DEFAULT_CLUSTER_CONFIG) {
    const positions = new Map();
    // Sort clusters: local first, then by size
    const sortedClusters = [...clusters].sort((a, b) => {
        if (a.origin !== b.origin) {
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
        }
        else {
            // Move to next column
            x += bounds.width + config.clusterSpacing;
        }
    });
    return positions;
}
//# sourceMappingURL=cluster-grouping.js.map
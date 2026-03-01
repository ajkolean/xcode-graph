/**
 * Cluster fixtures
 */
import { type Cluster, type ClusterNodeMetadata } from '@shared/schemas';
/**
 * Create cluster node metadata
 */
export declare function createNodeMetadata(nodeId: string, overrides?: Partial<ClusterNodeMetadata>): ClusterNodeMetadata;
/**
 * Create a test cluster
 */
export declare function createCluster(overrides?: Partial<Cluster>): Cluster;
/**
 * Create a cluster with specific node count
 */
export declare function createClusterWithNodes(nodeCount: number): Cluster;
//# sourceMappingURL=clusters.d.ts.map
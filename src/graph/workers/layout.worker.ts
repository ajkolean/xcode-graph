/**
 * Layout Web Worker
 *
 * Runs the full hierarchical layout computation off the main thread
 * using the native postMessage API.
 *
 * The worker accepts serialized data (no Maps) and returns serialized results,
 * since structured clone does not transfer Map objects across worker boundaries.
 */

import type { LayoutOptions } from '@graph/layout/config';
import { computeHierarchicalLayout } from '@graph/layout/hierarchical-layout';
import type { HierarchicalLayoutResult } from '@graph/layout/types';
import type { Cluster } from '@shared/schemas';
import type { ClusterNodeMetadata } from '@shared/schemas/cluster.types';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';

/**
 * Serialized cluster format for worker transfer.
 * Maps are converted to arrays of entries.
 */
export interface SerializedCluster {
  id: string;
  name: string;
  type: string;
  origin: string;
  path?: string | undefined;
  nodes: GraphNode[];
  anchors: string[];
  metadata: Array<[string, ClusterNodeMetadata]>;
  elkOptions?: Cluster['elkOptions'] | undefined;
  bounds?: Cluster['bounds'] | undefined;
}

/**
 * Serialized layout result for worker transfer.
 * All Maps are converted to arrays of entries.
 */
export interface SerializedLayoutResult {
  nodePositions: Array<
    [string, HierarchicalLayoutResult['nodePositions'] extends Map<string, infer V> ? V : never]
  >;
  clusterPositions: Array<
    [string, HierarchicalLayoutResult['clusterPositions'] extends Map<string, infer V> ? V : never]
  >;
  clusters: SerializedCluster[];
  clusterEdges?: HierarchicalLayoutResult['clusterEdges'] | undefined;
  routedEdges?: HierarchicalLayoutResult['routedEdges'] | undefined;
  cycleNodes?: string[] | undefined;
  nodeSccId?: Array<[string, number]> | undefined;
  sccSizes?: Array<[number, number]> | undefined;
  maxStratum?: number | undefined;
  maxClusterStratum?: number | undefined;
  elkDebug?: HierarchicalLayoutResult['elkDebug'] | undefined;
}

/**
 * Deserialize clusters from worker-safe format back to runtime format with Maps.
 */
export function deserializeClusters(serialized: SerializedCluster[]): Cluster[] {
  return serialized.map((sc) => ({
    ...sc,
    metadata: new Map(sc.metadata),
  })) as Cluster[];
}

/**
 * Serialize a layout result for transfer back to main thread.
 */
export function serializeResult(result: HierarchicalLayoutResult): SerializedLayoutResult {
  return {
    nodePositions: Array.from(result.nodePositions.entries()),
    clusterPositions: Array.from(result.clusterPositions.entries()),
    clusters: result.clusters.map((c) => ({
      ...c,
      metadata: Array.from(c.metadata.entries()),
    })),
    clusterEdges: result.clusterEdges,
    routedEdges: result.routedEdges,
    cycleNodes: result.cycleNodes ? Array.from(result.cycleNodes) : undefined,
    nodeSccId: result.nodeSccId ? Array.from(result.nodeSccId.entries()) : undefined,
    sccSizes: result.sccSizes ? Array.from(result.sccSizes.entries()) : undefined,
    maxStratum: result.maxStratum,
    maxClusterStratum: result.maxClusterStratum,
    elkDebug: result.elkDebug,
  };
}

const workerApi = {
  async computeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    serializedClusters: SerializedCluster[],
    opts?: LayoutOptions,
  ): Promise<SerializedLayoutResult> {
    const clusters = deserializeClusters(serializedClusters);
    const result = await computeHierarchicalLayout(nodes, edges, clusters, opts);
    return serializeResult(result);
  },
};

export type LayoutWorkerRemoteAPI = typeof workerApi;

/* v8 ignore start */
self.onmessage = async (
  e: MessageEvent<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    clusters: SerializedCluster[];
    opts?: LayoutOptions;
  }>,
) => {
  const result = await workerApi.computeLayout(
    e.data.nodes,
    e.data.edges,
    e.data.clusters,
    e.data.opts,
  );
  self.postMessage(result);
};
/* v8 ignore stop */

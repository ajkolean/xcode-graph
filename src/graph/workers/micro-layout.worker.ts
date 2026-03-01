/**
 * Micro-Layout Web Worker
 *
 * Runs computeClusterInterior + applyNodeMassage for a single cluster
 * off the main thread. Used by parallel-micro.ts to parallelize
 * micro-layout computation across multiple workers.
 */

import type { LayoutConfig } from '@graph/layout/config';
import { computeClusterInterior } from '@graph/layout/phases/micro-layout';
import { applyNodeMassage } from '@graph/layout/phases/node-massage';
import type { Cluster, NodePosition } from '@shared/schemas';
import type { ClusterNodeMetadata } from '@shared/schemas/cluster.types';
import type { GraphNode } from '@shared/schemas/graph.types';
import * as Comlink from 'comlink';

/** Serialized cluster for worker transfer (Maps → Arrays) */
export interface SerializedMicroCluster {
  id: string;
  name: string;
  type: string;
  origin: string;
  path?: string | undefined;
  nodes: GraphNode[];
  anchors: string[];
  metadata: Array<[string, ClusterNodeMetadata]>;
}

/** Serialized micro-layout result (Maps → Arrays) */
export interface SerializedMicroResult {
  clusterId: string;
  width: number;
  height: number;
  relativePositions: Array<[string, NodePosition]>;
}

function deserializeCluster(sc: SerializedMicroCluster): Cluster {
  return {
    ...sc,
    metadata: new Map(sc.metadata),
  } as Cluster;
}

const workerApi = {
  computeMicro(
    serializedCluster: SerializedMicroCluster,
    config: LayoutConfig,
  ): SerializedMicroResult {
    const cluster = deserializeCluster(serializedCluster);
    let micro = computeClusterInterior(cluster, config);
    micro = applyNodeMassage(micro, config);
    return {
      clusterId: micro.clusterId,
      width: micro.width,
      height: micro.height,
      relativePositions: Array.from(micro.relativePositions.entries()),
    };
  },
};

export type MicroLayoutWorkerAPI = typeof workerApi;

Comlink.expose(workerApi);

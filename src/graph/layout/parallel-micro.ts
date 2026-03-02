/**
 * Parallel Micro-Layout
 *
 * Distributes micro-layout computation across a pool of web workers.
 * Falls back to synchronous computation for small cluster counts
 * or when workers are unavailable.
 */

import type {
  MicroLayoutWorkerAPI,
  SerializedMicroCluster,
  SerializedMicroResult,
} from '@graph/workers/micro-layout.worker';
import type { Cluster } from '@shared/schemas';
import * as Comlink from 'comlink';
import MicroLayoutWorker from '../workers/micro-layout.worker.ts?worker&inline';
import type { LayoutConfig } from './config';
import { computeClusterInterior, type MicroLayoutResult } from './phases/micro-layout';
import { applyNodeMassage } from './phases/node-massage';

/** Threshold below which we skip worker overhead */
const MIN_CLUSTERS_FOR_WORKERS = 3;

/** Maximum worker pool size */
const MAX_WORKERS = 4;

/**
 * Serialize a Cluster for transfer to a web worker (converts Map to entries array).
 *
 * @param cluster - Cluster to serialize
 * @returns Worker-safe serialized form
 */
export function serializeCluster(cluster: Cluster): SerializedMicroCluster {
  return {
    id: cluster.id,
    name: cluster.name,
    type: cluster.type,
    origin: cluster.origin,
    path: cluster.path,
    nodes: cluster.nodes,
    anchors: cluster.anchors,
    metadata: Array.from(cluster.metadata?.entries() ?? []),
  };
}

/**
 * Deserialize a micro layout result from a web worker (converts entries array back to Map).
 *
 * @param sr - Serialized result from worker
 * @returns Deserialized MicroLayoutResult with Map-based positions
 */
export function deserializeResult(sr: SerializedMicroResult): MicroLayoutResult {
  return {
    clusterId: sr.clusterId,
    width: sr.width,
    height: sr.height,
    relativePositions: new Map(sr.relativePositions),
  };
}

/**
 * Compute micro layouts synchronously (fallback path).
 * Runs the Solar System interior layout and node massage for each cluster sequentially.
 *
 * @param clusters - All clusters to compute layouts for
 * @param config - Layout configuration
 * @returns Map of cluster ID to micro layout result
 */
export function computeMicroLayoutsSync(
  clusters: Cluster[],
  config: LayoutConfig,
): Map<string, MicroLayoutResult> {
  return new Map(
    clusters.map((cluster) => {
      let micro = computeClusterInterior(cluster, config);
      micro = applyNodeMassage(micro, config);
      return [cluster.id, micro];
    }),
  );
}

/**
 * Compute micro layouts for all clusters, using web workers when beneficial.
 * Falls back to synchronous for small cluster counts or when Worker is unavailable.
 *
 * @param clusters - All clusters to compute layouts for
 * @param config - Layout configuration
 * @returns Map of cluster ID to micro layout result
 */
export async function computeMicroLayoutsParallel(
  clusters: Cluster[],
  config: LayoutConfig,
): Promise<Map<string, MicroLayoutResult>> {
  if (clusters.length < MIN_CLUSTERS_FOR_WORKERS || typeof Worker === 'undefined') {
    return computeMicroLayoutsSync(clusters, config);
  }

  const poolSize = Math.min(
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    MAX_WORKERS,
    clusters.length,
  );

  const workers: Worker[] = [];
  const apis: Comlink.Remote<MicroLayoutWorkerAPI>[] = [];

  try {
    for (let i = 0; i < poolSize; i++) {
      const worker = new MicroLayoutWorker();
      workers.push(worker);
      apis.push(Comlink.wrap<MicroLayoutWorkerAPI>(worker));
    }

    const tasks = clusters.map((cluster, i) => {
      const api = apis[i % poolSize];
      if (!api) throw new Error(`Worker API missing for index ${i % poolSize}`);
      const serialized = serializeCluster(cluster);
      return api.computeMicro(serialized, config).then(deserializeResult);
    });

    const results = await Promise.all(tasks);
    return new Map(results.map((r) => [r.clusterId, r]));
  } catch (e) {
    console.warn('Worker pool failed, falling back to synchronous layout', e);
    return computeMicroLayoutsSync(clusters, config);
  } finally {
    for (const worker of workers) {
      worker.terminate();
    }
  }
}

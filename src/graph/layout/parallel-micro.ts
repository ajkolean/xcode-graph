/**
 * Parallel Micro-Layout
 *
 * Distributes micro-layout computation across a pool of web workers.
 * Falls back to synchronous computation for small cluster counts
 * or when workers are unavailable.
 */

import type {
  SerializedMicroCluster,
  SerializedMicroResult,
} from '@graph/workers/micro-layout.worker';
import type { Cluster } from '@shared/schemas';
import type { LayoutConfig } from './config';
import { computeClusterInterior, type MicroLayoutResult } from './phases/micro-layout';
import { applyNodeMassage } from './phases/node-massage';

/**
 * Creates a message channel for a worker that supports multiple concurrent tasks.
 * Each posted message gets a sequential response via the shared onmessage handler.
 */
function createWorkerChannel<T>(worker: Worker) {
  const pending: Array<{
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
  }> = [];

  worker.onmessage = (e: MessageEvent<T>) => {
    const next = pending.shift();
    if (next) next.resolve(e.data);
  };

  worker.onerror = (e) => {
    const next = pending.shift();
    if (next) next.reject(e);
  };

  return {
    call(data: unknown): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        pending.push({ resolve, reject });
        worker.postMessage(data);
      });
    },
  };
}

/** Threshold below which we skip worker overhead (serialization + worker creation costs more than sync for small counts) */
const MIN_CLUSTERS_FOR_WORKERS = 6;

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
    /* v8 ignore next */
    return computeMicroLayoutsSync(clusters, config);
  }

  /* v8 ignore start */
  const poolSize = Math.min(
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    MAX_WORKERS,
    clusters.length,
  );

  const workers: Worker[] = [];

  try {
    for (let i = 0; i < poolSize; i++) {
      workers.push(
        new Worker(new URL('../workers/micro-layout.worker.ts', import.meta.url), {
          type: 'module',
        }),
      );
    }

    // Create a channel per worker to properly queue multiple messages
    const channels = workers.map((w) => createWorkerChannel<SerializedMicroResult>(w));

    const tasks = clusters.map((cluster, i) => {
      const channel = channels[i % poolSize];
      if (!channel) throw new Error(`Worker channel missing for index ${i % poolSize}`);
      const serialized = serializeCluster(cluster);
      return channel
        .call({
          cluster: serialized,
          config,
        })
        .then(deserializeResult);
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
  /* v8 ignore stop */
}

import { describe, expect, it } from 'vitest';
import { createCluster, createClusterWithNodes } from '@/fixtures';
import { DEFAULT_CONFIG } from './config';
import {
  computeMicroLayoutsParallel,
  computeMicroLayoutsSync,
  deserializeResult,
  serializeCluster,
} from './parallel-micro';

describe('parallel-micro', () => {
  describe('computeMicroLayoutsParallel', () => {
    it('produces results for all clusters', async () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(4);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';

      const result = await computeMicroLayoutsParallel([clusterA, clusterB], DEFAULT_CONFIG);

      expect(result.size).toBe(2);
      expect(result.has('A')).toBe(true);
      expect(result.has('B')).toBe(true);
    });

    it('produces structurally equivalent results to sync path', async () => {
      const clusters = Array.from({ length: 4 }, (_, index) => {
        const cluster = createClusterWithNodes(3);
        cluster.id = `cluster-${index}`;
        cluster.name = `Cluster${index}`;
        return cluster;
      });

      const parallelResult = await computeMicroLayoutsParallel(clusters, DEFAULT_CONFIG);
      const syncResult = computeMicroLayoutsSync(clusters, DEFAULT_CONFIG);

      // Both should produce results for all clusters
      expect(parallelResult.size).toBe(syncResult.size);
      for (const id of syncResult.keys()) {
        expect(parallelResult.has(id)).toBe(true);
        const pMicro = parallelResult.get(id);
        const sMicro = syncResult.get(id);
        expect(pMicro).toBeDefined();
        expect(sMicro).toBeDefined();
        // Dimensions should be positive
        expect(pMicro?.width).toBeGreaterThan(0);
        expect(pMicro?.height).toBeGreaterThan(0);
        // Same number of node positions
        expect(pMicro?.relativePositions.size).toBe(sMicro?.relativePositions.size);
      }
    });

    it('handles empty cluster list', async () => {
      const result = await computeMicroLayoutsParallel([], DEFAULT_CONFIG);
      expect(result.size).toBe(0);
    });

    it('handles single cluster', async () => {
      const cluster = createClusterWithNodes(5);
      const result = await computeMicroLayoutsParallel([cluster], DEFAULT_CONFIG);

      expect(result.size).toBe(1);
      const micro = result.get(cluster.id);
      expect(micro).toBeDefined();
      expect(micro?.relativePositions.size).toBe(5);
    });

    it('produces finite coordinates for all nodes', async () => {
      const clusters = Array.from({ length: 3 }, (_, index) => {
        const cluster = createClusterWithNodes(5);
        cluster.id = `c${index}`;
        cluster.name = `C${index}`;
        return cluster;
      });

      const result = await computeMicroLayoutsParallel(clusters, DEFAULT_CONFIG);

      for (const micro of result.values()) {
        for (const pos of micro.relativePositions.values()) {
          expect(Number.isFinite(pos.x)).toBe(true);
          expect(Number.isFinite(pos.y)).toBe(true);
        }
      }
    });
  });

  describe('computeMicroLayoutsSync', () => {
    it('produces results matching the parallel interface', () => {
      const cluster = createClusterWithNodes(3);
      const result = computeMicroLayoutsSync([cluster], DEFAULT_CONFIG);

      expect(result.size).toBe(1);
      const micro = result.get(cluster.id);
      expect(micro).toBeDefined();
      expect(micro?.width).toBeGreaterThan(0);
      expect(micro?.height).toBeGreaterThan(0);
      expect(micro?.relativePositions.size).toBe(3);
    });
  });

  describe('serializeCluster', () => {
    it('converts metadata Map to entries array', () => {
      const cluster = createClusterWithNodes(2);
      const serialized = serializeCluster(cluster);

      expect(serialized.id).toBe(cluster.id);
      expect(serialized.name).toBe(cluster.name);
      expect(serialized.type).toBe(cluster.type);
      expect(serialized.origin).toBe(cluster.origin);
      expect(serialized.nodes).toEqual(cluster.nodes);
      expect(serialized.anchors).toEqual(cluster.anchors);
      expect(Array.isArray(serialized.metadata)).toBe(true);
      expect(serialized.metadata.length).toBe(cluster.metadata?.size ?? 0);
    });

    it('handles cluster with empty metadata', () => {
      const cluster = createCluster({ metadata: new Map() });
      const serialized = serializeCluster(cluster);

      expect(Array.isArray(serialized.metadata)).toBe(true);
      expect(serialized.metadata.length).toBe(0);
    });

    it('preserves optional path field', () => {
      const cluster = createCluster({ path: '/some/path' });
      const serialized = serializeCluster(cluster);
      expect(serialized.path).toBe('/some/path');
    });
  });

  describe('deserializeResult', () => {
    it('converts relativePositions entries array to Map', () => {
      const result = deserializeResult({
        clusterId: 'test',
        width: 100,
        height: 100,
        relativePositions: [
          ['n1', { id: 'n1', x: 10, y: 20, vx: 0, vy: 0, clusterId: 'test', radius: 6 }],
          ['n2', { id: 'n2', x: 30, y: 40, vx: 0, vy: 0, clusterId: 'test', radius: 6 }],
        ],
      });

      expect(result.clusterId).toBe('test');
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
      expect(result.relativePositions).toBeInstanceOf(Map);
      expect(result.relativePositions.size).toBe(2);
      expect(result.relativePositions.get('n1')?.x).toBe(10);
      expect(result.relativePositions.get('n2')?.y).toBe(40);
    });
  });

  describe('worker pool fallback', () => {
    it('falls back to sync when Worker is unavailable and cluster count is high', async () => {
      const originalWorker = globalThis.Worker;
      (globalThis as Record<string, unknown>).Worker = undefined;

      try {
        const clusters = Array.from({ length: 5 }, (_, i) => {
          const c = createClusterWithNodes(3);
          c.id = `w-${i}`;
          c.name = `W${i}`;
          return c;
        });

        const result = await computeMicroLayoutsParallel(clusters, DEFAULT_CONFIG);
        expect(result.size).toBe(5);
        for (const c of clusters) {
          expect(result.has(c.id)).toBe(true);
        }
      } finally {
        globalThis.Worker = originalWorker;
      }
    });

    it('falls back to sync for fewer clusters than MIN_CLUSTERS_FOR_WORKERS', async () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'a';
      const clusterB = createClusterWithNodes(4);
      clusterB.id = 'b';
      const clusters = [clusterA, clusterB];

      const syncResult = computeMicroLayoutsSync(clusters, DEFAULT_CONFIG);
      const parallelResult = await computeMicroLayoutsParallel(clusters, DEFAULT_CONFIG);

      // Both should produce same number of results (sync fallback path)
      expect(parallelResult.size).toBe(syncResult.size);
    });

    it('falls back to sync on worker error', async () => {
      const originalWorker = globalThis.Worker;

      // Mock Worker that throws on construction
      globalThis.Worker = function ThrowingWorker() {
        throw new Error('Worker creation failed');
      } as unknown as typeof Worker;

      try {
        const clusters = Array.from({ length: 4 }, (_, i) => {
          const c = createClusterWithNodes(3);
          c.id = `err-${i}`;
          c.name = `Err${i}`;
          return c;
        });

        const result = await computeMicroLayoutsParallel(clusters, DEFAULT_CONFIG);
        expect(result.size).toBe(4);
      } finally {
        globalThis.Worker = originalWorker;
      }
    });
  });
});

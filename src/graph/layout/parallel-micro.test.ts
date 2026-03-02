import { describe, expect, it } from 'vitest';
import { createClusterWithNodes } from '@/fixtures';
import { DEFAULT_CONFIG } from './config';
import { computeMicroLayoutsParallel, computeMicroLayoutsSync } from './parallel-micro';

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
});

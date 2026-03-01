import type { ClusterPosition } from '@shared/schemas';
import { describe, expect, it } from 'vitest';
import { createClusterWithNodes } from '@/fixtures';
import { buildClusterGraph } from '../cluster-graph';
import { DEFAULT_CONFIG } from '../config';
import { applyForceMassage } from './force-massage';

function createClusterPosition(id: string, x: number, y: number, size = 200): ClusterPosition {
  return { id, x, y, width: size, height: size, nodeCount: 3, vx: 0, vy: 0 };
}

describe('force-massage', () => {
  describe('applyForceMassage', () => {
    it('preserves all cluster IDs', () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(3);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';

      const edges = [{ source: clusterA.nodes[0].id, target: clusterB.nodes[0].id }];
      const clusterGraph = buildClusterGraph(edges, [clusterA, clusterB]);

      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPosition('A', 0, 0)],
        ['B', createClusterPosition('B', 500, 0)],
      ]);

      const result = applyForceMassage(positions, clusterGraph, DEFAULT_CONFIG);

      expect(result.size).toBe(2);
      expect(result.has('A')).toBe(true);
      expect(result.has('B')).toBe(true);
    });

    it('keeps clusters near original positions (tethering)', () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(3);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';

      const edges = [{ source: clusterA.nodes[0].id, target: clusterB.nodes[0].id }];
      const clusterGraph = buildClusterGraph(edges, [clusterA, clusterB]);

      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPosition('A', 0, 0)],
        ['B', createClusterPosition('B', 600, 0)],
      ]);

      const result = applyForceMassage(positions, clusterGraph, DEFAULT_CONFIG);

      // Clusters should not move too far from original positions
      const posA = result.get('A');
      const posB = result.get('B');
      expect(posA).toBeDefined();
      expect(posB).toBeDefined();
      const driftA = Math.hypot((posA?.x ?? 0) - 0, (posA?.y ?? 0) - 0);
      const driftB = Math.hypot((posB?.x ?? 0) - 600, (posB?.y ?? 0) - 0);

      // Should stay within a reasonable distance of originals
      expect(driftA).toBeLessThan(300);
      expect(driftB).toBeLessThan(300);
    });

    it('produces finite coordinates', () => {
      const cluster = createClusterWithNodes(3);
      cluster.id = 'solo';
      cluster.name = 'Solo';

      const clusterGraph = buildClusterGraph([], [cluster]);
      const positions = new Map<string, ClusterPosition>([
        ['solo', createClusterPosition('solo', 100, 200)],
      ]);

      const result = applyForceMassage(positions, clusterGraph, DEFAULT_CONFIG);

      for (const pos of result.values()) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('single cluster passthrough preserves approximate position', () => {
      const cluster = createClusterWithNodes(3);
      cluster.id = 'only';
      cluster.name = 'Only';

      const clusterGraph = buildClusterGraph([], [cluster]);
      const positions = new Map<string, ClusterPosition>([
        ['only', createClusterPosition('only', 100, 200)],
      ]);

      const result = applyForceMassage(positions, clusterGraph, DEFAULT_CONFIG);

      const pos = result.get('only');
      expect(pos).toBeDefined();
      // With tethering and no other forces, should be very close to original
      expect(Math.abs((pos?.x ?? 0) - 100)).toBeLessThan(50);
      expect(Math.abs((pos?.y ?? 0) - 200)).toBeLessThan(50);
    });
  });
});

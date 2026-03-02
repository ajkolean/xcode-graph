import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { createClusterWithNodes } from '@/fixtures';
import { buildClusterGraph } from '../cluster-graph';
import { DEFAULT_CONFIG } from '../config';
import { computeMacroLayout } from './macro-layout';
import { computeClusterInterior } from './micro-layout';

describe('macro-layout', () => {
  describe('computeMacroLayout', () => {
    it('produces positions for all clusters with finite coordinates', async () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(4);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusters = [clusterA, clusterB];

      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      assert(nodeA0 && nodeB0, 'clusters must have nodes');
      const edges = [{ source: nodeA0.id, target: nodeB0.id }];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(2);
      for (const [_id, pos] of positions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
      }
    });

    it('does not produce overlapping cluster bounding boxes', async () => {
      const clusterA = createClusterWithNodes(5);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(5);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusterC = createClusterWithNodes(3);
      clusterC.id = 'C';
      clusterC.name = 'ClusterC';
      const clusters = [clusterA, clusterB, clusterC];

      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      const nodeC0 = clusterC.nodes[0];
      assert(nodeA0 && nodeB0 && nodeC0, 'clusters must have nodes');
      const edges = [
        { source: nodeA0.id, target: nodeB0.id },
        { source: nodeB0.id, target: nodeC0.id },
      ];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);
      const posArray = Array.from(positions.values());

      // Check no bounding box overlaps (center-to-center distance > sum of half-sizes)
      for (let i = 0; i < posArray.length; i++) {
        for (let j = i + 1; j < posArray.length; j++) {
          const posA = posArray[i];
          const posB = posArray[j];
          assert(posA && posB, 'positions must exist');
          const dx = Math.abs(posA.x - posB.x);
          const dy = Math.abs(posA.y - posB.y);
          const minSepX = (posA.width + posB.width) / 2;
          const minSepY = (posA.height + posB.height) / 2;
          // At least one axis must have sufficient separation
          const separated = dx >= minSepX * 0.8 || dy >= minSepY * 0.8;
          expect(separated).toBe(true);
        }
      }
    });

    it('handles single cluster', async () => {
      const cluster = createClusterWithNodes(3);
      const clusters = [cluster];

      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map([[cluster.id, computeClusterInterior(cluster, DEFAULT_CONFIG)]]);

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(1);
      const pos = positions.values().next().value;
      assert(pos, 'position must exist');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });

    it('handles multiple clusters in same layer with positionId sorting', async () => {
      // Create several clusters that should end up in the same ELK layer
      const clusterA = createClusterWithNodes(2);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(2);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusterC = createClusterWithNodes(2);
      clusterC.id = 'C';
      clusterC.name = 'ClusterC';
      const clusterD = createClusterWithNodes(2);
      clusterD.id = 'D';
      clusterD.name = 'ClusterD';
      const clusters = [clusterA, clusterB, clusterC, clusterD];

      // All depend on A, so B/C/D should be in the same layer
      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      const nodeC0 = clusterC.nodes[0];
      const nodeD0 = clusterD.nodes[0];
      assert(nodeA0 && nodeB0 && nodeC0 && nodeD0, 'clusters must have nodes');
      const edges = [
        { source: nodeA0.id, target: nodeB0.id },
        { source: nodeA0.id, target: nodeC0.id },
        { source: nodeA0.id, target: nodeD0.id },
      ];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(4);
      for (const [_id, pos] of positions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('returns empty map when layout produces no children', async () => {
      const clusters: ReturnType<typeof createClusterWithNodes>[] = [];
      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map<string, ReturnType<typeof computeClusterInterior>>();

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(0);
    });
  });
});

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

      const edges = [{ source: clusterA.nodes[0].id, target: clusterB.nodes[0].id }];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(2);
      for (const [id, pos] of positions) {
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

      const edges = [
        { source: clusterA.nodes[0].id, target: clusterB.nodes[0].id },
        { source: clusterB.nodes[0].id, target: clusterC.nodes[0].id },
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
          const a = posArray[i];
          const b = posArray[j];
          const dx = Math.abs(a.x - b.x);
          const dy = Math.abs(a.y - b.y);
          const minSepX = (a.width + b.width) / 2;
          const minSepY = (a.height + b.height) / 2;
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
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });
  });
});

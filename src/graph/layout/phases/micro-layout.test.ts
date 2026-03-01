import { describe, expect, it } from 'vitest';
import { createCluster, createClusterWithNodes } from '@/fixtures';
import { DEFAULT_CONFIG } from '../config';
import { computeClusterInterior } from './micro-layout';

describe('micro-layout', () => {
  describe('computeClusterInterior', () => {
    it('returns min size dimensions and 0 positions for empty cluster', () => {
      const cluster = createCluster({ nodes: [], metadata: new Map(), anchors: [] });
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.clusterId).toBe(cluster.id);
      expect(result.width).toBe(DEFAULT_CONFIG.minClusterSize);
      expect(result.height).toBe(DEFAULT_CONFIG.minClusterSize);
      expect(result.relativePositions.size).toBe(0);
    });

    it('places a single node near center within bounds', () => {
      const cluster = createClusterWithNodes(1);
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(1);

      const pos = result.relativePositions.values().next().value!;
      const halfW = result.width / 2;
      const halfH = result.height / 2;

      expect(pos.x).toBeGreaterThanOrEqual(-halfW);
      expect(pos.x).toBeLessThanOrEqual(halfW);
      expect(pos.y).toBeGreaterThanOrEqual(-halfH);
      expect(pos.y).toBeLessThanOrEqual(halfH);
    });

    it('assigns positions to all nodes in a multi-node cluster', () => {
      const cluster = createClusterWithNodes(8);
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(8);

      for (const node of cluster.nodes) {
        expect(result.relativePositions.has(node.id)).toBe(true);
      }
    });

    it('produces no pairwise overlaps for multi-node cluster', () => {
      const cluster = createClusterWithNodes(10);
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const positions = Array.from(result.relativePositions.values());

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i]!;
          const b = positions[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          // Nodes should not overlap (at least 2 * nodeRadius apart)
          expect(dist).toBeGreaterThan(DEFAULT_CONFIG.nodeRadius * 2);
        }
      }
    });

    it('keeps all nodes within cluster bounds', () => {
      const cluster = createClusterWithNodes(12);
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      const halfW = result.width / 2;
      const halfH = result.height / 2;
      // Allow a small tolerance for nodes near the edge
      const tolerance = DEFAULT_CONFIG.nodeRadius * 2;

      for (const pos of result.relativePositions.values()) {
        expect(Math.abs(pos.x)).toBeLessThanOrEqual(halfW + tolerance);
        expect(Math.abs(pos.y)).toBeLessThanOrEqual(halfH + tolerance);
      }
    });

    it('produces larger dimensions for larger clusters', () => {
      const small = createClusterWithNodes(3);
      const large = createClusterWithNodes(20);

      const smallResult = computeClusterInterior(small, DEFAULT_CONFIG);
      const largeResult = computeClusterInterior(large, DEFAULT_CONFIG);

      expect(largeResult.width).toBeGreaterThan(smallResult.width);
      expect(largeResult.height).toBeGreaterThan(smallResult.height);
    });

    it('returns finite coordinates for all positions', () => {
      const cluster = createClusterWithNodes(5);
      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      for (const pos of result.relativePositions.values()) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });
  });
});

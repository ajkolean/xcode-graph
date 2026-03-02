import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { createCluster, createClusterWithNodes } from '@/fixtures';
import { DEFAULT_CONFIG } from '../config';
import { computeClusterInterior } from './micro-layout';
import { applyNodeMassage } from './node-massage';

function assertNoOverlap(positions: Array<{ x: number; y: number }>, minDist: number) {
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const posA = positions[i];
      const posB = positions[j];
      assert(posA && posB, 'positions must exist');
      const dist = Math.hypot(posA.x - posB.x, posA.y - posB.y);
      expect(dist).toBeGreaterThan(minDist);
    }
  }
}

describe('node-massage', () => {
  describe('applyNodeMassage', () => {
    it('handles empty input by returning it unchanged', () => {
      const cluster = createCluster({ nodes: [], metadata: new Map(), anchors: [] });
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(0);
      expect(result.clusterId).toBe(micro.clusterId);
    });

    it('preserves all node IDs (same keys in/out)', () => {
      const cluster = createClusterWithNodes(6);
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      const microIds = new Set(micro.relativePositions.keys());
      const resultIds = new Set(result.relativePositions.keys());

      expect(resultIds).toEqual(microIds);
    });

    it('does not shrink cluster below micro-layout size', () => {
      const cluster = createClusterWithNodes(8);
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      expect(result.width).toBeGreaterThanOrEqual(micro.width);
      expect(result.height).toBeGreaterThanOrEqual(micro.height);
    });

    it('maintains no-overlap invariant after massage', () => {
      const cluster = createClusterWithNodes(10);
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      const positions = Array.from(result.relativePositions.values());
      assertNoOverlap(positions, DEFAULT_CONFIG.nodeRadius);
    });

    it('produces finite coordinates', () => {
      const cluster = createClusterWithNodes(5);
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      for (const pos of result.relativePositions.values()) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('keeps cluster ID unchanged', () => {
      const cluster = createClusterWithNodes(4);
      const micro = computeClusterInterior(cluster, DEFAULT_CONFIG);
      const result = applyNodeMassage(micro, DEFAULT_CONFIG);

      expect(result.clusterId).toBe(micro.clusterId);
    });
  });
});

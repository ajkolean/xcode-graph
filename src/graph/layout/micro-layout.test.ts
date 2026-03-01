/**
 * Micro Layout Tests
 *
 * Tests for the computeClusterInterior function that computes
 * "Solar System" physics-based layout for nodes within a cluster.
 * This is the function that would run in the micro-layout worker.
 */

import type { Cluster } from '@shared/schemas';
import { ClusterType, NodeRole } from '@shared/schemas/cluster.types';
import { NodeType, Origin } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import {
  createCluster,
  createClusterWithNodes,
  createNode,
  createNodeMetadata,
} from '../../fixtures';
import { DEFAULT_CONFIG } from './config';
import { computeClusterInterior } from './phases/micro-layout';

describe('computeClusterInterior', () => {
  // ==================== Valid Results ====================

  describe('valid cluster input', () => {
    it('should produce a result with width and height greater than 0', () => {
      const cluster = createCluster();

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.clusterId).toBe(cluster.id);
    });

    it('should assign positions to all nodes in the cluster', () => {
      const cluster = createCluster();

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(cluster.nodes.length);

      for (const node of cluster.nodes) {
        const pos = result.relativePositions.get(node.id);
        expect(pos).toBeDefined();
        expect(Number.isFinite(pos?.x)).toBe(true);
        expect(Number.isFinite(pos?.y)).toBe(true);
      }
    });

    it('should set correct clusterId on each node position', () => {
      const cluster = createCluster();

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      for (const [, pos] of result.relativePositions) {
        expect(pos.clusterId).toBe(cluster.id);
      }
    });

    it('should set radius on each node position', () => {
      const cluster = createCluster();

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      for (const [, pos] of result.relativePositions) {
        expect(pos.radius).toBe(DEFAULT_CONFIG.nodeRadius);
      }
    });
  });

  // ==================== Various Cluster Sizes ====================

  describe('various cluster sizes', () => {
    it('should handle a cluster with a single node', () => {
      const cluster = createClusterWithNodes(1);

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(1);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('should handle a cluster with two nodes', () => {
      const cluster = createClusterWithNodes(2);

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(2);
    });

    it('should handle a cluster with many nodes', () => {
      const cluster = createClusterWithNodes(20);

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(20);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);

      // All positions should be finite
      for (const [, pos] of result.relativePositions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('should produce larger dimensions for larger clusters', () => {
      const small = createClusterWithNodes(3);
      const large = createClusterWithNodes(15);

      const smallResult = computeClusterInterior(small, DEFAULT_CONFIG);
      const largeResult = computeClusterInterior(large, DEFAULT_CONFIG);

      // Larger clusters should have larger overall dimensions
      expect(largeResult.width).toBeGreaterThan(smallResult.width);
      expect(largeResult.height).toBeGreaterThan(smallResult.height);
    });
  });

  // ==================== Empty Cluster ====================

  describe('empty cluster', () => {
    it('should handle an empty cluster gracefully', () => {
      const emptyCluster: Cluster = {
        id: 'empty',
        name: 'EmptyCluster',
        type: ClusterType.Project,
        origin: Origin.Local,
        nodes: [],
        anchors: [],
        metadata: new Map(),
      };

      const result = computeClusterInterior(emptyCluster, DEFAULT_CONFIG);

      expect(result.clusterId).toBe('empty');
      expect(result.relativePositions.size).toBe(0);
      // Should still have valid (minimum) dimensions
      expect(result.width).toBe(DEFAULT_CONFIG.minClusterSize);
      expect(result.height).toBe(DEFAULT_CONFIG.minClusterSize);
    });
  });

  // ==================== Metadata Handling ====================

  describe('metadata and roles', () => {
    it('should handle nodes with different roles', () => {
      const nodeA = createNode({ id: 'entry', name: 'Entry', type: NodeType.App });
      const nodeB = createNode({ id: 'lib', name: 'Lib', type: NodeType.Library });
      const nodeC = createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit });

      const metadata = new Map([
        ['entry', createNodeMetadata('entry', { role: NodeRole.Entry, isAnchor: true })],
        ['lib', createNodeMetadata('lib', { role: NodeRole.InternalLib })],
        ['test', createNodeMetadata('test', { role: NodeRole.Test })],
      ]);

      const cluster: Cluster = {
        id: 'role-test',
        name: 'RoleTestCluster',
        type: ClusterType.Project,
        origin: Origin.Local,
        nodes: [nodeA, nodeB, nodeC],
        anchors: ['entry'],
        metadata,
      };

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      expect(result.relativePositions.size).toBe(3);
      expect(result.relativePositions.has('entry')).toBe(true);
      expect(result.relativePositions.has('lib')).toBe(true);
      expect(result.relativePositions.has('test')).toBe(true);
    });

    it('should handle nodes without metadata (defaults to InternalLib role)', () => {
      const nodeA = createNode({ id: 'no-meta-1', name: 'NoMeta1' });
      const nodeB = createNode({ id: 'no-meta-2', name: 'NoMeta2' });

      const cluster: Cluster = {
        id: 'no-meta',
        name: 'NoMetaCluster',
        type: ClusterType.Project,
        origin: Origin.Local,
        nodes: [nodeA, nodeB],
        anchors: [],
        metadata: new Map(), // Empty metadata
      };

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      // Should still produce positions even without metadata
      expect(result.relativePositions.size).toBe(2);
      for (const [, pos] of result.relativePositions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });
  });

  // ==================== Position Bounds ====================

  describe('position bounds', () => {
    it('should keep all node positions within the cluster radius', () => {
      const cluster = createClusterWithNodes(10);

      const result = computeClusterInterior(cluster, DEFAULT_CONFIG);

      const radius = Math.max(result.width, result.height) / 2;

      for (const [, pos] of result.relativePositions) {
        const distFromCenter = Math.hypot(pos.x, pos.y);
        // Allow some tolerance beyond the nominal radius
        expect(distFromCenter).toBeLessThan(radius + 100);
      }
    });
  });
});

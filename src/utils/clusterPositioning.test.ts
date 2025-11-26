import { describe, expect, it } from 'vitest';
import {
  createCluster,
  createClusterWithNodes,
  createNode,
  createNodeMetadata,
} from '../test/fixtures';
import type { Cluster, ClusterLayoutConfig } from '../types/cluster';
import { calculateClusterBounds, calculateRadialPositions } from './clusterPositioning';

// Define test config matching the actual interface
const testConfig: ClusterLayoutConfig = {
  layerSpacing: 80,
  minNodeSpacing: 50,
  testOrbitRadius: 40,
  clusterPadding: 30,
};

describe('clusterPositioning', () => {
  describe('calculateRadialPositions', () => {
    it('should position nodes in a cluster', () => {
      const cluster = createCluster();

      const result = calculateRadialPositions(cluster, testConfig);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((pos) => {
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      });
    });

    it('should assign correct cluster ID to positioned nodes', () => {
      const cluster = createCluster({ id: 'my-cluster' });

      const result = calculateRadialPositions(cluster, testConfig);

      result.forEach((pos) => {
        expect(pos.clusterId).toBe('my-cluster');
      });
    });

    it('should position entry nodes at layer 0', () => {
      const nodes = [
        createNode({ id: 'entry', name: 'Entry', type: 'app' }),
        createNode({ id: 'lib', name: 'Lib', type: 'library' }),
      ];
      const metadata = new Map([
        ['entry', createNodeMetadata('entry', { role: 'entry', layer: 0, isAnchor: true })],
        ['lib', createNodeMetadata('lib', { role: 'internal-lib', layer: 1, isAnchor: false })],
      ]);
      const cluster: Cluster = {
        id: 'test',
        name: 'Test',
        type: 'project',
        origin: 'local',
        nodes,
        metadata,
        anchors: ['entry'],
      };

      const result = calculateRadialPositions(cluster, testConfig);

      const entryPos = result.find((p) => p.node.id === 'entry')!;
      // Layer 0 nodes should be at center (radius 0)
      expect(entryPos.targetRadius).toBe(0);
    });

    it('should position test nodes as satellites', () => {
      const nodes = [
        createNode({ id: 'main', name: 'Main', type: 'framework' }),
        createNode({ id: 'tests', name: 'MainTests', type: 'test-unit' }),
      ];
      const metadata = new Map([
        ['main', createNodeMetadata('main', { role: 'entry', layer: 0, isAnchor: true })],
        ['tests', createNodeMetadata('tests', { role: 'test', layer: 0, testSubjects: ['main'] })],
      ]);
      const cluster: Cluster = {
        id: 'test',
        name: 'Test',
        type: 'project',
        origin: 'local',
        nodes,
        metadata,
        anchors: ['main'],
      };

      const result = calculateRadialPositions(cluster, testConfig);

      expect(result).toHaveLength(2);
      const testPos = result.find((p) => p.node.id === 'tests')!;
      expect(testPos.targetRadius).toBe(testConfig.testOrbitRadius);
    });

    it('should handle cluster with single node', () => {
      const cluster = createClusterWithNodes(1);

      const result = calculateRadialPositions(cluster, testConfig);

      expect(result).toHaveLength(1);
      expect(Number.isFinite(result[0].x)).toBe(true);
      expect(Number.isFinite(result[0].y)).toBe(true);
    });

    it('should position multiple nodes at same layer on same ring', () => {
      const nodes = [
        createNode({ id: 'entry', name: 'Entry', type: 'app' }),
        createNode({ id: 'fw1', name: 'Framework1', type: 'framework' }),
        createNode({ id: 'fw2', name: 'Framework2', type: 'framework' }),
      ];
      const metadata = new Map([
        ['entry', createNodeMetadata('entry', { role: 'entry', layer: 0, isAnchor: true })],
        ['fw1', createNodeMetadata('fw1', { role: 'internal-framework', layer: 1 })],
        ['fw2', createNodeMetadata('fw2', { role: 'internal-framework', layer: 1 })],
      ]);
      const cluster: Cluster = {
        id: 'test',
        name: 'Test',
        type: 'project',
        origin: 'local',
        nodes,
        metadata,
        anchors: ['entry'],
      };

      const result = calculateRadialPositions(cluster, testConfig);

      const fw1Pos = result.find((p) => p.node.id === 'fw1')!;
      const fw2Pos = result.find((p) => p.node.id === 'fw2')!;

      // Both should be at same ring (radius)
      expect(fw1Pos.targetRadius).toBe(fw2Pos.targetRadius);
    });

    it('should include metadata in positioned nodes', () => {
      const cluster = createCluster();

      const result = calculateRadialPositions(cluster, testConfig);

      result.forEach((pos) => {
        expect(pos.metadata).toBeDefined();
        expect(pos.metadata.nodeId).toBe(pos.node.id);
      });
    });
  });

  describe('calculateClusterBounds', () => {
    it('should return minimum size for empty array', () => {
      const bounds = calculateClusterBounds([], testConfig);

      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should calculate bounds from positioned nodes', () => {
      const cluster = createCluster();
      const positioned = calculateRadialPositions(cluster, testConfig);

      const bounds = calculateClusterBounds(positioned, testConfig);

      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('should include padding in bounds', () => {
      const nodes = [createNode({ id: 'A', name: 'NodeA', type: 'framework' })];
      const metadata = new Map([
        ['A', createNodeMetadata('A', { role: 'entry', layer: 0, isAnchor: true })],
      ]);
      const cluster: Cluster = {
        id: 'test',
        name: 'Test',
        type: 'project',
        origin: 'local',
        nodes,
        metadata,
        anchors: ['A'],
      };
      const positioned = calculateRadialPositions(cluster, testConfig);

      const bounds = calculateClusterBounds(positioned, testConfig);

      // Bounds should include padding
      expect(bounds.width).toBeGreaterThan(testConfig.clusterPadding * 2);
    });

    it('should compute center position', () => {
      const cluster = createCluster();
      const positioned = calculateRadialPositions(cluster, testConfig);

      const bounds = calculateClusterBounds(positioned, testConfig);

      // Center should be the midpoint of the bounding box
      expect(typeof bounds.x).toBe('number');
      expect(typeof bounds.y).toBe('number');
    });

    it('should handle large clusters', () => {
      const cluster = createClusterWithNodes(20);

      const positioned = calculateRadialPositions(cluster, testConfig);
      const bounds = calculateClusterBounds(positioned, testConfig);

      // Larger clusters should have larger bounds
      expect(bounds.width).toBeGreaterThan(100);
      expect(bounds.height).toBeGreaterThan(100);
    });
  });
});

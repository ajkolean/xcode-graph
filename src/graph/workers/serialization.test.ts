/**
 * Serialization round-trip tests for worker communication
 *
 * Tests that Map↔Array serialization used by native postMessage API
 * preserves data integrity across the boundary.
 */

import { deserializeResult, serializeCluster } from '@graph/layout/parallel-micro';
import type { HierarchicalLayoutResult } from '@graph/layout/types';
import {
  deserializeClusters,
  type SerializedCluster,
  serializeResult,
} from '@graph/workers/layout.worker';
import type { SerializedMicroResult } from '@graph/workers/micro-layout.worker';
import type { Cluster, NodePosition } from '@shared/schemas';
import { type ClusterNodeMetadata, ClusterType, NodeRole } from '@shared/schemas/cluster.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';

/** Helper to create a minimal cluster for testing */
function createTestCluster(overrides?: Partial<Cluster>): Cluster {
  return {
    id: 'test-cluster',
    name: 'TestCluster',
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: [
      {
        id: 'node-1',
        name: 'Node1',
        type: NodeType.Framework,
        platform: Platform.iOS,
        origin: Origin.Local,
        project: 'TestCluster',
      },
    ],
    anchors: ['node-1'],
    metadata: new Map(),
    ...overrides,
  };
}

/** Helper to create cluster node metadata */
function createMetadata(
  nodeId: string,
  overrides?: Partial<ClusterNodeMetadata>,
): ClusterNodeMetadata {
  return {
    nodeId,
    role: NodeRole.Entry,
    layer: 0,
    isAnchor: true,
    hasExternalDependents: false,
    dependencyCount: 2,
    dependsOnCount: 1,
    ...overrides,
  };
}

describe('Micro-layout serialization round-trips', () => {
  it('should preserve clusterId, width, height through serialize→deserialize', () => {
    const serialized: SerializedMicroResult = {
      clusterId: 'my-cluster',
      width: 350.5,
      height: 200.75,
      relativePositions: [],
    };

    const result = deserializeResult(serialized);

    expect(result.clusterId).toBe('my-cluster');
    expect(result.width).toBe(350.5);
    expect(result.height).toBe(200.75);
  });

  it('should convert relativePositions array back to Map', () => {
    const pos1: NodePosition = {
      id: 'n1',
      x: 10,
      y: 20,
      vx: 0,
      vy: 0,
      clusterId: 'c1',
      radius: 6,
    };
    const pos2: NodePosition = {
      id: 'n2',
      x: 30,
      y: 40,
      vx: 0.5,
      vy: -0.5,
      clusterId: 'c1',
      radius: 8,
      isAnchor: true,
    };

    const serialized: SerializedMicroResult = {
      clusterId: 'c1',
      width: 100,
      height: 100,
      relativePositions: [
        ['n1', pos1],
        ['n2', pos2],
      ],
    };

    const result = deserializeResult(serialized);

    expect(result.relativePositions).toBeInstanceOf(Map);
    expect(result.relativePositions.size).toBe(2);
    expect(result.relativePositions.get('n1')).toEqual(pos1);
    expect(result.relativePositions.get('n2')).toEqual(pos2);
    expect(result.relativePositions.get('n2')?.isAnchor).toBe(true);
  });

  it('should handle empty relativePositions', () => {
    const serialized: SerializedMicroResult = {
      clusterId: 'empty',
      width: 60,
      height: 60,
      relativePositions: [],
    };

    const result = deserializeResult(serialized);

    expect(result.relativePositions).toBeInstanceOf(Map);
    expect(result.relativePositions.size).toBe(0);
  });

  it('should serialize cluster metadata Map to array entries', () => {
    const metadata = new Map<string, ClusterNodeMetadata>();
    metadata.set('node-1', createMetadata('node-1'));
    metadata.set('node-2', createMetadata('node-2', { role: NodeRole.Test, layer: 2 }));

    const cluster = createTestCluster({ metadata });

    const serialized = serializeCluster(cluster);

    expect(Array.isArray(serialized.metadata)).toBe(true);
    expect(serialized.metadata).toHaveLength(2);

    const metaMap = new Map(serialized.metadata);
    expect(metaMap.get('node-1')?.role).toBe(NodeRole.Entry);
    expect(metaMap.get('node-2')?.role).toBe(NodeRole.Test);
    expect(metaMap.get('node-2')?.layer).toBe(2);
  });

  it('should preserve cluster fields through serialization', () => {
    const cluster = createTestCluster({
      id: 'my-proj',
      name: 'MyProject',
      path: '/path/to/project',
      anchors: ['node-1', 'node-2'],
    });

    const serialized = serializeCluster(cluster);

    expect(serialized.id).toBe('my-proj');
    expect(serialized.name).toBe('MyProject');
    expect(serialized.type).toBe(ClusterType.Project);
    expect(serialized.origin).toBe(Origin.Local);
    expect(serialized.path).toBe('/path/to/project');
    expect(serialized.anchors).toEqual(['node-1', 'node-2']);
    expect(serialized.nodes).toHaveLength(1);
  });

  it('should handle cluster with undefined path', () => {
    const cluster = createTestCluster({ path: undefined });

    const serialized = serializeCluster(cluster);

    expect(serialized.path).toBeUndefined();
  });

  it('should handle large position arrays', () => {
    const entries: Array<[string, NodePosition]> = [];
    for (let i = 0; i < 500; i++) {
      entries.push([
        `node-${i}`,
        {
          id: `node-${i}`,
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          vx: 0,
          vy: 0,
          clusterId: 'big-cluster',
          radius: 6,
        },
      ]);
    }

    const serialized: SerializedMicroResult = {
      clusterId: 'big-cluster',
      width: 2000,
      height: 2000,
      relativePositions: entries,
    };

    const result = deserializeResult(serialized);

    expect(result.relativePositions.size).toBe(500);
    for (let i = 0; i < 500; i++) {
      expect(result.relativePositions.has(`node-${i}`)).toBe(true);
    }
  });

  it('should handle optional NodePosition fields', () => {
    const pos: NodePosition = {
      id: 'n1',
      x: 100,
      y: 200,
      vx: 0,
      vy: 0,
      clusterId: 'c1',
      radius: 6,
      z: 50,
      vz: 0.1,
      targetRadius: 75,
      targetAngle: 1.5,
      isAnchor: true,
      isTest: false,
      testSubject: 'some-target',
    };

    const serialized: SerializedMicroResult = {
      clusterId: 'c1',
      width: 100,
      height: 100,
      relativePositions: [['n1', pos]],
    };

    const result = deserializeResult(serialized);
    const restored = result.relativePositions.get('n1');

    expect(restored?.z).toBe(50);
    expect(restored?.vz).toBe(0.1);
    expect(restored?.targetRadius).toBe(75);
    expect(restored?.targetAngle).toBe(1.5);
    expect(restored?.isAnchor).toBe(true);
    expect(restored?.isTest).toBe(false);
    expect(restored?.testSubject).toBe('some-target');
  });
});

describe('Layout worker serialization round-trips', () => {
  it('should deserialize clusters with Map metadata', () => {
    const serialized: SerializedCluster[] = [
      {
        id: 'proj-a',
        name: 'ProjectA',
        type: 'project',
        origin: 'local',
        nodes: [],
        anchors: ['n1'],
        metadata: [
          ['n1', createMetadata('n1')],
          ['n2', createMetadata('n2', { role: NodeRole.Utility, layer: 1 })],
        ],
      },
    ];

    const clusters = deserializeClusters(serialized);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.id).toBe('proj-a');
    expect(clusters[0]?.metadata).toBeInstanceOf(Map);
    expect(clusters[0]?.metadata.size).toBe(2);
    expect(clusters[0]?.metadata.get('n1')?.role).toBe(NodeRole.Entry);
    expect(clusters[0]?.metadata.get('n2')?.role).toBe(NodeRole.Utility);
  });

  it('should deserialize multiple clusters preserving all fields', () => {
    const serialized: SerializedCluster[] = [
      {
        id: 'proj-a',
        name: 'ProjectA',
        type: 'project',
        origin: 'local',
        path: '/path/a',
        nodes: [],
        anchors: [],
        metadata: [],
      },
      {
        id: 'pkg-b',
        name: 'PackageB',
        type: 'package',
        origin: 'external',
        nodes: [],
        anchors: [],
        metadata: [],
      },
    ];

    const clusters = deserializeClusters(serialized);

    expect(clusters).toHaveLength(2);
    expect(clusters[0]?.path).toBe('/path/a');
    expect(clusters[1]?.path).toBeUndefined();
    expect(clusters[0]?.metadata).toBeInstanceOf(Map);
    expect(clusters[1]?.metadata).toBeInstanceOf(Map);
  });

  it('should handle empty metadata in deserialization', () => {
    const serialized: SerializedCluster[] = [
      {
        id: 'empty',
        name: 'Empty',
        type: 'project',
        origin: 'local',
        nodes: [],
        anchors: [],
        metadata: [],
      },
    ];

    const clusters = deserializeClusters(serialized);

    expect(clusters[0]?.metadata).toBeInstanceOf(Map);
    expect(clusters[0]?.metadata.size).toBe(0);
  });

  it('should serialize layout result Maps to arrays', () => {
    const nodePositions = new Map([
      [
        'n1',
        {
          id: 'n1',
          x: 100,
          y: 200,
          vx: 0,
          vy: 0,
          clusterId: 'c1',
          radius: 6,
          nodeCount: 1,
          width: 50,
          height: 50,
        },
      ],
    ]);

    const clusterPositions = new Map([
      [
        'c1',
        {
          id: 'c1',
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          width: 300,
          height: 200,
          nodeCount: 5,
        },
      ],
    ]);

    const result: HierarchicalLayoutResult = {
      nodePositions: nodePositions as unknown as Map<string, NodePosition>,
      clusterPositions,
      clusters: [createTestCluster()],
    };

    const serialized = serializeResult(result);

    expect(Array.isArray(serialized.nodePositions)).toBe(true);
    expect(serialized.nodePositions).toHaveLength(1);
    expect(serialized.nodePositions[0]?.[0]).toBe('n1');

    expect(Array.isArray(serialized.clusterPositions)).toBe(true);
    expect(serialized.clusterPositions).toHaveLength(1);
    expect(serialized.clusterPositions[0]?.[0]).toBe('c1');
  });

  it('should serialize cluster metadata within layout result', () => {
    const metadata = new Map<string, ClusterNodeMetadata>();
    metadata.set('n1', createMetadata('n1'));

    const result: HierarchicalLayoutResult = {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [createTestCluster({ metadata })],
    };

    const serialized = serializeResult(result);

    expect(Array.isArray(serialized.clusters[0]?.metadata)).toBe(true);
    const metaEntries = serialized.clusters[0]?.metadata;
    expect(metaEntries).toHaveLength(1);
    expect(metaEntries?.[0]?.[0]).toBe('n1');
  });

  it('should handle optional fields in layout result', () => {
    const result: HierarchicalLayoutResult = {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
      cycleNodes: new Set(['a', 'b', 'c']),
      nodeSccId: new Map([
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]),
      sccSizes: new Map([[1, 3]]),
      maxStratum: 4,
      maxClusterStratum: 2,
    };

    const serialized = serializeResult(result);

    expect(serialized.cycleNodes).toEqual(['a', 'b', 'c']);
    expect(serialized.nodeSccId).toEqual([
      ['a', 1],
      ['b', 1],
      ['c', 1],
    ]);
    expect(serialized.sccSizes).toEqual([[1, 3]]);
    expect(serialized.maxStratum).toBe(4);
    expect(serialized.maxClusterStratum).toBe(2);
  });

  it('should handle undefined optional fields in layout result', () => {
    const result: HierarchicalLayoutResult = {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [],
    };

    const serialized = serializeResult(result);

    expect(serialized.cycleNodes).toBeUndefined();
    expect(serialized.nodeSccId).toBeUndefined();
    expect(serialized.sccSizes).toBeUndefined();
    expect(serialized.maxStratum).toBeUndefined();
    expect(serialized.maxClusterStratum).toBeUndefined();
    expect(serialized.clusterEdges).toBeUndefined();
    expect(serialized.routedEdges).toBeUndefined();
  });

  it('should round-trip serialize→deserialize for clusters', () => {
    const metadata = new Map<string, ClusterNodeMetadata>();
    metadata.set('n1', createMetadata('n1'));
    metadata.set(
      'n2',
      createMetadata('n2', {
        role: NodeRole.InternalFramework,
        layer: 1,
        isAnchor: false,
        hasExternalDependents: true,
        dependencyCount: 5,
        dependsOnCount: 3,
        testSubjects: ['target-a'],
      }),
    );

    const cluster = createTestCluster({ metadata });
    const result: HierarchicalLayoutResult = {
      nodePositions: new Map(),
      clusterPositions: new Map(),
      clusters: [cluster],
    };

    const serialized = serializeResult(result);
    const restored = deserializeClusters(serialized.clusters);

    expect(restored[0]?.metadata).toBeInstanceOf(Map);
    expect(restored[0]?.metadata.size).toBe(2);

    const restoredMeta = restored[0]?.metadata.get('n2');
    expect(restoredMeta?.role).toBe(NodeRole.InternalFramework);
    expect(restoredMeta?.layer).toBe(1);
    expect(restoredMeta?.isAnchor).toBe(false);
    expect(restoredMeta?.hasExternalDependents).toBe(true);
    expect(restoredMeta?.dependencyCount).toBe(5);
    expect(restoredMeta?.dependsOnCount).toBe(3);
    expect(restoredMeta?.testSubjects).toEqual(['target-a']);
  });
});

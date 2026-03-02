import type { HierarchicalLayoutResult } from '@graph/layout/types';
import type { Cluster, NodePosition } from '@shared/schemas';
import { NodeRole } from '@shared/schemas/cluster.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@graph/layout/hierarchical-layout', () => ({
  computeHierarchicalLayout: vi.fn(() => ({
    nodePositions: new Map([
      [
        'n1',
        {
          id: 'n1',
          x: 10,
          y: 20,
          vx: 0,
          vy: 0,
          clusterId: 'c1',
          radius: 6,
        },
      ],
    ]),
    clusterPositions: new Map([
      [
        'c1',
        {
          id: 'c1',
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          width: 200,
          height: 150,
          nodeCount: 1,
        },
      ],
    ]),
    clusters: [
      {
        id: 'c1',
        name: 'Cluster1',
        type: 'project',
        origin: 'local',
        nodes: [],
        anchors: [],
        metadata: new Map(),
      },
    ],
  })),
}));

// Use an object to avoid TDZ issues with vi.mock hoisting
const captured: { workerApi: Record<string, unknown> | null } = { workerApi: null };
vi.mock('comlink', () => ({
  expose: vi.fn((api: Record<string, unknown>) => {
    captured.workerApi = api;
  }),
}));

describe('layout.worker', () => {
  describe('deserializeClusters', () => {
    it('converts serialized metadata arrays back to Maps', async () => {
      const { deserializeClusters } = await import('./layout.worker');
      type SC = import('./layout.worker').SerializedCluster;
      const serialized: SC[] = [
        {
          id: 'c1',
          name: 'Cluster',
          type: 'project',
          origin: 'local',
          nodes: [],
          anchors: [],
          metadata: [
            [
              'n1',
              {
                nodeId: 'n1',
                role: NodeRole.Entry,
                layer: 0,
                isAnchor: true,
                hasExternalDependents: false,
                dependencyCount: 0,
                dependsOnCount: 0,
              },
            ],
          ],
        },
      ];

      const result = deserializeClusters(serialized);

      expect(result).toHaveLength(1);
      expect(result[0]?.metadata).toBeInstanceOf(Map);
      expect(result[0]?.metadata.get('n1')?.nodeId).toBe('n1');
    });
  });

  describe('serializeResult', () => {
    it('converts Maps to arrays for worker transfer', async () => {
      const { serializeResult } = await import('./layout.worker');

      const result: HierarchicalLayoutResult = {
        nodePositions: new Map([
          ['n1', { id: 'n1', x: 10, y: 20, vx: 0, vy: 0, clusterId: 'c1', radius: 6 }],
        ]) as Map<string, NodePosition>,
        clusterPositions: new Map([
          ['c1', { id: 'c1', x: 0, y: 0, vx: 0, vy: 0, width: 200, height: 150, nodeCount: 1 }],
        ]),
        clusters: [
          {
            id: 'c1',
            name: 'Cluster1',
            type: 'project',
            origin: 'local',
            nodes: [],
            anchors: [],
            metadata: new Map([
              [
                'n1',
                {
                  nodeId: 'n1',
                  role: NodeRole.Entry,
                  layer: 0,
                  isAnchor: true,
                  hasExternalDependents: false,
                  dependencyCount: 0,
                  dependsOnCount: 0,
                },
              ],
            ]),
          } as unknown as Cluster,
        ],
      };

      const serialized = serializeResult(result);

      expect(Array.isArray(serialized.nodePositions)).toBe(true);
      expect(Array.isArray(serialized.clusterPositions)).toBe(true);
      expect(Array.isArray(serialized.clusters[0]?.metadata)).toBe(true);
    });
  });

  describe('workerApi.computeLayout', () => {
    it('exposes computeLayout via comlink', async () => {
      await import('./layout.worker');
      const { expose } = await import('comlink');

      expect(expose).toHaveBeenCalled();
      expect(captured.workerApi).not.toBeNull();
      expect(typeof captured.workerApi?.computeLayout).toBe('function');
    });

    it('deserializes clusters, computes layout, and serializes result', async () => {
      await import('./layout.worker');
      type SC = import('./layout.worker').SerializedCluster;

      const nodes = [
        {
          id: 'n1',
          name: 'Node1',
          type: NodeType.Framework,
          platform: Platform.iOS,
          origin: Origin.Local,
        },
      ];
      const edges = [{ source: 'n1', target: 'n1' }];
      const serializedClusters: SC[] = [
        {
          id: 'c1',
          name: 'Cluster1',
          type: 'project',
          origin: 'local',
          nodes,
          anchors: ['n1'],
          metadata: [],
        },
      ];

      const computeLayout = captured.workerApi?.computeLayout as (
        nodes: unknown,
        edges: unknown,
        clusters: unknown,
        opts?: unknown,
      ) => Promise<unknown>;

      const result = (await computeLayout(nodes, edges, serializedClusters)) as {
        nodePositions: Array<[string, unknown]>;
        clusterPositions: Array<[string, unknown]>;
        clusters: unknown[];
      };

      expect(result.nodePositions).toHaveLength(1);
      expect(result.nodePositions[0]?.[0]).toBe('n1');
      expect(result.clusterPositions).toHaveLength(1);
      expect(result.clusters).toHaveLength(1);
    });
  });
});

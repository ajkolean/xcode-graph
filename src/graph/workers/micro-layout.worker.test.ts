import { DEFAULT_CONFIG } from '@graph/layout/config';
import { NodeRole } from '@shared/schemas/cluster.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';

const mockMicroResult = {
  clusterId: 'test-cluster',
  width: 200,
  height: 150,
  relativePositions: new Map([
    ['n1', { id: 'n1', x: 10, y: 20, vx: 0, vy: 0, clusterId: 'test-cluster', radius: 6 }],
  ]),
};

vi.mock('@graph/layout/phases/micro-layout', () => ({
  computeClusterInterior: vi.fn(() => mockMicroResult),
}));

vi.mock('@graph/layout/phases/node-massage', () => ({
  applyNodeMassage: vi.fn((micro) => micro),
}));

let capturedWorkerApi: Record<string, unknown> | null = null;
vi.mock('comlink', () => ({
  expose: vi.fn((api: Record<string, unknown>) => {
    capturedWorkerApi = api;
  }),
}));

describe('micro-layout.worker', () => {
  it('exposes workerApi via comlink', async () => {
    await import('./micro-layout.worker');
    const { expose } = await import('comlink');

    expect(expose).toHaveBeenCalled();
    expect(capturedWorkerApi).not.toBeNull();
    expect(typeof capturedWorkerApi?.computeMicro).toBe('function');
  });

  it('computeMicro deserializes cluster and returns serialized result', async () => {
    await import('./micro-layout.worker');

    const serializedCluster = {
      id: 'test-cluster',
      name: 'TestCluster',
      type: 'project',
      origin: 'local',
      nodes: [
        {
          id: 'n1',
          name: 'Node1',
          type: NodeType.Framework,
          platform: Platform.iOS,
          origin: Origin.Local,
        },
      ],
      anchors: ['n1'],
      metadata: [
        [
          'n1',
          {
            nodeId: 'n1',
            role: NodeRole.Entry,
            layer: 0,
            isAnchor: true,
            hasExternalDependents: false,
            dependencyCount: 1,
            dependsOnCount: 0,
          },
        ],
      ] as Array<[string, unknown]>,
    };

    const computeMicro = capturedWorkerApi?.computeMicro as (
      cluster: unknown,
      config: unknown,
    ) => {
      clusterId: string;
      width: number;
      height: number;
      relativePositions: Array<[string, unknown]>;
    };

    const result = computeMicro(serializedCluster, DEFAULT_CONFIG);

    expect(result.clusterId).toBe('test-cluster');
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
    expect(Array.isArray(result.relativePositions)).toBe(true);
    expect(result.relativePositions).toHaveLength(1);
    expect(result.relativePositions[0]?.[0]).toBe('n1');
  });

  it('computeMicro passes deserialized cluster with Map metadata to computeClusterInterior', async () => {
    await import('./micro-layout.worker');
    const { computeClusterInterior } = await import('@graph/layout/phases/micro-layout');

    const serializedCluster = {
      id: 'c2',
      name: 'Cluster2',
      type: 'project',
      origin: 'local',
      nodes: [],
      anchors: [],
      metadata: [
        [
          'x1',
          {
            nodeId: 'x1',
            role: NodeRole.Entry,
            layer: 0,
            isAnchor: true,
            hasExternalDependents: false,
            dependencyCount: 0,
            dependsOnCount: 0,
          },
        ],
      ] as Array<[string, unknown]>,
    };

    const computeMicro = capturedWorkerApi?.computeMicro as (
      cluster: unknown,
      config: unknown,
    ) => unknown;

    computeMicro(serializedCluster, DEFAULT_CONFIG);

    expect(computeClusterInterior).toHaveBeenCalled();
    const calledCluster = vi.mocked(computeClusterInterior).mock.calls.at(-1)?.[0];
    expect(calledCluster?.metadata).toBeInstanceOf(Map);
    expect(calledCluster?.metadata.get('x1')?.nodeId).toBe('x1');
  });
});

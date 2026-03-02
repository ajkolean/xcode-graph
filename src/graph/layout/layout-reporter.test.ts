import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { ClusterType } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';
import { Origin } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';
import {
  exportClustersToCSV,
  exportNodesToCSV,
  exportToJSON,
  findHubClusters,
  findIsolatedClusters,
  generatePositionReport,
  printClusterTable,
  printLayoutSummary,
  printNodesByCluster,
  printStrataVisualization,
} from './layout-reporter';
import type { HierarchicalLayoutResult } from './types';

function makeClusterPosition(
  overrides: Partial<ClusterPosition> & { id: string },
): ClusterPosition {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 200,
    height: 100,
    nodeCount: 2,
    ...overrides,
  };
}

function makeNodePosition(
  overrides: Partial<NodePosition> & { id: string; clusterId: string },
): NodePosition {
  return {
    x: 10,
    y: 20,
    vx: 0,
    vy: 0,
    radius: 12,
    ...overrides,
  };
}

function makeCluster(id: string, nodeIds: string[]): Cluster {
  return {
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: nodeIds.map((nid) => ({
      id: nid,
      name: nid,
      type: 'framework' as never,
      platform: 'iOS' as never,
      origin: Origin.Local,
    })),
    anchors: [],
    metadata: new Map(),
  };
}

function makeLayoutResult(
  clusterData: Array<{ id: string; pos: ClusterPosition; nodeIds: string[] }>,
  nodePosOverrides?: Map<string, NodePosition>,
): HierarchicalLayoutResult {
  const clusterPositions = new Map<string, ClusterPosition>();
  const nodePositions = new Map<string, NodePosition>();
  const clusters: Cluster[] = [];

  for (const cd of clusterData) {
    clusterPositions.set(cd.id, cd.pos);
    clusters.push(makeCluster(cd.id, cd.nodeIds));
    for (const nid of cd.nodeIds) {
      nodePositions.set(
        nid,
        nodePosOverrides?.get(nid) ?? makeNodePosition({ id: nid, clusterId: cd.id }),
      );
    }
  }

  return { clusterPositions, nodePositions, clusters };
}

describe('generatePositionReport', () => {
  it('generates report with correct cluster and node counts', () => {
    const result = makeLayoutResult([
      {
        id: 'A',
        pos: makeClusterPosition({ id: 'A', x: 0, y: 0, width: 200, height: 100 }),
        nodeIds: ['a1', 'a2'],
      },
      {
        id: 'B',
        pos: makeClusterPosition({ id: 'B', x: 500, y: 800, width: 300, height: 150 }),
        nodeIds: ['b1'],
      },
    ]);

    const report = generatePositionReport(result);

    expect(report.summary.totalClusters).toBe(2);
    expect(report.summary.totalNodes).toBe(3);
    expect(report.clusters).toHaveLength(2);
    expect(report.nodes).toHaveLength(3);
  });

  it('computes bounding box correctly', () => {
    const result = makeLayoutResult([
      {
        id: 'A',
        pos: makeClusterPosition({ id: 'A', x: 100, y: 200, width: 200, height: 100 }),
        nodeIds: [],
      },
      {
        id: 'B',
        pos: makeClusterPosition({ id: 'B', x: 500, y: 800, width: 300, height: 150 }),
        nodeIds: [],
      },
    ]);

    const report = generatePositionReport(result);

    // A: center (100,200), halfW=100, halfH=50 → x: [0, 200], y: [150, 250]
    // B: center (500,800), halfW=150, halfH=75 → x: [350, 650], y: [725, 875]
    expect(report.summary.boundingBox.xMin).toBe(0);
    expect(report.summary.boundingBox.xMax).toBe(650);
    expect(report.summary.boundingBox.yMin).toBe(150);
    expect(report.summary.boundingBox.yMax).toBe(875);
    expect(report.summary.boundingBox.width).toBe(650);
    expect(report.summary.boundingBox.height).toBe(725);
  });

  it('computes bounding box as zeros for empty clusters', () => {
    const result = makeLayoutResult([]);
    const report = generatePositionReport(result);

    expect(report.summary.boundingBox.xMin).toBe(0);
    expect(report.summary.boundingBox.xMax).toBe(0);
    expect(report.summary.boundingBox.width).toBe(0);
    expect(report.summary.boundingBox.height).toBe(0);
  });

  it('computes stratum from y position and strataSpacing', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: [] },
      { id: 'B', pos: makeClusterPosition({ id: 'B', y: 800 }), nodeIds: [] },
      { id: 'C', pos: makeClusterPosition({ id: 'C', y: 1600 }), nodeIds: [] },
    ]);

    const report = generatePositionReport(result, 800);
    expect(report.summary.strataCount).toBe(3);
    expect(report.clusters[0]?.stratum).toBe(0);
    expect(report.clusters[1]?.stratum).toBe(1);
    expect(report.clusters[2]?.stratum).toBe(2);
  });

  it('computes aspect ratio correctly', () => {
    const result = makeLayoutResult([
      {
        id: 'A',
        pos: makeClusterPosition({ id: 'A', x: 0, y: 0, width: 400, height: 200 }),
        nodeIds: [],
      },
    ]);

    const report = generatePositionReport(result);
    // Single cluster: width=400, height=200, bbox: width=400, height=200
    expect(report.summary.aspectRatio).toBeCloseTo(400 / 200);
  });

  it('computes absolute node positions', () => {
    const clusterPos = makeClusterPosition({ id: 'A', x: 100, y: 200 });
    const nodePos = makeNodePosition({ id: 'n1', clusterId: 'A', x: 30, y: 40 });
    const result = makeLayoutResult(
      [{ id: 'A', pos: clusterPos, nodeIds: ['n1'] }],
      new Map([['n1', nodePos]]),
    );

    const report = generatePositionReport(result);
    const node = report.nodes[0];
    expect(node?.absoluteX).toBe(130); // 30 + 100
    expect(node?.absoluteY).toBe(240); // 40 + 200
    expect(node?.relativeX).toBe(30);
    expect(node?.relativeY).toBe(40);
  });
});

describe('exportToJSON', () => {
  it('serializes report to JSON string', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['a1'] },
    ]);
    const report = generatePositionReport(result);
    const json = exportToJSON(report);

    const parsed = JSON.parse(json);
    expect(parsed.summary.totalClusters).toBe(1);
    expect(parsed.summary.totalNodes).toBe(1);
  });
});

describe('exportClustersToCSV', () => {
  it('generates CSV with headers and rows', () => {
    const result = makeLayoutResult([
      {
        id: 'A',
        pos: makeClusterPosition({
          id: 'A',
          x: 100,
          y: 200,
          width: 300,
          height: 150,
          nodeCount: 5,
        }),
        nodeIds: [],
      },
    ]);
    const report = generatePositionReport(result);
    const csv = exportClustersToCSV(report);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('id,stratum,x,y,width,height,nodeCount');
    expect(lines[1]).toBe('A,0,100,200,300,150,5');
  });

  it('handles multiple clusters', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: [] },
      { id: 'B', pos: makeClusterPosition({ id: 'B', y: 800 }), nodeIds: [] },
    ]);
    const report = generatePositionReport(result);
    const csv = exportClustersToCSV(report);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(3); // header + 2 rows
  });
});

describe('exportNodesToCSV', () => {
  it('generates CSV with headers and rows', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', x: 50, y: 60 }), nodeIds: ['n1'] },
    ]);
    const report = generatePositionReport(result);
    const csv = exportNodesToCSV(report);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('id,clusterId,relativeX,relativeY,absoluteX,absoluteY');
    expect(lines).toHaveLength(2); // header + 1 row
  });
});

describe('findHubClusters', () => {
  it('returns clusters with cross-stratum edges sorted by connectedStrata desc', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: ['a1'] },
      { id: 'B', pos: makeClusterPosition({ id: 'B', y: 800 }), nodeIds: ['b1'] },
      { id: 'C', pos: makeClusterPosition({ id: 'C', y: 1600 }), nodeIds: ['c1'] },
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['b1', 'B'],
      ['c1', 'C'],
    ]);
    const edges: GraphEdge[] = [
      { source: 'a1', target: 'b1' }, // A(stratum 0) → B(stratum 1)
      { source: 'b1', target: 'c1' }, // B(stratum 1) → C(stratum 2)
    ];

    const hubs = findHubClusters(result, edges, nodeToCluster);
    // B connects to both stratum 0 (via A) and stratum 2 (via C) = 2 connected strata
    const hubB = hubs.find((h) => h.clusterId === 'B');
    expect(hubB).toBeDefined();
    expect(hubB?.connectedStrata).toBe(2);
    // Sorted by connectedStrata desc → B first
    expect(hubs[0]?.clusterId).toBe('B');
  });

  it('skips same-cluster edges', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: ['a1', 'a2'] },
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['a2', 'A'],
    ]);
    const edges: GraphEdge[] = [{ source: 'a1', target: 'a2' }];

    const hubs = findHubClusters(result, edges, nodeToCluster);
    expect(hubs).toHaveLength(0);
  });

  it('skips edges where source or target cluster position is missing', () => {
    const clusterPositions = new Map<string, ClusterPosition>();
    clusterPositions.set('A', makeClusterPosition({ id: 'A', y: 0 }));
    // B has no position

    const result: HierarchicalLayoutResult = {
      clusterPositions,
      nodePositions: new Map(),
      clusters: [makeCluster('A', ['a1']), makeCluster('B', ['b1'])],
    };
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['b1', 'B'],
    ]);
    const edges: GraphEdge[] = [{ source: 'a1', target: 'b1' }];

    const hubs = findHubClusters(result, edges, nodeToCluster);
    expect(hubs).toHaveLength(0);
  });

  it('skips edges with unmapped source or target nodes', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: ['a1'] },
    ]);
    const nodeToCluster = new Map([['a1', 'A']]);
    const edges: GraphEdge[] = [{ source: 'unknown', target: 'a1' }];

    const hubs = findHubClusters(result, edges, nodeToCluster);
    expect(hubs).toHaveLength(0);
  });

  it('does not count same-stratum cross-cluster edges', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: ['a1'] },
      { id: 'B', pos: makeClusterPosition({ id: 'B', y: 100 }), nodeIds: ['b1'] }, // Same stratum (both floor to 0)
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['b1', 'B'],
    ]);
    const edges: GraphEdge[] = [{ source: 'a1', target: 'b1' }];

    const hubs = findHubClusters(result, edges, nodeToCluster);
    expect(hubs).toHaveLength(0);
  });
});

describe('findIsolatedClusters', () => {
  it('returns all clusters sorted by connectionCount ascending', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['a1'] },
      { id: 'B', pos: makeClusterPosition({ id: 'B' }), nodeIds: ['b1'] },
      { id: 'C', pos: makeClusterPosition({ id: 'C' }), nodeIds: ['c1'] },
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['b1', 'B'],
      ['c1', 'C'],
    ]);
    const edges: GraphEdge[] = [
      { source: 'a1', target: 'b1' }, // A-B connection
      { source: 'a1', target: 'c1' }, // A-C connection
    ];

    const isolated = findIsolatedClusters(result, edges, nodeToCluster);
    // B connects to A only → 1 connection
    // C connects to A only → 1 connection
    // A connects to B and C → 2 connections
    // Sorted ascending: B(1), C(1), A(2)
    expect(isolated[0]?.connectionCount).toBeLessThanOrEqual(
      isolated[1]?.connectionCount as number,
    );
    expect(isolated[2]?.clusterId).toBe('A');
    expect(isolated[2]?.connectionCount).toBe(2);
  });

  it('returns 0 connections for truly isolated clusters', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['a1'] },
      { id: 'B', pos: makeClusterPosition({ id: 'B' }), nodeIds: ['b1'] },
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['b1', 'B'],
    ]);

    const isolated = findIsolatedClusters(result, [], nodeToCluster);
    expect(isolated).toHaveLength(2);
    expect(isolated[0]?.connectionCount).toBe(0);
    expect(isolated[1]?.connectionCount).toBe(0);
  });

  it('skips same-cluster edges', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['a1', 'a2'] },
    ]);
    const nodeToCluster = new Map([
      ['a1', 'A'],
      ['a2', 'A'],
    ]);
    const edges: GraphEdge[] = [{ source: 'a1', target: 'a2' }];

    const isolated = findIsolatedClusters(result, edges, nodeToCluster);
    expect(isolated[0]?.connectionCount).toBe(0);
  });

  it('skips edges with unmapped nodes', () => {
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['a1'] },
    ]);
    const nodeToCluster = new Map([['a1', 'A']]);
    const edges: GraphEdge[] = [{ source: 'unknown', target: 'a1' }];

    const isolated = findIsolatedClusters(result, edges, nodeToCluster);
    expect(isolated[0]?.connectionCount).toBe(0);
  });
});

describe('printClusterTable', () => {
  it('prints without throwing', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); // skipcq: JS-0321
    const result = makeLayoutResult([
      {
        id: 'TestCluster',
        pos: makeClusterPosition({
          id: 'TestCluster',
          x: 100,
          y: 200,
          width: 300,
          height: 150,
          nodeCount: 5,
        }),
        nodeIds: [],
      },
    ]);
    printClusterTable(result);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('printNodesByCluster', () => {
  it('prints without throwing', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); // skipcq: JS-0321
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['n1', 'n2'] },
    ]);
    printNodesByCluster(result);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('truncates when more nodes than maxNodesPerCluster', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); // skipcq: JS-0321
    const nodeIds = Array.from({ length: 15 }, (_, i) => `n${i}`);
    const result = makeLayoutResult([{ id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds }]);
    printNodesByCluster(result, 5);
    const calls = spy.mock.calls.map((c) => c[0] as string);
    expect(calls.some((c) => c.includes('... and 10 more nodes'))).toBe(true);
    spy.mockRestore();
  });
});

describe('printStrataVisualization', () => {
  it('prints without throwing', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); // skipcq: JS-0321
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A', y: 0 }), nodeIds: [] },
      { id: 'B', pos: makeClusterPosition({ id: 'B', y: 800 }), nodeIds: [] },
    ]);
    printStrataVisualization(result);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('printLayoutSummary', () => {
  it('prints without throwing', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {}); // skipcq: JS-0321
    const result = makeLayoutResult([
      { id: 'A', pos: makeClusterPosition({ id: 'A' }), nodeIds: ['n1'] },
    ]);
    const report = generatePositionReport(result);
    printLayoutSummary(report);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

/**
 * Tests for cluster-strata module
 * Validates cluster DAG construction and strata computation
 */

import type { GraphEdge } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import { buildClusterDag, computeClusterStrata, seedClustersByStrata } from './cluster-strata';

describe('buildClusterDag', () => {
  it('should return empty DAG for empty inputs', () => {
    const edges: GraphEdge[] = [];
    const nodeToCluster = new Map<string, string>();

    const dag = buildClusterDag(edges, nodeToCluster);

    expect(dag.size).toBe(0);
  });

  it('should ignore intra-cluster edges', () => {
    const edges: GraphEdge[] = [
      { source: 'A1', target: 'A2' },
      { source: 'A2', target: 'A3' },
    ];
    const nodeToCluster = new Map([
      ['A1', 'ClusterA'],
      ['A2', 'ClusterA'],
      ['A3', 'ClusterA'],
    ]);

    const dag = buildClusterDag(edges, nodeToCluster);

    // ClusterA should have no dependencies (all edges are internal)
    expect(dag.get('ClusterA')?.size).toBe(0);
  });

  it('should create cluster dependencies for cross-cluster edges', () => {
    const edges: GraphEdge[] = [
      { source: 'A1', target: 'B1' }, // ClusterA depends on ClusterB
      { source: 'B1', target: 'C1' }, // ClusterB depends on ClusterC
    ];
    const nodeToCluster = new Map([
      ['A1', 'ClusterA'],
      ['B1', 'ClusterB'],
      ['C1', 'ClusterC'],
    ]);

    const dag = buildClusterDag(edges, nodeToCluster);

    expect(dag.get('ClusterA')?.has('ClusterB')).toBe(true);
    expect(dag.get('ClusterB')?.has('ClusterC')).toBe(true);
    expect(dag.get('ClusterC')?.size).toBe(0); // Leaf cluster
  });

  it('should handle multiple edges between same clusters', () => {
    const edges: GraphEdge[] = [
      { source: 'A1', target: 'B1' },
      { source: 'A2', target: 'B2' },
      { source: 'A3', target: 'B1' },
    ];
    const nodeToCluster = new Map([
      ['A1', 'ClusterA'],
      ['A2', 'ClusterA'],
      ['A3', 'ClusterA'],
      ['B1', 'ClusterB'],
      ['B2', 'ClusterB'],
    ]);

    const dag = buildClusterDag(edges, nodeToCluster);

    // Should only have one dependency entry (deduplicated)
    expect(dag.get('ClusterA')?.size).toBe(1);
    expect(dag.get('ClusterA')?.has('ClusterB')).toBe(true);
  });
});

describe('computeClusterStrata', () => {
  it('should assign stratum 0 to clusters with no dependents', () => {
    const clusterIds = ['A', 'B', 'C'];
    const dag = new Map([
      ['A', new Set(['B'])], // A depends on B
      ['B', new Set(['C'])], // B depends on C
      ['C', new Set<string>()], // C has no dependencies
    ]);

    const result = computeClusterStrata(clusterIds, dag);

    // A has no dependents (nothing depends on A), so it's stratum 0
    expect(result.clusterStratum.get('A')).toBe(0);
  });

  it('should assign increasing strata based on dependency depth', () => {
    const clusterIds = ['Entry', 'Middle', 'Base'];
    const dag = new Map([
      ['Entry', new Set(['Middle'])],
      ['Middle', new Set(['Base'])],
      ['Base', new Set<string>()],
    ]);

    const result = computeClusterStrata(clusterIds, dag);

    // Entry (top) -> Middle -> Base (bottom)
    // Stratum increases as we go deeper
    expect(result.clusterStratum.get('Entry')).toBe(0);
    expect(result.clusterStratum.get('Middle')).toBe(1);
    expect(result.clusterStratum.get('Base')).toBe(2);
    expect(result.maxClusterStratum).toBe(2);
  });

  it('should handle diamond dependency pattern', () => {
    // Diamond: A depends on B and C, both B and C depend on D
    const clusterIds = ['A', 'B', 'C', 'D'];
    const dag = new Map([
      ['A', new Set(['B', 'C'])],
      ['B', new Set(['D'])],
      ['C', new Set(['D'])],
      ['D', new Set<string>()],
    ]);

    const result = computeClusterStrata(clusterIds, dag);

    expect(result.clusterStratum.get('A')).toBe(0);
    expect(result.clusterStratum.get('B')).toBe(1);
    expect(result.clusterStratum.get('C')).toBe(1);
    expect(result.clusterStratum.get('D')).toBe(2);
  });

  it('should handle disconnected clusters', () => {
    const clusterIds = ['A', 'B', 'Isolated'];
    const dag = new Map([
      ['A', new Set(['B'])],
      ['B', new Set<string>()],
      ['Isolated', new Set<string>()],
    ]);

    const result = computeClusterStrata(clusterIds, dag);

    // Both A and Isolated have no dependents
    expect(result.clusterStratum.get('A')).toBe(0);
    expect(result.clusterStratum.get('Isolated')).toBe(0);
    expect(result.clusterStratum.get('B')).toBe(1);
  });

  it('should build reverse DAG correctly', () => {
    const clusterIds = ['A', 'B', 'C'];
    const dag = new Map([
      ['A', new Set(['B', 'C'])],
      ['B', new Set(['C'])],
      ['C', new Set<string>()],
    ]);

    const result = computeClusterStrata(clusterIds, dag);

    // Reverse DAG: C is depended on by A and B
    expect(result.clusterReverseDag.get('C')?.has('A')).toBe(true);
    expect(result.clusterReverseDag.get('C')?.has('B')).toBe(true);
    expect(result.clusterReverseDag.get('B')?.has('A')).toBe(true);
    expect(result.clusterReverseDag.get('A')?.size).toBe(0);
  });
});

describe('seedClustersByStrata', () => {
  it('should position clusters in horizontal bands by stratum', () => {
    const clusters = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const strataResult = {
      clusterStratum: new Map([
        ['A', 0],
        ['B', 1],
        ['C', 2],
      ]),
      maxClusterStratum: 2,
      clusterDag: new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
        ['C', new Set<string>()],
      ]),
      clusterReverseDag: new Map([
        ['A', new Set<string>()],
        ['B', new Set(['A'])],
        ['C', new Set(['B'])],
      ]),
    };
    const clusterSizes = new Map([
      ['A', 100],
      ['B', 100],
      ['C', 100],
    ]);
    const config = { strataSpacing: 400, horizontalSpacing: 350 };

    const positions = seedClustersByStrata(clusters, strataResult, clusterSizes, config);

    // Each stratum should have different Y position
    expect(positions.get('A')?.y).toBe(0);
    expect(positions.get('B')?.y).toBe(400);
    expect(positions.get('C')?.y).toBe(800);
  });

  it('should center clusters horizontally within their stratum', () => {
    const clusters = [{ id: 'A' }, { id: 'B' }];
    const strataResult = {
      clusterStratum: new Map([
        ['A', 0],
        ['B', 0],
      ]),
      maxClusterStratum: 0,
      clusterDag: new Map([
        ['A', new Set<string>()],
        ['B', new Set<string>()],
      ]),
      clusterReverseDag: new Map([
        ['A', new Set<string>()],
        ['B', new Set<string>()],
      ]),
    };
    const clusterSizes = new Map([
      ['A', 100],
      ['B', 100],
    ]);
    const config = { strataSpacing: 400, horizontalSpacing: 100 };

    const positions = seedClustersByStrata(clusters, strataResult, clusterSizes, config);

    // Two clusters side by side, centered around x=0
    const xA = positions.get('A')?.x ?? 0;
    const xB = positions.get('B')?.x ?? 0;

    // They should be on opposite sides of center (or one at center if odd)
    expect(Math.abs(xA + xB) / 2).toBeLessThan(200); // Center should be near 0
  });

  it('should handle empty cluster list', () => {
    const clusters: Array<{ id: string }> = [];
    const strataResult = {
      clusterStratum: new Map<string, number>(),
      maxClusterStratum: 0,
      clusterDag: new Map<string, Set<string>>(),
      clusterReverseDag: new Map<string, Set<string>>(),
    };
    const clusterSizes = new Map<string, number>();
    const config = { strataSpacing: 400, horizontalSpacing: 350 };

    const positions = seedClustersByStrata(clusters, strataResult, clusterSizes, config);

    expect(positions.size).toBe(0);
  });
});

describe('Determinism', () => {
  it('should produce identical results for same inputs', () => {
    const clusterIds = ['A', 'B', 'C', 'D'];
    const dag = new Map([
      ['A', new Set(['B', 'C'])],
      ['B', new Set(['D'])],
      ['C', new Set(['D'])],
      ['D', new Set<string>()],
    ]);

    const result1 = computeClusterStrata(clusterIds, dag);
    const result2 = computeClusterStrata(clusterIds, dag);

    // Strata assignments should be identical
    for (const id of clusterIds) {
      expect(result1.clusterStratum.get(id)).toBe(result2.clusterStratum.get(id));
    }
    expect(result1.maxClusterStratum).toBe(result2.maxClusterStratum);
  });

  it('should produce consistent positions across multiple runs', () => {
    const clusters = [{ id: 'X' }, { id: 'Y' }, { id: 'Z' }];
    const strataResult = {
      clusterStratum: new Map([
        ['X', 0],
        ['Y', 1],
        ['Z', 1],
      ]),
      maxClusterStratum: 1,
      clusterDag: new Map([
        ['X', new Set(['Y', 'Z'])],
        ['Y', new Set<string>()],
        ['Z', new Set<string>()],
      ]),
      clusterReverseDag: new Map([
        ['X', new Set<string>()],
        ['Y', new Set(['X'])],
        ['Z', new Set(['X'])],
      ]),
    };
    const clusterSizes = new Map([
      ['X', 150],
      ['Y', 100],
      ['Z', 120],
    ]);
    const config = { strataSpacing: 400, horizontalSpacing: 200 };

    const positions1 = seedClustersByStrata(clusters, strataResult, clusterSizes, config);
    const positions2 = seedClustersByStrata(clusters, strataResult, clusterSizes, config);

    for (const cluster of clusters) {
      expect(positions1.get(cluster.id)?.x).toBe(positions2.get(cluster.id)?.x);
      expect(positions1.get(cluster.id)?.y).toBe(positions2.get(cluster.id)?.y);
    }
  });
});

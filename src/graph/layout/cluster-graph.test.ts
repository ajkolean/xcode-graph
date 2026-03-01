import { type Cluster, ClusterType } from '@shared/schemas';
import {
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  Platform,
} from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { buildClusterGraph } from './cluster-graph';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(id: string): GraphNode {
  return {
    id,
    name: id,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
  };
}

function makeCluster(id: string, nodeIds: string[]): Cluster {
  return {
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes: nodeIds.map(makeNode),
    anchors: [],
    metadata: new Map(),
  };
}

function edge(source: string, target: string): GraphEdge {
  return { source, target };
}

// ---------------------------------------------------------------------------
// buildClusterGraph
// ---------------------------------------------------------------------------

describe('buildClusterGraph', () => {
  it('builds nodeToCluster mapping correctly', () => {
    const clusters = [makeCluster('A', ['a1', 'a2']), makeCluster('B', ['b1'])];
    const result = buildClusterGraph([], clusters);

    expect(result.nodeToCluster.get('a1')).toBe('A');
    expect(result.nodeToCluster.get('a2')).toBe('A');
    expect(result.nodeToCluster.get('b1')).toBe('B');
  });

  it('skips edges where source node has no cluster', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const edges: GraphEdge[] = [edge('unknown', 'b1')];
    const result = buildClusterGraph(edges, clusters);
    expect(result.edges).toHaveLength(0);
  });

  it('skips edges where target node has no cluster', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const edges: GraphEdge[] = [edge('a1', 'unknown')];
    const result = buildClusterGraph(edges, clusters);
    expect(result.edges).toHaveLength(0);
  });

  it('skips edges where source and target are in the same cluster', () => {
    const clusters = [makeCluster('A', ['a1', 'a2'])];
    const edges: GraphEdge[] = [edge('a1', 'a2')];
    const result = buildClusterGraph(edges, clusters);
    expect(result.edges).toHaveLength(0);
  });

  it('creates a cluster edge for cross-cluster edges', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const edges: GraphEdge[] = [edge('a1', 'b1')];
    const result = buildClusterGraph(edges, clusters);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]?.source).toBe('A');
    expect(result.edges[0]?.target).toBe('B');
    expect(result.edges[0]?.weight).toBe(1);
  });

  it('aggregates multiple edges between same cluster pair', () => {
    const clusters = [makeCluster('A', ['a1', 'a2']), makeCluster('B', ['b1', 'b2'])];
    const edges: GraphEdge[] = [edge('a1', 'b1'), edge('a2', 'b2'), edge('a1', 'b2')];
    const result = buildClusterGraph(edges, clusters);

    // All 3 edges go A->B
    const abEdge = result.edges.find((e) => e.source === 'A' && e.target === 'B');
    expect(abEdge?.weight).toBe(3);
  });

  it('computes tieStrength as sum of forward and reverse weights', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const edges: GraphEdge[] = [
      edge('a1', 'b1'), // A->B weight 1
      edge('b1', 'a1'), // B->A weight 1
    ];
    const result = buildClusterGraph(edges, clusters);

    // Both directions exist
    expect(result.edges).toHaveLength(2);
    const abEdge = result.edges.find((e) => e.source === 'A' && e.target === 'B');
    const baEdge = result.edges.find((e) => e.source === 'B' && e.target === 'A');

    // Each edge's tieStrength = own weight + reverse weight
    expect(abEdge?.tieStrength).toBe(2); // 1 + 1
    expect(baEdge?.tieStrength).toBe(2); // 1 + 1
  });

  it('tieStrength equals weight when no reverse edges exist', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const edges: GraphEdge[] = [edge('a1', 'b1')];
    const result = buildClusterGraph(edges, clusters);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]?.weight).toBe(1);
    expect(result.edges[0]?.tieStrength).toBe(1); // 1 + 0
  });

  it('returns the clusters as nodes in the result', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1'])];
    const result = buildClusterGraph([], clusters);
    expect(result.nodes).toBe(clusters);
  });

  it('handles empty edges and clusters', () => {
    const result = buildClusterGraph([], []);
    expect(result.edges).toHaveLength(0);
    expect(result.nodes).toHaveLength(0);
    expect(result.nodeToCluster.size).toBe(0);
  });

  it('handles three clusters with multiple inter-cluster edges', () => {
    const clusters = [makeCluster('A', ['a1']), makeCluster('B', ['b1']), makeCluster('C', ['c1'])];
    const edges: GraphEdge[] = [edge('a1', 'b1'), edge('b1', 'c1'), edge('a1', 'c1')];
    const result = buildClusterGraph(edges, clusters);

    expect(result.edges).toHaveLength(3);
    expect(result.edges.some((e) => e.source === 'A' && e.target === 'B')).toBe(true);
    expect(result.edges.some((e) => e.source === 'B' && e.target === 'C')).toBe(true);
    expect(result.edges.some((e) => e.source === 'A' && e.target === 'C')).toBe(true);
  });
});

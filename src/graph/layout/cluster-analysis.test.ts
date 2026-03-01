import { type Cluster, ClusterType, NodeRole } from '@shared/schemas';
import {
  type GraphEdge,
  type GraphNode,
  NodeType,
  Origin,
  Platform,
} from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { analyzeCluster, assignLayers, determineRole, identifyAnchors } from './cluster-analysis';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(overrides: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    name: overrides.id,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    ...overrides,
  };
}

function makeCluster(nodes: GraphNode[], id = 'cluster-1'): Cluster {
  return {
    id,
    name: id,
    type: ClusterType.Project,
    origin: Origin.Local,
    nodes,
    anchors: [],
    metadata: new Map(),
  };
}

function edge(source: string, target: string): GraphEdge {
  return { source, target };
}

// ---------------------------------------------------------------------------
// determineRole
// ---------------------------------------------------------------------------

describe('determineRole', () => {
  it('returns Test when isTest is true', () => {
    const node = makeNode({ id: 'a', type: NodeType.Framework });
    expect(determineRole(node, true, false, 5)).toBe(NodeRole.Test);
  });

  it('returns Entry when isAnchor is true (and not test)', () => {
    const node = makeNode({ id: 'a', type: NodeType.App });
    expect(determineRole(node, false, true, 0)).toBe(NodeRole.Entry);
  });

  it('returns Tool for Cli nodes', () => {
    const node = makeNode({ id: 'a', type: NodeType.Cli });
    expect(determineRole(node, false, false, 0)).toBe(NodeRole.Tool);
  });

  it('returns InternalFramework for Framework type', () => {
    const node = makeNode({ id: 'a', type: NodeType.Framework });
    expect(determineRole(node, false, false, 0)).toBe(NodeRole.InternalFramework);
  });

  it('returns InternalFramework for Package type', () => {
    const node = makeNode({ id: 'a', type: NodeType.Package });
    expect(determineRole(node, false, false, 0)).toBe(NodeRole.InternalFramework);
  });

  it('returns InternalLib for Library with >= 2 dependents', () => {
    const node = makeNode({ id: 'a', type: NodeType.Library });
    expect(determineRole(node, false, false, 2)).toBe(NodeRole.InternalLib);
    expect(determineRole(node, false, false, 5)).toBe(NodeRole.InternalLib);
  });

  it('returns Utility for Library with < 2 dependents', () => {
    const node = makeNode({ id: 'a', type: NodeType.Library });
    expect(determineRole(node, false, false, 0)).toBe(NodeRole.Utility);
    expect(determineRole(node, false, false, 1)).toBe(NodeRole.Utility);
  });

  it('returns Utility for App type when not anchor and not test', () => {
    const node = makeNode({ id: 'a', type: NodeType.App });
    expect(determineRole(node, false, false, 0)).toBe(NodeRole.Utility);
  });

  it('prioritises Test over Entry', () => {
    const node = makeNode({ id: 'a', type: NodeType.TestUnit });
    expect(determineRole(node, true, true, 10)).toBe(NodeRole.Test);
  });
});

// ---------------------------------------------------------------------------
// identifyAnchors
// ---------------------------------------------------------------------------

describe('identifyAnchors', () => {
  it('returns App nodes when present', () => {
    const app = makeNode({ id: 'app1', type: NodeType.App });
    const lib = makeNode({ id: 'lib1', type: NodeType.Library });
    const anchors = identifyAnchors(
      [app, lib],
      new Map([
        ['app1', new Set<string>()],
        ['lib1', new Set(['x'])],
      ]),
      new Map(),
    );
    expect(anchors).toEqual([app]);
  });

  it('returns Cli nodes when no apps', () => {
    const cli = makeNode({ id: 'cli1', type: NodeType.Cli });
    const lib = makeNode({ id: 'lib1', type: NodeType.Library });
    const anchors = identifyAnchors(
      [cli, lib],
      new Map([
        ['cli1', new Set<string>()],
        ['lib1', new Set<string>()],
      ]),
      new Map(),
    );
    expect(anchors).toEqual([cli]);
  });

  it('returns framework with most external dependents when no apps/clis', () => {
    const fw1 = makeNode({ id: 'fw1', type: NodeType.Framework });
    const fw2 = makeNode({ id: 'fw2', type: NodeType.Framework });
    const anchors = identifyAnchors(
      [fw1, fw2],
      new Map([
        ['fw1', new Set<string>()],
        ['fw2', new Set<string>()],
      ]),
      new Map([
        ['fw1', 1],
        ['fw2', 3],
      ]),
    );
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.id).toBe('fw2');
  });

  it('falls back to most-depended-upon node', () => {
    const lib1 = makeNode({ id: 'lib1', type: NodeType.Library });
    const lib2 = makeNode({ id: 'lib2', type: NodeType.Library });
    const anchors = identifyAnchors(
      [lib1, lib2],
      new Map([
        ['lib1', new Set(['x', 'y'])],
        ['lib2', new Set(['x'])],
      ]),
      new Map(),
    );
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.id).toBe('lib1');
  });

  it('returns empty array for empty input', () => {
    expect(identifyAnchors([], new Map(), new Map())).toEqual([]);
  });

  it('includes Library type in external entry points check (not just Framework)', () => {
    const lib = makeNode({ id: 'lib1', type: NodeType.Library });
    const anchors = identifyAnchors(
      [lib],
      new Map([['lib1', new Set<string>()]]),
      new Map([['lib1', 5]]),
    );
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.id).toBe('lib1');
  });
});

// ---------------------------------------------------------------------------
// assignLayers
// ---------------------------------------------------------------------------

describe('assignLayers', () => {
  it('assigns layer 0 to anchors', () => {
    const anchor = makeNode({ id: 'anchor' });
    const layers = assignLayers([anchor], [anchor], new Map(), new Set());
    expect(layers.get('anchor')).toBe(0);
  });

  it('assigns layers > 0 to non-anchor nodes', () => {
    const anchor = makeNode({ id: 'anchor' });
    const other1 = makeNode({ id: 'other1' });
    const other2 = makeNode({ id: 'other2' });
    const deps = new Map<string, Set<string>>([
      ['anchor', new Set(['other1'])],
      ['other1', new Set(['other2'])],
      ['other2', new Set()],
    ]);
    const layers = assignLayers([anchor, other1, other2], [anchor], deps, new Set());
    expect(layers.get('anchor')).toBe(0);
    expect(layers.has('other1')).toBe(true);
    expect(layers.has('other2')).toBe(true);
  });

  it('excludes test nodes from layer assignment', () => {
    const anchor = makeNode({ id: 'anchor' });
    const test = makeNode({ id: 'test1', type: NodeType.TestUnit });
    const testNodes = new Set(['test1']);
    const layers = assignLayers([anchor, test], [anchor], new Map(), testNodes);
    expect(layers.has('test1')).toBe(false);
  });

  it('handles empty node list', () => {
    const layers = assignLayers([], [], new Map(), new Set());
    expect(layers.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// analyzeCluster (integration)
// ---------------------------------------------------------------------------

describe('analyzeCluster', () => {
  it('populates anchors, metadata, roles, and layers', () => {
    const app = makeNode({ id: 'app1', type: NodeType.App });
    const fw = makeNode({ id: 'fw1', type: NodeType.Framework });
    const test = makeNode({ id: 'test1', type: NodeType.TestUnit });
    const cluster = makeCluster([app, fw, test]);

    const edges: GraphEdge[] = [edge('app1', 'fw1'), edge('test1', 'app1')];

    analyzeCluster(cluster, edges);

    // Anchors should contain the app
    expect(cluster.anchors).toContain('app1');

    // Metadata should be set for every node
    expect(cluster.metadata.size).toBe(3);

    // App is anchor → Entry role
    expect(cluster.metadata.get('app1')?.role).toBe(NodeRole.Entry);
    expect(cluster.metadata.get('app1')?.isAnchor).toBe(true);

    // Framework → InternalFramework
    expect(cluster.metadata.get('fw1')?.role).toBe(NodeRole.InternalFramework);

    // Test → Test role, layer -1
    expect(cluster.metadata.get('test1')?.role).toBe(NodeRole.Test);
    expect(cluster.metadata.get('test1')?.layer).toBe(-1);
  });

  it('records external dependents correctly', () => {
    const fw = makeNode({ id: 'fw1', type: NodeType.Framework });
    const cluster = makeCluster([fw]);

    // Edge from an external node (not in cluster) to fw1
    const edges: GraphEdge[] = [edge('external-node', 'fw1')];

    analyzeCluster(cluster, edges);
    expect(cluster.metadata.get('fw1')?.hasExternalDependents).toBe(true);
  });

  it('tracks test subjects', () => {
    const fw = makeNode({ id: 'fw1', type: NodeType.Framework });
    const test = makeNode({ id: 'test1', type: NodeType.TestUnit });
    const cluster = makeCluster([fw, test]);

    // test1 depends on fw1
    const edges: GraphEdge[] = [edge('test1', 'fw1')];

    analyzeCluster(cluster, edges);
    expect(cluster.metadata.get('test1')?.testSubjects).toEqual(['fw1']);
  });

  it('handles cluster with no internal edges', () => {
    const n1 = makeNode({ id: 'n1' });
    const n2 = makeNode({ id: 'n2' });
    const cluster = makeCluster([n1, n2]);

    analyzeCluster(cluster, []);

    expect(cluster.metadata.size).toBe(2);
    expect(cluster.anchors.length).toBeGreaterThanOrEqual(1);
  });

  it('does not treat test-to-test edges as subjects', () => {
    const t1 = makeNode({ id: 't1', type: NodeType.TestUnit });
    const t2 = makeNode({ id: 't2', type: NodeType.TestUi });
    const cluster = makeCluster([t1, t2]);

    const edges: GraphEdge[] = [edge('t1', 't2')];

    analyzeCluster(cluster, edges);
    // t1 depends on t2, but t2 is also a test → not a subject
    expect(cluster.metadata.get('t1')?.testSubjects).toBeUndefined();
  });
});

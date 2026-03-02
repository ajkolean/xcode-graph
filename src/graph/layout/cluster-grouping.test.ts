import { ClusterType, DEFAULT_CLUSTER_CONFIG } from '@shared/schemas';
import { Origin } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { createNode, createProjectGraph } from '../../fixtures';
import { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';

describe('groupIntoClusters', () => {
  it('should group nodes by project', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    const clusterIds = clusters.map((c) => c.id);
    expect(clusterIds).toContain('Core');
    expect(clusterIds).toContain('App');
    expect(clusterIds).toContain('Features');
  });

  it('should group external packages by name', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    const packageClusters = clusters.filter((c) => c.type === ClusterType.Package);
    const packageNames = packageClusters.map((c) => c.name);
    expect(packageNames).toContain('Alamofire');
    expect(packageNames).toContain('Kingfisher');
  });

  it('should assign correct cluster types', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    const corecluster = clusters.find((c) => c.id === 'Core');
    expect(corecluster?.type).toBe(ClusterType.Project);

    const alamofireCluster = clusters.find((c) => c.id === 'Alamofire');
    expect(alamofireCluster?.type).toBe(ClusterType.Package);
  });

  it('should assign origin from first node in cluster', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    const coreCluster = clusters.find((c) => c.id === 'Core');
    expect(coreCluster?.origin).toBe(Origin.Local);

    const alamofireCluster = clusters.find((c) => c.id === 'Alamofire');
    expect(alamofireCluster?.origin).toBe(Origin.External);
  });

  it('should include all nodes in their respective clusters', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    const totalNodesInClusters = clusters.reduce((sum, c) => sum + c.nodes.length, 0);
    expect(totalNodesInClusters).toBe(nodes.length);
  });

  it('should use node name as cluster ID when no project', () => {
    const nodes = [
      createNode({ id: 'A', name: 'StandaloneModule' }),
      createNode({ id: 'B', name: 'AnotherModule' }),
    ];

    const clusters = groupIntoClusters(nodes, []);

    expect(clusters).toHaveLength(2);
    const clusterIds = clusters.map((c) => c.id);
    expect(clusterIds).toContain('StandaloneModule');
    expect(clusterIds).toContain('AnotherModule');
  });

  it('should handle empty graph', () => {
    const clusters = groupIntoClusters([], []);

    expect(clusters).toHaveLength(0);
  });

  it('should initialize metadata and anchors', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    for (const cluster of clusters) {
      expect(cluster.metadata).toBeInstanceOf(Map);
      expect(Array.isArray(cluster.anchors)).toBe(true);
    }
  });

  it('should populate metadata for each node via analyzeCluster', () => {
    const { nodes, edges } = createProjectGraph();

    const clusters = groupIntoClusters(nodes, edges);

    for (const cluster of clusters) {
      for (const node of cluster.nodes) {
        expect(cluster.metadata.has(node.id)).toBe(true);
        const meta = cluster.metadata.get(node.id);
        expect(meta).toBeDefined();
        expect(meta).toHaveProperty('role');
        expect(meta).toHaveProperty('layer');
        expect(meta).toHaveProperty('isAnchor');
      }
    }
  });

  it('should group nodes with same project into one cluster', () => {
    const nodes = [
      createNode({ id: 'A', name: 'ModuleA', project: 'SharedProject' }),
      createNode({ id: 'B', name: 'ModuleB', project: 'SharedProject' }),
      createNode({ id: 'C', name: 'ModuleC', project: 'SharedProject' }),
    ];

    const clusters = groupIntoClusters(nodes, []);

    expect(clusters).toHaveLength(1);
    const first = clusters[0];
    expect(first).toBeDefined();
    expect(first?.nodes).toHaveLength(3);
    expect(first?.id).toBe('SharedProject');
  });

  it('should set path from first available node path', () => {
    const nodes = [
      createNode({ id: 'A', name: 'ModuleA', project: 'MyProject', path: '/path/to/project' }),
      createNode({ id: 'B', name: 'ModuleB', project: 'MyProject' }),
    ];

    const clusters = groupIntoClusters(nodes, []);

    expect(clusters[0]?.path).toBe('/path/to/project');
  });

  it('should backfill cluster path from later node when first node has no path', () => {
    const nodes = [
      createNode({ id: 'A', name: 'ModuleA', project: 'MyProject' }),
      createNode({ id: 'B', name: 'ModuleB', project: 'MyProject', path: '/later/path' }),
    ];

    const clusters = groupIntoClusters(nodes, []);

    expect(clusters[0]?.path).toBe('/later/path');
  });
});

describe('arrangeClusterGrid', () => {
  function makeCluster(
    id: string,
    origin: Origin,
    nodeCount: number,
    bounds?: { x: number; y: number; width: number; height: number },
  ) {
    return {
      id,
      name: id,
      type: origin === Origin.External ? ClusterType.Package : ClusterType.Project,
      origin,
      nodes: Array.from({ length: nodeCount }, (_, i) =>
        createNode({ id: `${id}-n${i}`, name: `${id}-n${i}` }),
      ),
      anchors: [] as string[],
      metadata: new Map(),
      bounds,
    };
  }

  it('should return a position for each cluster', () => {
    const clusters = [makeCluster('A', Origin.Local, 3), makeCluster('B', Origin.Local, 2)];

    const positions = arrangeClusterGrid(clusters);

    expect(positions.size).toBe(2);
    expect(positions.has('A')).toBe(true);
    expect(positions.has('B')).toBe(true);
  });

  it('should return empty map for no clusters', () => {
    const positions = arrangeClusterGrid([]);
    expect(positions.size).toBe(0);
  });

  it('should sort local clusters before external', () => {
    const clusters = [
      makeCluster('Ext', Origin.External, 2),
      makeCluster('Local', Origin.Local, 2),
    ];

    const positions = arrangeClusterGrid(clusters);

    const localPos = positions.get('Local');
    const extPos = positions.get('Ext');
    expect(localPos).toBeDefined();
    expect(extPos).toBeDefined();
    // Local should come first (smaller position)
    if (localPos && extPos) {
      const localOrder = localPos.y * 10000 + localPos.x;
      const extOrder = extPos.y * 10000 + extPos.x;
      expect(localOrder).toBeLessThanOrEqual(extOrder);
    }
  });

  it('should sort larger clusters before smaller within same origin', () => {
    const clusters = [makeCluster('Small', Origin.Local, 1), makeCluster('Big', Origin.Local, 10)];

    const positions = arrangeClusterGrid(clusters);

    const bigPos = positions.get('Big');
    const smallPos = positions.get('Small');
    expect(bigPos).toBeDefined();
    expect(smallPos).toBeDefined();
    // Big should come first
    if (bigPos && smallPos) {
      const bigOrder = bigPos.y * 10000 + bigPos.x;
      const smallOrder = smallPos.y * 10000 + smallPos.x;
      expect(bigOrder).toBeLessThanOrEqual(smallOrder);
    }
  });

  it('should use cluster bounds when available', () => {
    const clusters = [
      makeCluster('A', Origin.Local, 2, { x: 0, y: 0, width: 500, height: 400 }),
      makeCluster('B', Origin.Local, 2, { x: 0, y: 0, width: 200, height: 150 }),
    ];

    const positions = arrangeClusterGrid(clusters);

    // Both should have positions
    expect(positions.get('A')).toBeDefined();
    expect(positions.get('B')).toBeDefined();
  });

  it('should use default bounds when cluster has no bounds', () => {
    const clusters = [makeCluster('A', Origin.Local, 2)];

    const positions = arrangeClusterGrid(clusters);

    // Should still produce a valid position using default 300x300
    const pos = positions.get('A');
    expect(pos).toBeDefined();
    expect(pos?.x).toBe(0);
    expect(pos?.y).toBe(0);
  });

  it('should wrap to next row when columns exceed grid size', () => {
    const clusters = [
      makeCluster('A', Origin.Local, 3),
      makeCluster('B', Origin.Local, 3),
      makeCluster('C', Origin.Local, 3),
      makeCluster('D', Origin.Local, 3),
      makeCluster('E', Origin.Local, 3),
    ];

    const positions = arrangeClusterGrid(clusters);

    // 5 clusters -> ceil(sqrt(5)) = 3 columns
    // So should have at least 2 different y values
    const yValues = new Set([...positions.values()].map((p) => p.y));
    expect(yValues.size).toBeGreaterThanOrEqual(2);
  });

  it('should accept custom config for spacing', () => {
    const clusters = [
      makeCluster('A', Origin.Local, 2, { x: 0, y: 0, width: 100, height: 100 }),
      makeCluster('B', Origin.Local, 2, { x: 0, y: 0, width: 100, height: 100 }),
    ];

    const config = { ...DEFAULT_CLUSTER_CONFIG, clusterSpacing: 200 };
    const positions = arrangeClusterGrid(clusters, config);

    const posA = positions.get('A');
    const posB = positions.get('B');
    expect(posA).toBeDefined();
    expect(posB).toBeDefined();
    // With 2 clusters, cols = ceil(sqrt(2)) = 2, so both on same row
    // B.x should be A.x + width + spacing = 0 + 100 + 200 = 300
    if (posA && posB) {
      expect(posB.x).toBe(300);
    }
  });
});

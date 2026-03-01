import { ClusterType } from '@shared/schemas';
import { Origin } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { createNode, createProjectGraph } from '../../fixtures';
import { groupIntoClusters } from './cluster-grouping';

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
});

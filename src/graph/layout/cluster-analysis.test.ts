import { type Cluster, ClusterType } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.schema';
import { describe, expect, it } from 'vitest';
import { createNode } from '@/fixtures';
import { analyzeCluster, assignLayers, determineRole, identifyAnchors } from './cluster-analysis';

describe('clusterAnalysis', () => {
  describe('identifyAnchors', () => {
    it('should prioritize app nodes as anchors', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app1', name: 'MyApp', type: NodeType.App }),
        createNode({ id: 'lib1', name: 'MyLib', type: NodeType.Library }),
        createNode({ id: 'fw1', name: 'MyFramework', type: NodeType.Framework }),
      ];
      const dependents = new Map<string, Set<string>>([
        ['app1', new Set()],
        ['lib1', new Set(['app1'])],
        ['fw1', new Set(['app1', 'lib1'])],
      ]);
      const externalDependents = new Map<string, number>();

      const anchors = identifyAnchors(nodes, dependents, externalDependents);

      expect(anchors.length).toBe(1);
      expect(anchors[0].id).toBe('app1');
    });

    it('should prioritize CLI nodes when no apps', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'cli1', name: 'MyCLI', type: NodeType.Cli }),
        createNode({ id: 'lib1', name: 'MyLib', type: NodeType.Library }),
      ];
      const dependents = new Map<string, Set<string>>([
        ['cli1', new Set()],
        ['lib1', new Set(['cli1'])],
      ]);
      const externalDependents = new Map<string, number>();

      const anchors = identifyAnchors(nodes, dependents, externalDependents);

      expect(anchors.length).toBe(1);
      expect(anchors[0].id).toBe('cli1');
    });

    it('should use framework with external dependents when no apps/CLIs', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'fw1', name: 'PublicFramework', type: NodeType.Framework }),
        createNode({ id: 'fw2', name: 'InternalFramework', type: NodeType.Framework }),
        createNode({ id: 'lib1', name: 'MyLib', type: NodeType.Library }),
      ];
      const dependents = new Map<string, Set<string>>([
        ['fw1', new Set()],
        ['fw2', new Set()],
        ['lib1', new Set()],
      ]);
      const externalDependents = new Map<string, number>([
        ['fw1', 5],
        ['fw2', 0],
        ['lib1', 0],
      ]);

      const anchors = identifyAnchors(nodes, dependents, externalDependents);

      expect(anchors.length).toBe(1);
      expect(anchors[0].id).toBe('fw1');
    });

    it('should fall back to most depended-upon node', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'lib1', name: 'Lib1', type: NodeType.Library }),
        createNode({ id: 'lib2', name: 'Lib2', type: NodeType.Library }),
        createNode({ id: 'lib3', name: 'Lib3', type: NodeType.Library }),
      ];
      const dependents = new Map<string, Set<string>>([
        ['lib1', new Set(['lib2', 'lib3'])],
        ['lib2', new Set()],
        ['lib3', new Set()],
      ]);
      const externalDependents = new Map<string, number>();

      const anchors = identifyAnchors(nodes, dependents, externalDependents);

      expect(anchors.length).toBe(1);
      expect(anchors[0].id).toBe('lib1');
    });

    it('should return empty array for empty nodes', () => {
      const anchors = identifyAnchors([], new Map(), new Map());

      expect(anchors).toEqual([]);
    });

    it('should return all apps when multiple apps exist', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app1', name: 'App1', type: NodeType.App }),
        createNode({ id: 'app2', name: 'App2', type: NodeType.App }),
      ];
      const dependents = new Map<string, Set<string>>([
        ['app1', new Set()],
        ['app2', new Set()],
      ]);
      const externalDependents = new Map<string, number>();

      const anchors = identifyAnchors(nodes, dependents, externalDependents);

      expect(anchors.length).toBe(2);
    });
  });

  describe('assignLayers', () => {
    it('should assign layer 0 to anchors', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'anchor', name: 'Anchor', type: NodeType.App }),
        createNode({ id: 'dep1', name: 'Dep1', type: NodeType.Library }),
      ];
      const anchors = [nodes[0]];
      const dependencies = new Map<string, Set<string>>([
        ['anchor', new Set(['dep1'])],
        ['dep1', new Set()],
      ]);

      const layers = assignLayers(nodes, anchors, dependencies, new Set());

      expect(layers.get('anchor')).toBe(0);
    });

    it('should assign higher layers to non-anchors', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'anchor', name: 'Anchor', type: NodeType.App }),
        createNode({ id: 'dep1', name: 'Dep1', type: NodeType.Library }),
        createNode({ id: 'dep2', name: 'Dep2', type: NodeType.Library }),
      ];
      const anchors = [nodes[0]];
      const dependencies = new Map<string, Set<string>>([
        ['anchor', new Set(['dep1'])],
        ['dep1', new Set(['dep2'])],
        ['dep2', new Set()],
      ]);

      const layers = assignLayers(nodes, anchors, dependencies, new Set());

      expect(layers.get('anchor')).toBe(0);
      expect(layers.get('dep1')).toBeGreaterThanOrEqual(1);
      expect(layers.get('dep2')).toBeGreaterThanOrEqual(1);
    });

    it('should exclude test nodes from layer assignment', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'anchor', name: 'Anchor', type: NodeType.App }),
        createNode({ id: 'test1', name: 'Test1', type: NodeType.TestUnit }),
      ];
      const anchors = [nodes[0]];
      const testNodes = new Set(['test1']);
      const dependencies = new Map<string, Set<string>>([
        ['anchor', new Set()],
        ['test1', new Set(['anchor'])],
      ]);

      const layers = assignLayers(nodes, anchors, dependencies, testNodes);

      expect(layers.has('test1')).toBe(false);
    });

    it('should handle empty nodes array', () => {
      const layers = assignLayers([], [], new Map(), new Set());

      expect(layers.size).toBe(0);
    });
  });

  describe('determineRole', () => {
    it('should return test for test nodes', () => {
      const node = createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit });
      const role = determineRole(node, true, false, 0);

      expect(role).toBe('test');
    });

    it('should return entry for anchor nodes', () => {
      const node = createNode({ id: 'app', name: 'App', type: NodeType.App });
      const role = determineRole(node, false, true, 0);

      expect(role).toBe('entry');
    });

    it('should return tool for CLI nodes', () => {
      const node = createNode({ id: 'cli', name: 'CLI', type: NodeType.Cli });
      const role = determineRole(node, false, false, 0);

      expect(role).toBe('tool');
    });

    it('should return internal-framework for framework nodes', () => {
      const node = createNode({ id: 'fw', name: 'Framework', type: NodeType.Framework });
      const role = determineRole(node, false, false, 0);

      expect(role).toBe('internal-framework');
    });

    it('should return internal-framework for package nodes', () => {
      const node = createNode({ id: 'pkg', name: 'Package', type: NodeType.Package });
      const role = determineRole(node, false, false, 0);

      expect(role).toBe('internal-framework');
    });

    it('should return internal-lib for library with 2+ dependents', () => {
      const node = createNode({ id: 'lib', name: 'Library', type: NodeType.Library });
      const role = determineRole(node, false, false, 2);

      expect(role).toBe('internal-lib');
    });

    it('should return utility for library with less than 2 dependents', () => {
      const node = createNode({ id: 'lib', name: 'Library', type: NodeType.Library });
      const role = determineRole(node, false, false, 1);

      expect(role).toBe('utility');
    });

    it('should return utility for unknown types', () => {
      // biome-ignore lint/suspicious/noExplicitAny: Testing with invalid type intentionally
      const node = createNode({ id: 'unknown', name: 'Unknown', type: 'unknown' as any });
      const role = determineRole(node, false, false, 0);

      expect(role).toBe('utility');
    });

    it('should prioritize test over anchor', () => {
      const node = createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit });
      const role = determineRole(node, true, true, 0);

      expect(role).toBe('test');
    });

    it('should prioritize anchor over type-based role', () => {
      const node = createNode({ id: 'lib', name: 'Library', type: NodeType.Library });
      const role = determineRole(node, false, true, 5);

      expect(role).toBe('entry');
    });
  });

  describe('analyzeCluster', () => {
    const createCluster = (nodes: GraphNode[]): Cluster => ({
      id: 'test-cluster',
      name: 'TestCluster',
      type: ClusterType.Project,
      origin: Origin.Local,
      nodes,
      metadata: new Map(),
      anchors: [],
    });

    it('should identify anchors and populate metadata', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App }),
        createNode({ id: 'lib', name: 'Lib', type: NodeType.Library }),
      ];
      const edges: GraphEdge[] = [{ source: 'app', target: 'lib' }];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      expect(cluster.anchors).toContain('app');
      expect(cluster.metadata.size).toBe(2);
    });

    it('should assign roles to all nodes', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App }),
        createNode({ id: 'fw', name: 'Framework', type: NodeType.Framework }),
        createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit }),
      ];
      const edges: GraphEdge[] = [
        { source: 'app', target: 'fw' },
        { source: 'test', target: 'app' },
      ];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      expect(cluster.metadata.get('app')?.role).toBe('entry');
      expect(cluster.metadata.get('fw')?.role).toBe('internal-framework');
      expect(cluster.metadata.get('test')?.role).toBe('test');
    });

    it('should assign layer -1 to test nodes', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App }),
        createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit }),
      ];
      const edges: GraphEdge[] = [{ source: 'test', target: 'app' }];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      expect(cluster.metadata.get('test')?.layer).toBe(-1);
    });

    it('should identify test subjects', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App }),
        createNode({ id: 'lib', name: 'Lib', type: NodeType.Library }),
        createNode({ id: 'test', name: 'Test', type: NodeType.TestUnit }),
      ];
      const edges: GraphEdge[] = [
        { source: 'app', target: 'lib' },
        { source: 'test', target: 'app' },
        { source: 'test', target: 'lib' },
      ];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      const testMeta = cluster.metadata.get('test');
      expect(testMeta?.testSubjects).toContain('app');
      expect(testMeta?.testSubjects).toContain('lib');
    });

    it('should track external dependents', () => {
      const nodes: GraphNode[] = [createNode({ id: 'lib', name: 'Lib', type: NodeType.Library })];
      const edges: GraphEdge[] = [
        { source: 'external1', target: 'lib' },
        { source: 'external2', target: 'lib' },
      ];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      expect(cluster.metadata.get('lib')?.hasExternalDependents).toBe(true);
    });

    it('should count dependencies correctly', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'app', name: 'App', type: NodeType.App }),
        createNode({ id: 'lib1', name: 'Lib1', type: NodeType.Library }),
        createNode({ id: 'lib2', name: 'Lib2', type: NodeType.Library }),
      ];
      const edges: GraphEdge[] = [
        { source: 'app', target: 'lib1' },
        { source: 'app', target: 'lib2' },
      ];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      expect(cluster.metadata.get('app')?.dependsOnCount).toBe(2);
      expect(cluster.metadata.get('lib1')?.dependencyCount).toBe(1);
    });

    it('should handle empty cluster', () => {
      const cluster = createCluster([]);
      const edges: GraphEdge[] = [];

      analyzeCluster(cluster, edges);

      expect(cluster.anchors).toEqual([]);
      expect(cluster.metadata.size).toBe(0);
    });

    it('should only consider internal edges for dependencies', () => {
      const nodes: GraphNode[] = [createNode({ id: 'lib', name: 'Lib', type: NodeType.Library })];
      const edges: GraphEdge[] = [
        { source: 'lib', target: 'external' },
        { source: 'other-external', target: 'lib' },
      ];
      const cluster = createCluster(nodes);

      analyzeCluster(cluster, edges);

      // Should only count internal edges, not external ones
      expect(cluster.metadata.get('lib')?.dependsOnCount).toBe(0);
    });
  });
});

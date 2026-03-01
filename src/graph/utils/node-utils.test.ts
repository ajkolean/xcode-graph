import type { FilterState } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import {
  createDiamondGraph,
  createLinearChain,
  createNode,
  createNodesForFilterTesting,
  createProjectGraph,
} from '../../fixtures';
import { computeClusterStats, computeFilters, computeNodeDependencies } from './node-utils';

describe('computeNodeDependencies', () => {
  it('should return empty results for null node', () => {
    const { nodes, edges } = createLinearChain(3);
    const result = computeNodeDependencies(null, nodes, edges);

    expect(result.dependencies).toHaveLength(0);
    expect(result.dependents).toHaveLength(0);
    expect(result.metrics.dependencyCount).toBe(0);
    expect(result.metrics.dependentCount).toBe(0);
    expect(result.metrics.totalConnections).toBe(0);
  });

  it('should compute direct dependencies', () => {
    const { nodes, edges } = createDiamondGraph();
    const nodeA = nodes.find((n) => n.id === 'A');
    expect(nodeA).toBeDefined();
    if (!nodeA) return;

    const result = computeNodeDependencies(nodeA, nodes, edges);

    expect(result.dependencies).toHaveLength(2);
    const depIds = result.dependencies.map((d) => d.node.id).sort();
    expect(depIds).toEqual(['B', 'C']);
  });

  it('should compute direct dependents', () => {
    const { nodes, edges } = createDiamondGraph();
    const nodeD = nodes.find((n) => n.id === 'D');
    expect(nodeD).toBeDefined();
    if (!nodeD) return;

    const result = computeNodeDependencies(nodeD, nodes, edges);

    expect(result.dependents).toHaveLength(2);
    const depIds = result.dependents.map((d) => d.node.id).sort();
    expect(depIds).toEqual(['B', 'C']);
  });

  it('should include edge info with each dependency', () => {
    const { nodes, edges } = createLinearChain(3);
    const nodeA = nodes.find((n) => n.id === 'A');
    if (!nodeA) throw new Error('Node A not found');

    const result = computeNodeDependencies(nodeA, nodes, edges);

    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies[0]?.edge.source).toBe('A');
    expect(result.dependencies[0]?.edge.target).toBe('B');
  });

  it('should compute transitive counts', () => {
    const { nodes, edges } = createLinearChain(4);
    const nodeA = nodes.find((n) => n.id === 'A');
    if (!nodeA) throw new Error('Node A not found');

    const result = computeNodeDependencies(nodeA, nodes, edges);

    // A -> B -> C -> D, so 3 transitive dependencies (excluding self)
    expect(result.metrics.transitiveDependencyCount).toBe(3);
    // A has no dependents
    expect(result.metrics.transitiveDependentCount).toBe(0);
  });

  it('should compute total counts from unfiltered edges', () => {
    const { nodes, edges } = createDiamondGraph();
    const nodeA = nodes.find((n) => n.id === 'A');
    if (!nodeA) throw new Error('Node A not found');
    // Only use one edge as filtered
    const filteredEdges: GraphEdge[] = [{ source: 'A', target: 'B' }];

    const result = computeNodeDependencies(nodeA, nodes, edges, filteredEdges);

    // Filtered: 1 dependency
    expect(result.metrics.dependencyCount).toBe(1);
    // Total: 2 dependencies
    expect(result.metrics.totalDependencyCount).toBe(2);
  });

  it('should flag high fan-in when dependents > 3', () => {
    const nodes = [
      createNode({ id: 'target', name: 'Target' }),
      createNode({ id: 'a', name: 'A' }),
      createNode({ id: 'b', name: 'B' }),
      createNode({ id: 'c', name: 'C' }),
      createNode({ id: 'd', name: 'D' }),
    ];
    const edges: GraphEdge[] = [
      { source: 'a', target: 'target' },
      { source: 'b', target: 'target' },
      { source: 'c', target: 'target' },
      { source: 'd', target: 'target' },
    ];

    const target = nodes[0];
    if (!target) throw new Error('Target node not found');
    const result = computeNodeDependencies(target, nodes, edges);

    expect(result.metrics.isHighFanIn).toBe(true);
    expect(result.metrics.dependentCount).toBe(4);
  });

  it('should flag high fan-out when dependencies > 3', () => {
    const nodes = [
      createNode({ id: 'source', name: 'Source' }),
      createNode({ id: 'a', name: 'A' }),
      createNode({ id: 'b', name: 'B' }),
      createNode({ id: 'c', name: 'C' }),
      createNode({ id: 'd', name: 'D' }),
    ];
    const edges: GraphEdge[] = [
      { source: 'source', target: 'a' },
      { source: 'source', target: 'b' },
      { source: 'source', target: 'c' },
      { source: 'source', target: 'd' },
    ];

    const source = nodes[0];
    if (!source) throw new Error('Source node not found');
    const result = computeNodeDependencies(source, nodes, edges);

    expect(result.metrics.isHighFanOut).toBe(true);
    expect(result.metrics.dependencyCount).toBe(4);
  });

  it('should compute totalConnections as sum of deps + dependents', () => {
    const { nodes, edges } = createDiamondGraph();
    const nodeB = nodes.find((n) => n.id === 'B');
    if (!nodeB) throw new Error('Node B not found');

    const result = computeNodeDependencies(nodeB, nodes, edges);

    // B has 1 dep (D) and 1 dependent (A)
    expect(result.metrics.totalConnections).toBe(
      result.metrics.dependencyCount + result.metrics.dependentCount,
    );
  });
});

describe('computeClusterStats', () => {
  it('should compute dependency counts for cluster nodes', () => {
    const { nodes, edges } = createProjectGraph();
    const coreNodes = nodes.filter((n) => n.project === 'Core');

    const stats = computeClusterStats(coreNodes, edges);

    expect(stats.totalDependencies).toBeGreaterThan(0);
    expect(stats.totalDependents).toBeGreaterThan(0);
  });

  it('should use filtered edges when provided', () => {
    const { nodes, edges } = createProjectGraph();
    const coreNodes = nodes.filter((n) => n.project === 'Core');
    const filteredEdges = edges.slice(0, 2);

    const stats = computeClusterStats(coreNodes, edges, filteredEdges);

    expect(stats.filteredDependencies).toBeLessThanOrEqual(stats.totalDependencies);
    expect(stats.filteredDependents).toBeLessThanOrEqual(stats.totalDependents);
  });

  it('should count all cluster nodes when no filtered edges', () => {
    const clusterNodes = [createNode({ id: 'A', name: 'A' }), createNode({ id: 'B', name: 'B' })];
    const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];

    const stats = computeClusterStats(clusterNodes, edges);

    expect(stats.filteredTargetsCount).toBe(2);
  });

  it('should count only nodes with edges when filtered edges provided', () => {
    const clusterNodes = [
      createNode({ id: 'A', name: 'A' }),
      createNode({ id: 'B', name: 'B' }),
      createNode({ id: 'C', name: 'C' }),
    ];
    const edges: GraphEdge[] = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ];
    const filteredEdges: GraphEdge[] = [{ source: 'A', target: 'B' }];

    const stats = computeClusterStats(clusterNodes, edges, filteredEdges);

    // Only A and B are involved in filtered edges
    expect(stats.filteredTargetsCount).toBe(2);
  });

  it('should collect platforms from cluster nodes', () => {
    const clusterNodes = [
      createNode({ id: 'A', name: 'A', platform: Platform.iOS }),
      createNode({ id: 'B', name: 'B', platform: Platform.macOS }),
      createNode({ id: 'C', name: 'C', platform: Platform.iOS }),
    ];

    const stats = computeClusterStats(clusterNodes, []);

    expect(stats.platforms.has('iOS')).toBe(true);
    expect(stats.platforms.has('macOS')).toBe(true);
    expect(stats.platforms.size).toBe(2);
  });

  it('should handle empty cluster', () => {
    const stats = computeClusterStats([], []);

    expect(stats.totalDependencies).toBe(0);
    expect(stats.totalDependents).toBe(0);
    expect(stats.filteredTargetsCount).toBe(0);
    expect(stats.platforms.size).toBe(0);
  });
});

describe('computeFilters', () => {
  it('should count node types', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    expect(result.typeCounts.get('app')).toBe(1);
    expect(result.typeCounts.get('framework')).toBe(1);
    expect(result.typeCounts.get('library')).toBe(1);
    expect(result.typeCounts.get('package')).toBe(2);
  });

  it('should count platforms', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    expect(result.platformCounts.get('iOS')).toBeGreaterThan(0);
    expect(result.platformCounts.get('macOS')).toBeGreaterThan(0);
  });

  it('should count projects (excluding packages)', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    expect(result.projectCounts.has('Main')).toBe(true);
    expect(result.projectCounts.has('Core')).toBe(true);
    expect(result.projectCounts.has('Tools')).toBe(true);
  });

  it('should count packages separately', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    expect(result.packageCounts.get('Package1')).toBe(1);
    expect(result.packageCounts.get('Package2')).toBe(1);
  });

  it('should detect active filters when fewer types selected', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    const allFilters: FilterState = {
      nodeTypes: new Set(result.typeCounts.keys()) as Set<NodeType>,
      platforms: new Set(result.platformCounts.keys()) as Set<Platform>,
      origins: new Set([Origin.Local, Origin.External]),
      projects: new Set(result.projectCounts.keys()),
      packages: new Set(result.packageCounts.keys()),
    };

    expect(result.hasActiveFilters(allFilters)).toBe(false);

    const filteredState: FilterState = {
      ...allFilters,
      nodeTypes: new Set([NodeType.App]),
    };

    expect(result.hasActiveFilters(filteredState)).toBe(true);
  });

  it('should create clear filters function that resets to all-inclusive', () => {
    const nodes = createNodesForFilterTesting();
    const result = computeFilters(nodes);

    let capturedFilters: FilterState | null = null;
    const clearFn = result.createClearFilters((filters) => {
      capturedFilters = filters;
    });

    clearFn();

    expect(capturedFilters).not.toBeNull();
    if (!capturedFilters) throw new Error('expected filters');
    expect(capturedFilters.nodeTypes.size).toBe(result.typeCounts.size);
    expect(capturedFilters.platforms.size).toBe(result.platformCounts.size);
    expect(capturedFilters.projects.size).toBe(result.projectCounts.size);
    expect(capturedFilters.packages.size).toBe(result.packageCounts.size);
  });

  it('should handle empty node list', () => {
    const result = computeFilters([]);

    expect(result.typeCounts.size).toBe(0);
    expect(result.platformCounts.size).toBe(0);
    expect(result.projectCounts.size).toBe(0);
    expect(result.packageCounts.size).toBe(0);
  });
});

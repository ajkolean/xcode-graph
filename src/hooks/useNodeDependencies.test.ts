import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { createDiamondGraph, createLinearChain, createNode } from '../test/fixtures';
import { useNodeDependencies } from './useNodeDependencies';

describe('useNodeDependencies', () => {
  describe('dependencies', () => {
    it('should return empty array for null node', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() => useNodeDependencies(null, nodes, graphEdges));

      expect(result.current.dependencies).toEqual([]);
    });

    it('should return direct dependencies', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() => useNodeDependencies(nodes[0], nodes, graphEdges));

      expect(result.current.dependencies).toHaveLength(1);
      expect(result.current.dependencies[0].id).toBe('B');
    });

    it('should return multiple dependencies', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[0], nodes, graphEdges), // Node A depends on B and C
      );

      expect(result.current.dependencies).toHaveLength(2);
      const depIds = result.current.dependencies.map((n) => n.id);
      expect(depIds).toContain('B');
      expect(depIds).toContain('C');
    });

    it('should return empty array for leaf node', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[3], nodes, graphEdges), // Node D has no dependencies
      );

      expect(result.current.dependencies).toHaveLength(0);
    });

    it('should use filtered edges when provided', () => {
      const { nodes, edges } = createDiamondGraph();
      const allEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));
      const filteredEdges: GraphEdge[] = [{ source: 'A', target: 'B' }]; // Only A->B

      const { result } = renderHook(() =>
        useNodeDependencies(nodes[0], nodes, allEdges, filteredEdges),
      );

      expect(result.current.dependencies).toHaveLength(1);
      expect(result.current.dependencies[0].id).toBe('B');
    });
  });

  describe('dependents', () => {
    it('should return empty array for null node', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() => useNodeDependencies(null, nodes, graphEdges));

      expect(result.current.dependents).toEqual([]);
    });

    it('should return direct dependents', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[1], nodes, graphEdges), // Node B
      );

      // Node A depends on B, so A is a dependent of B
      expect(result.current.dependents).toHaveLength(1);
      expect(result.current.dependents[0].id).toBe('A');
    });

    it('should return multiple dependents', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[3], nodes, graphEdges), // Node D has B and C as dependents
      );

      expect(result.current.dependents).toHaveLength(2);
      const depIds = result.current.dependents.map((n) => n.id);
      expect(depIds).toContain('B');
      expect(depIds).toContain('C');
    });

    it('should return empty array for root node', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[0], nodes, graphEdges), // Node A has no dependents
      );

      expect(result.current.dependents).toHaveLength(0);
    });
  });

  describe('metrics', () => {
    it('should calculate dependency count', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() => useNodeDependencies(nodes[0], nodes, graphEdges));

      expect(result.current.metrics.dependencyCount).toBe(2);
    });

    it('should calculate dependent count', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() => useNodeDependencies(nodes[3], nodes, graphEdges));

      expect(result.current.metrics.dependentCount).toBe(2);
    });

    it('should flag high fan-in correctly', () => {
      // Create node with high fan-in (>3)
      const centerNode = createNode({ id: 'center', name: 'Center' });
      const nodes: GraphNode[] = [
        centerNode,
        createNode({ id: 'a', name: 'A' }),
        createNode({ id: 'b', name: 'B' }),
        createNode({ id: 'c', name: 'C' }),
        createNode({ id: 'd', name: 'D' }),
      ];
      const edges: GraphEdge[] = [
        { source: 'a', target: 'center' },
        { source: 'b', target: 'center' },
        { source: 'c', target: 'center' },
        { source: 'd', target: 'center' },
      ];

      const { result } = renderHook(() => useNodeDependencies(centerNode, nodes, edges));

      expect(result.current.metrics.isHighFanIn).toBe(true);
    });

    it('should flag high fan-out correctly', () => {
      // Create node with high fan-out (>3)
      const rootNode = createNode({ id: 'root', name: 'Root' });
      const nodes: GraphNode[] = [
        rootNode,
        createNode({ id: 'a', name: 'A' }),
        createNode({ id: 'b', name: 'B' }),
        createNode({ id: 'c', name: 'C' }),
        createNode({ id: 'd', name: 'D' }),
      ];
      const edges: GraphEdge[] = [
        { source: 'root', target: 'a' },
        { source: 'root', target: 'b' },
        { source: 'root', target: 'c' },
        { source: 'root', target: 'd' },
      ];

      const { result } = renderHook(() => useNodeDependencies(rootNode, nodes, edges));

      expect(result.current.metrics.isHighFanOut).toBe(true);
    });

    it('should calculate total connections', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(
        () => useNodeDependencies(nodes[1], nodes, graphEdges), // Middle node B
      );

      // B has 1 dependency (C) and 1 dependent (A)
      expect(result.current.metrics.totalConnections).toBe(2);
    });

    it('should track total vs filtered counts', () => {
      const { nodes, edges } = createDiamondGraph();
      const allEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));
      const filteredEdges: GraphEdge[] = [{ source: 'A', target: 'B' }];

      const { result } = renderHook(() =>
        useNodeDependencies(nodes[0], nodes, allEdges, filteredEdges),
      );

      expect(result.current.metrics.dependencyCount).toBe(1); // Filtered
      expect(result.current.metrics.totalDependencyCount).toBe(2); // Total
    });
  });
});

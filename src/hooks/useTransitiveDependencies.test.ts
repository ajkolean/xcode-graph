import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GraphEdge } from '../data/mockGraphData';
import { createCyclicGraph, createDiamondGraph, createLinearChain } from '../test/fixtures';
import { useTransitiveDependencies } from './useTransitiveDependencies';

describe('useTransitiveDependencies', () => {
  describe('transitiveDeps', () => {
    it('should return empty sets when viewMode is full', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'full',
          selectedNode: nodes[0],
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDeps.nodes.size).toBe(0);
      expect(result.current.transitiveDeps.edges.size).toBe(0);
    });

    it('should return empty sets when no node is selected', () => {
      const { edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: null,
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDeps.nodes.size).toBe(0);
    });

    it('should traverse dependencies in focused mode', () => {
      const { nodes, edges } = createLinearChain(4);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: nodes[0], // Node A
          edges: graphEdges,
        }),
      );

      // A -> B -> C -> D, so from A we should reach all nodes
      expect(result.current.transitiveDeps.nodes).toContain('A');
      expect(result.current.transitiveDeps.nodes).toContain('B');
      expect(result.current.transitiveDeps.nodes).toContain('C');
      expect(result.current.transitiveDeps.nodes).toContain('D');
      expect(result.current.transitiveDeps.nodes.size).toBe(4);
    });

    it('should track edge depths', () => {
      const { nodes, edges } = createLinearChain(4);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: nodes[0], // Node A
          edges: graphEdges,
        }),
      );

      // Check edge depths
      expect(result.current.transitiveDeps.edgeDepths.get('A->B')).toBe(0);
      expect(result.current.transitiveDeps.edgeDepths.get('B->C')).toBe(1);
      expect(result.current.transitiveDeps.edgeDepths.get('C->D')).toBe(2);
    });

    it('should track maximum depth', () => {
      const { nodes, edges } = createLinearChain(4);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: nodes[0],
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDeps.maxDepth).toBe(3);
    });

    it('should handle diamond dependency pattern', () => {
      const { nodes, edges } = createDiamondGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: nodes[0], // Node A (top)
          edges: graphEdges,
        }),
      );

      // A -> B, A -> C, B -> D, C -> D
      expect(result.current.transitiveDeps.nodes.size).toBe(4);
      expect(result.current.transitiveDeps.edges.size).toBe(4);
    });

    it('should handle cycles without infinite loop', () => {
      const { nodes, edges } = createCyclicGraph();
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'focused',
          selectedNode: nodes[0], // Node A
          edges: graphEdges,
        }),
      );

      // A -> B -> C -> A (cycle), should visit each once
      expect(result.current.transitiveDeps.nodes.size).toBe(3);
    });

    it('should work in both mode', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'both',
          selectedNode: nodes[0],
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDeps.nodes.size).toBeGreaterThan(0);
    });
  });

  describe('transitiveDependents', () => {
    it('should return empty sets when viewMode is full', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'full',
          selectedNode: nodes[2], // Node C
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDependents.nodes.size).toBe(0);
    });

    it('should traverse dependents in dependents mode', () => {
      const { nodes, edges } = createLinearChain(4);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'dependents',
          selectedNode: nodes[3], // Node D
          edges: graphEdges,
        }),
      );

      // D <- C <- B <- A, so from D we should reach all nodes going backwards
      expect(result.current.transitiveDependents.nodes).toContain('D');
      expect(result.current.transitiveDependents.nodes).toContain('C');
      expect(result.current.transitiveDependents.nodes).toContain('B');
      expect(result.current.transitiveDependents.nodes).toContain('A');
    });

    it('should track edge depths for dependents', () => {
      const { nodes, edges } = createLinearChain(4);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'dependents',
          selectedNode: nodes[3], // Node D
          edges: graphEdges,
        }),
      );

      expect(result.current.transitiveDependents.edgeDepths.get('C->D')).toBe(0);
      expect(result.current.transitiveDependents.edgeDepths.get('B->C')).toBe(1);
      expect(result.current.transitiveDependents.edgeDepths.get('A->B')).toBe(2);
    });

    it('should work in both mode', () => {
      const { nodes, edges } = createLinearChain(3);
      const graphEdges: GraphEdge[] = edges.map((e) => ({ source: e.source, target: e.target }));

      const { result } = renderHook(() =>
        useTransitiveDependencies({
          viewMode: 'both',
          selectedNode: nodes[1], // Node B (middle)
          edges: graphEdges,
        }),
      );

      // In 'both' mode, both deps and dependents should be populated
      expect(result.current.transitiveDeps.nodes.size).toBeGreaterThan(0);
      expect(result.current.transitiveDependents.nodes.size).toBeGreaterThan(0);
    });
  });
});

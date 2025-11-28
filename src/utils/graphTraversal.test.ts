/**
 * Tests for graph traversal utilities including cycle detection
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { computeTransitiveDependencies } from './graphTraversal';

describe('computeTransitiveDependencies', () => {
  let nodes: GraphNode[];
  let edges: GraphEdge[];

  beforeEach(() => {
    // Create a simple graph with a cycle: A -> B -> C -> A
    nodes = [
      { id: 'A', name: 'Node A', type: 'app', platform: 'iOS', origin: 'local' },
      { id: 'B', name: 'Node B', type: 'framework', platform: 'iOS', origin: 'local' },
      { id: 'C', name: 'Node C', type: 'library', platform: 'iOS', origin: 'local' },
      { id: 'D', name: 'Node D', type: 'library', platform: 'iOS', origin: 'local' },
    ];

    edges = [
      { source: 'A', target: 'B', id: 'A->B' },
      { source: 'B', target: 'C', id: 'B->C' },
      { source: 'C', target: 'A', id: 'C->A' }, // Creates cycle
      { source: 'A', target: 'D', id: 'A->D' },
    ];
  });

  describe('Cycle Handling - focused mode', () => {
    it('should handle circular dependencies without infinite loop', () => {
      const result = computeTransitiveDependencies('focused', nodes[0], edges);

      // Should visit all nodes in the cycle exactly once
      expect(result.transitiveDeps.nodes.has('A')).toBe(true);
      expect(result.transitiveDeps.nodes.has('B')).toBe(true);
      expect(result.transitiveDeps.nodes.has('C')).toBe(true);
      expect(result.transitiveDeps.nodes.has('D')).toBe(true);

      // Should include all edges in the cycle
      expect(result.transitiveDeps.edges.has('A->B')).toBe(true);
      expect(result.transitiveDeps.edges.has('B->C')).toBe(true);
      expect(result.transitiveDeps.edges.has('C->A')).toBe(true);
      expect(result.transitiveDeps.edges.has('A->D')).toBe(true);
    });

    it('should not revisit nodes in a cycle', () => {
      const result = computeTransitiveDependencies('focused', nodes[0], edges);

      // Node count should equal unique nodes, not infinite
      expect(result.transitiveDeps.nodes.size).toBe(4);
    });

    it('should complete in reasonable time with cycles', () => {
      const start = Date.now();
      computeTransitiveDependencies('focused', nodes[0], edges);
      const duration = Date.now() - start;

      // Should complete in well under 100ms even with cycles
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Cycle Handling - dependents mode', () => {
    it('should handle reverse circular dependencies', () => {
      const result = computeTransitiveDependencies('dependents', nodes[2], edges);

      // From C, should find dependents: A (via C->A), B (via B->C), etc.
      expect(result.transitiveDependents.nodes.has('C')).toBe(true);
      expect(result.transitiveDependents.nodes.has('A')).toBe(true);
      expect(result.transitiveDependents.nodes.has('B')).toBe(true);
    });

    it('should not loop infinitely when finding dependents in a cycle', () => {
      const result = computeTransitiveDependencies('dependents', nodes[1], edges);

      // Should visit each node exactly once
      expect(result.transitiveDependents.nodes.size).toBeLessThanOrEqual(4);
    });
  });

  describe('Self-loops', () => {
    it('should handle self-referential nodes', () => {
      const selfLoopEdges: GraphEdge[] = [
        ...edges,
        { source: 'D', target: 'D', id: 'D->D' }, // Self-loop
      ];

      const result = computeTransitiveDependencies('focused', nodes[0], selfLoopEdges);

      // Should handle self-loop gracefully
      expect(result.transitiveDeps.nodes.has('D')).toBe(true);
      expect(result.transitiveDeps.edges.has('D->D')).toBe(true);
    });
  });

  describe('Multiple cycles', () => {
    it('should handle graph with multiple independent cycles', () => {
      const multiCycleEdges: GraphEdge[] = [
        { source: 'A', target: 'B', id: 'A->B' },
        { source: 'B', target: 'A', id: 'B->A' }, // Cycle 1: A <-> B
        { source: 'C', target: 'D', id: 'C->D' },
        { source: 'D', target: 'C', id: 'D->C' }, // Cycle 2: C <-> D
      ];

      const result = computeTransitiveDependencies('focused', nodes[0], multiCycleEdges);

      // Should only traverse the connected cycle
      expect(result.transitiveDeps.nodes.has('A')).toBe(true);
      expect(result.transitiveDeps.nodes.has('B')).toBe(true);
      expect(result.transitiveDeps.nodes.has('C')).toBe(false); // Not connected
      expect(result.transitiveDeps.nodes.has('D')).toBe(false); // Not connected
    });
  });

  describe('Linear chains (no cycles)', () => {
    it('should work correctly with acyclic graphs', () => {
      const acyclicEdges: GraphEdge[] = [
        { source: 'A', target: 'B', id: 'A->B' },
        { source: 'B', target: 'C', id: 'B->C' },
        { source: 'C', target: 'D', id: 'C->D' },
      ];

      const result = computeTransitiveDependencies('focused', nodes[0], acyclicEdges);

      expect(result.transitiveDeps.nodes.has('A')).toBe(true);
      expect(result.transitiveDeps.nodes.has('B')).toBe(true);
      expect(result.transitiveDeps.nodes.has('C')).toBe(true);
      expect(result.transitiveDeps.nodes.has('D')).toBe(true);

      expect(result.transitiveDeps.nodes.size).toBe(4);
    });
  });

  describe('Empty graphs', () => {
    it('should handle empty node selection', () => {
      const result = computeTransitiveDependencies('focused', null, edges);

      expect(result.transitiveDeps.nodes.size).toBe(0);
      expect(result.transitiveDeps.edges.size).toBe(0);
    });

    it('should handle node with no dependencies', () => {
      const isolatedNode: GraphNode = {
        id: 'isolated',
        name: 'Isolated',
        type: 'library',
        platform: 'iOS',
        origin: 'local',
      };

      const result = computeTransitiveDependencies('focused', isolatedNode, edges);

      expect(result.transitiveDeps.nodes.has('isolated')).toBe(true);
      expect(result.transitiveDeps.nodes.size).toBe(1);
      expect(result.transitiveDeps.edges.size).toBe(0);
    });
  });

  describe('Edge depth tracking', () => {
    it('should track depths correctly even with cycles', () => {
      const result = computeTransitiveDependencies('focused', nodes[0], edges);

      // First level edges should have depth 0
      expect(result.transitiveDeps.edgeDepths.get('A->B')).toBe(0);
      expect(result.transitiveDeps.edgeDepths.get('A->D')).toBe(0);

      // Second level should have depth 1
      expect(result.transitiveDeps.edgeDepths.get('B->C')).toBe(1);
    });

    it('should track max depth', () => {
      const acyclicEdges: GraphEdge[] = [
        { source: 'A', target: 'B', id: 'A->B' },
        { source: 'B', target: 'C', id: 'B->C' },
        { source: 'C', target: 'D', id: 'C->D' },
      ];

      const result = computeTransitiveDependencies('focused', nodes[0], acyclicEdges);

      expect(result.transitiveDeps.maxDepth).toBe(3);
    });
  });

  describe('View mode behavior', () => {
    it('should return empty results for full view mode', () => {
      const result = computeTransitiveDependencies('full', nodes[0], edges);

      expect(result.transitiveDeps.nodes.size).toBe(0);
      expect(result.transitiveDeps.edges.size).toBe(0);
      expect(result.transitiveDependents.nodes.size).toBe(0);
      expect(result.transitiveDependents.edges.size).toBe(0);
    });

    it('should return both deps and dependents in both mode', () => {
      const result = computeTransitiveDependencies('both', nodes[1], edges);

      expect(result.transitiveDeps.nodes.size).toBeGreaterThan(0);
      expect(result.transitiveDependents.nodes.size).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large graphs with cycles efficiently', () => {
      // Create a larger graph with cycles
      const largeNodes: GraphNode[] = [];
      const largeEdges: GraphEdge[] = [];

      for (let i = 0; i < 100; i++) {
        largeNodes.push({
          id: `node-${i}`,
          name: `Node ${i}`,
          type: 'library',
          platform: 'iOS',
          origin: 'local',
        });

        if (i > 0) {
          largeEdges.push({
            source: `node-${i - 1}`,
            target: `node-${i}`,
            id: `edge-${i}`,
          });
        }
      }

      // Add cycle back to start
      largeEdges.push({ source: 'node-99', target: 'node-0', id: 'cycle' });

      const start = Date.now();
      const result = computeTransitiveDependencies('focused', largeNodes[0], largeEdges);
      const duration = Date.now() - start;

      expect(result.transitiveDeps.nodes.size).toBe(100);
      expect(duration).toBeLessThan(50); // Should be fast even with 100 nodes
    });
  });
});

import { describe, expect, it } from 'vitest';
import { assignLayers, buildAdjacency, computeNodeScores, tarjanSCC, topoSort } from './algorithms';

describe('graphAlgorithms', () => {
  describe('buildAdjacency', () => {
    it('should create forward and reverse adjacency lists', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];

      const { forward, reverse } = buildAdjacency(nodes, edges);

      expect(forward.get('A')).toEqual(['B']);
      expect(forward.get('B')).toEqual(['C']);
      expect(forward.get('C')).toEqual([]);

      expect(reverse.get('A')).toEqual([]);
      expect(reverse.get('B')).toEqual(['A']);
      expect(reverse.get('C')).toEqual(['B']);
    });

    it('should handle empty graph', () => {
      const { forward, reverse } = buildAdjacency([], []);

      expect(forward.size).toBe(0);
      expect(reverse.size).toBe(0);
    });

    it('should handle isolated nodes', () => {
      const nodes = ['A', 'B', 'C'];
      const edges: Array<{ from: string; to: string }> = [];

      const { forward, reverse } = buildAdjacency(nodes, edges);

      expect(forward.get('A')).toEqual([]);
      expect(forward.get('B')).toEqual([]);
      expect(forward.get('C')).toEqual([]);
      expect(reverse.get('A')).toEqual([]);
      expect(reverse.get('B')).toEqual([]);
      expect(reverse.get('C')).toEqual([]);
    });

    it('should handle multiple edges from same node', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'A', to: 'D' },
      ];

      const { forward, reverse } = buildAdjacency(nodes, edges);

      expect(forward.get('A')).toEqual(['B', 'C', 'D']);
      expect(reverse.get('B')).toEqual(['A']);
      expect(reverse.get('C')).toEqual(['A']);
      expect(reverse.get('D')).toEqual(['A']);
    });

    it('should handle edges with nodes not in node list', () => {
      const nodes = ['A'];
      const edges = [{ from: 'A', to: 'B' }]; // B not in nodes

      const { forward, reverse } = buildAdjacency(nodes, edges);

      expect(forward.get('A')).toEqual(['B']);
      expect(forward.get('B')).toEqual([]);
      expect(reverse.get('B')).toEqual(['A']);
    });
  });

  describe('tarjanSCC', () => {
    it('should find single-node SCCs in acyclic graph', () => {
      const adj = new Map([
        ['A', ['B']],
        ['B', ['C']],
        ['C', []],
      ]);

      const sccs = tarjanSCC(adj);

      // Each node is its own SCC (no cycles)
      expect(sccs.length).toBe(3);
      expect(sccs.flat().toSorted((a, b) => a.localeCompare(b))).toEqual(['A', 'B', 'C']);
    });

    it('should find cycle as single SCC', () => {
      const adj = new Map([
        ['A', ['B']],
        ['B', ['C']],
        ['C', ['A']], // Creates cycle A -> B -> C -> A
      ]);

      const sccs = tarjanSCC(adj);

      // All three nodes form one SCC
      expect(sccs.length).toBe(1);
      expect(sccs[0].toSorted((a, b) => a.localeCompare(b))).toEqual(['A', 'B', 'C']);
    });

    it('should find simple two-node cycle', () => {
      const adj = new Map([
        ['A', ['B']],
        ['B', ['A']], // A <-> B cycle
      ]);

      const sccs = tarjanSCC(adj);

      expect(sccs.length).toBe(1);
      expect(sccs[0].sort()).toEqual(['A', 'B']);
    });

    it('should handle disconnected components', () => {
      const adj = new Map([
        ['A', ['B']],
        ['B', []],
        ['C', ['D']],
        ['D', []],
      ]);

      const sccs = tarjanSCC(adj);

      // 4 single-node SCCs
      expect(sccs.length).toBe(4);
    });

    it('should handle self-loop', () => {
      const adj = new Map([
        ['A', ['A']], // Self-loop
      ]);

      const sccs = tarjanSCC(adj);

      expect(sccs.length).toBe(1);
      expect(sccs[0]).toEqual(['A']);
    });

    it('should handle empty graph', () => {
      const adj = new Map<string, string[]>();

      const sccs = tarjanSCC(adj);

      expect(sccs).toEqual([]);
    });

    it('should find multiple SCCs with mix of cycles and non-cycles', () => {
      // Graph: A -> B <-> C, D -> E
      const adj = new Map([
        ['A', ['B']],
        ['B', ['C']],
        ['C', ['B']], // B <-> C cycle
        ['D', ['E']],
        ['E', []],
      ]);

      const sccs = tarjanSCC(adj);

      // Should have: {B, C}, {A}, {D}, {E}
      expect(sccs.length).toBe(4);

      // Find the SCC containing B and C
      const cycleScc = sccs.find((scc) => scc.includes('B') && scc.includes('C'));
      expect(cycleScc).toBeDefined();
      expect(cycleScc!.toSorted((a, b) => a.localeCompare(b))).toEqual(['B', 'C']);
    });
  });

  describe('topoSort', () => {
    it('should sort linear chain correctly', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
      ];

      const sorted = topoSort(nodes, edges);

      // A must come before B, B before C, C before D
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
    });

    it('should sort diamond pattern correctly', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
      ];

      const sorted = topoSort(nodes, edges);

      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
    });

    it('should handle isolated nodes', () => {
      const nodes = ['A', 'B', 'C'];
      const edges: Array<{ from: string; to: string }> = [];

      const sorted = topoSort(nodes, edges);

      expect(sorted.toSorted((a, b) => a.localeCompare(b))).toEqual(['A', 'B', 'C']);
    });

    it('should handle empty graph', () => {
      const sorted = topoSort([], []);

      expect(sorted).toEqual([]);
    });

    it('should handle single node', () => {
      const sorted = topoSort(['A'], []);

      expect(sorted).toEqual(['A']);
    });

    it('should handle multiple roots', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
      ];

      const sorted = topoSort(nodes, edges);

      // A and B are both roots, C must come after both, D must be last
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
    });
  });

  describe('assignLayers', () => {
    it('should assign layer 0 to source nodes', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ];

      const layers = assignLayers(nodes, edges);

      expect(layers.A).toBe(0);
    });

    it('should assign increasing layers along chain', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
      ];

      const layers = assignLayers(nodes, edges);

      expect(layers.A).toBe(0);
      expect(layers.B).toBe(1);
      expect(layers.C).toBe(2);
      expect(layers.D).toBe(3);
    });

    it('should use longest path for layer assignment (diamond)', () => {
      const nodes = ['A', 'B', 'C', 'D'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
      ];

      const layers = assignLayers(nodes, edges);

      expect(layers.A).toBe(0);
      expect(layers.B).toBe(1);
      expect(layers.C).toBe(1);
      expect(layers.D).toBe(2); // Max of B+1 and C+1
    });

    it('should handle isolated nodes', () => {
      const nodes = ['A', 'B', 'C'];
      const edges: Array<{ from: string; to: string }> = [];

      const layers = assignLayers(nodes, edges);

      expect(layers.A).toBe(0);
      expect(layers.B).toBe(0);
      expect(layers.C).toBe(0);
    });

    it('should handle empty graph', () => {
      const layers = assignLayers([], []);

      expect(layers).toEqual({});
    });

    it('should handle multiple roots with different path lengths', () => {
      // A -> B -> C -> D
      // E -> D (shorter path to D)
      const nodes = ['A', 'B', 'C', 'D', 'E'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'E', to: 'D' },
      ];

      const layers = assignLayers(nodes, edges);

      expect(layers.A).toBe(0);
      expect(layers.E).toBe(0);
      expect(layers.D).toBe(3); // Longest path: A -> B -> C -> D
    });
  });

  describe('computeNodeScores', () => {
    it('should compute fanIn correctly', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ];

      const { fanIn } = computeNodeScores(nodes, edges);

      expect(fanIn.A).toBe(0);
      expect(fanIn.B).toBe(0);
      expect(fanIn.C).toBe(2);
    });

    it('should compute fanOut correctly', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
      ];

      const { fanOut } = computeNodeScores(nodes, edges);

      expect(fanOut.A).toBe(2);
      expect(fanOut.B).toBe(0);
      expect(fanOut.C).toBe(0);
    });

    it('should compute coreScore as fanIn*2 + fanOut', () => {
      const nodes = ['A', 'B', 'C'];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ];

      const { fanIn, fanOut, coreScore } = computeNodeScores(nodes, edges);

      // A: fanIn=0, fanOut=2 -> coreScore = 0*2 + 2 = 2
      expect(coreScore.A).toBe(fanIn.A * 2 + fanOut.A);
      expect(coreScore.A).toBe(2);

      // B: fanIn=1, fanOut=1 -> coreScore = 1*2 + 1 = 3
      expect(coreScore.B).toBe(fanIn.B * 2 + fanOut.B);
      expect(coreScore.B).toBe(3);

      // C: fanIn=2, fanOut=0 -> coreScore = 2*2 + 0 = 4
      expect(coreScore.C).toBe(fanIn.C * 2 + fanOut.C);
      expect(coreScore.C).toBe(4);
    });

    it('should handle empty graph', () => {
      const { fanIn, fanOut, coreScore } = computeNodeScores([], []);

      expect(fanIn).toEqual({});
      expect(fanOut).toEqual({});
      expect(coreScore).toEqual({});
    });

    it('should handle isolated nodes', () => {
      const nodes = ['A', 'B'];
      const edges: Array<{ from: string; to: string }> = [];

      const { fanIn, fanOut, coreScore } = computeNodeScores(nodes, edges);

      expect(fanIn.A).toBe(0);
      expect(fanIn.B).toBe(0);
      expect(fanOut.A).toBe(0);
      expect(fanOut.B).toBe(0);
      expect(coreScore.A).toBe(0);
      expect(coreScore.B).toBe(0);
    });

    it('should identify high-fanIn nodes as important', () => {
      // Core module that everything depends on
      const nodes = ['A', 'B', 'C', 'D', 'Core'];
      const edges = [
        { from: 'A', to: 'Core' },
        { from: 'B', to: 'Core' },
        { from: 'C', to: 'Core' },
        { from: 'D', to: 'Core' },
      ];

      const { coreScore } = computeNodeScores(nodes, edges);

      // Core has highest score due to high fanIn
      const scores = Object.entries(coreScore).sort((a, b) => b[1] - a[1]);
      expect(scores[0][0]).toBe('Core');
    });
  });
});

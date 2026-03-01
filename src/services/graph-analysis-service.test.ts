import { describe, expect, it } from 'vitest';
import {
  createCyclicGraph,
  createDiamondGraph,
  createEmptyGraph,
  createLinearChain,
  createMultiCycleGraph,
  createNode,
  createProjectGraph,
} from '../fixtures';
import { GraphAnalysisService } from './graph-analysis-service';
import { GraphDataService } from './graph-data-service';

describe('GraphAnalysisService', () => {
  describe('hasPath', () => {
    it('should find path in linear chain', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'D')).toBe(true);
    });

    it('should find path from start to immediate neighbor', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'B')).toBe(true);
    });

    it('should return true when from and to are the same node', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'A')).toBe(true);
    });

    it('should return false when no path exists', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      // No path from D to A (edges are directional)
      expect(GraphAnalysisService.hasPath(service, 'D', 'A')).toBe(false);
    });

    it('should find path through diamond pattern', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'D')).toBe(true);
    });

    it('should handle disconnected components', () => {
      const nodes = [
        createNode({ id: 'A', name: 'A' }),
        createNode({ id: 'B', name: 'B' }),
        createNode({ id: 'C', name: 'C' }),
        createNode({ id: 'D', name: 'D' }),
      ];
      const edges = [
        { source: 'A', target: 'B' },
        { source: 'C', target: 'D' },
      ];
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'D')).toBe(false);
      expect(GraphAnalysisService.hasPath(service, 'C', 'D')).toBe(true);
    });

    it('should find path in cyclic graph', () => {
      const { nodes, edges } = createCyclicGraph();
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'C')).toBe(true);
      expect(GraphAnalysisService.hasPath(service, 'C', 'A')).toBe(true);
    });

    it('should handle empty graph', () => {
      const { nodes, edges } = createEmptyGraph();
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'A', 'B')).toBe(false);
    });

    it('should find path in realistic project graph', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      expect(GraphAnalysisService.hasPath(service, 'app', 'alamofire')).toBe(true);
      expect(GraphAnalysisService.hasPath(service, 'alamofire', 'app')).toBe(false);
    });
  });

  describe('findCircularDependencies', () => {
    it('should detect simple 3-node cycle', () => {
      const { nodes, edges } = createCyclicGraph();
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles.length).toBeGreaterThan(0);

      // At least one cycle should contain A, B, C
      const hasCycle = cycles.some((cycle) => {
        return cycle.includes('A') && cycle.includes('B') && cycle.includes('C');
      });
      expect(hasCycle).toBe(true);
    });

    it('should return empty array for acyclic graph', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles).toHaveLength(0);
    });

    it('should return empty for diamond (acyclic) graph', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles).toHaveLength(0);
    });

    it('should detect multiple cycles', () => {
      const { nodes, edges } = createMultiCycleGraph();
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty for empty graph', () => {
      const { nodes, edges } = createEmptyGraph();
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles).toHaveLength(0);
    });

    it('should handle single node graph', () => {
      const nodes = [createNode({ id: 'A', name: 'A' })];
      const service = new GraphDataService(nodes, []);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles).toHaveLength(0);
    });

    it('should detect 2-node cycle', () => {
      const nodes = [createNode({ id: 'A', name: 'A' }), createNode({ id: 'B', name: 'B' })];
      const edges = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'A' },
      ];
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      expect(cycles.length).toBeGreaterThan(0);
      const hasCycle = cycles.some((cycle) => cycle.includes('A') && cycle.includes('B'));
      expect(hasCycle).toBe(true);
    });

    it('should produce cycles that start and end with the same node', () => {
      const { nodes, edges } = createCyclicGraph();
      const service = new GraphDataService(nodes, edges);

      const cycles = GraphAnalysisService.findCircularDependencies(service);

      for (const cycle of cycles) {
        expect(cycle[0]).toBe(cycle[cycle.length - 1]);
      }
    });
  });
});

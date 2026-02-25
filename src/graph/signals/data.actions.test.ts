/**
 * Data Actions Tests
 *
 * Comprehensive tests for data state mutation functions.
 * Tests graph data initialization, updates, and clearing.
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import { clearGraphData, setGraphData } from './data.actions';
import { edges, nodes } from './data.signals';

describe('data.actions', () => {
  let snapshot: SignalSnapshot;

  // Helper to create test nodes
  const createTestNode = (id: string): GraphNode => ({
    id,
    name: `Node ${id}`,
    type: 'framework',
    path: `/path/to/${id}`,
    platform: 'ios',
    project: 'TestProject',
    origin: 'first-party',
  });

  // Helper to create test edges
  const createTestEdge = (source: string, target: string): GraphEdge => ({
    source,
    target,
  });

  beforeEach(() => {
    snapshot = createSignalSnapshot([nodes, edges]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  // ==================== setGraphData Tests ====================

  describe('setGraphData', () => {
    it('should set nodes and edges', () => {
      const testNodes = [createTestNode('node-1'), createTestNode('node-2')];
      const testEdges = [createTestEdge('node-1', 'node-2')];

      setGraphData(testNodes, testEdges);

      expect(nodes.get()).toEqual(testNodes);
      expect(edges.get()).toEqual(testEdges);
    });

    it('should set empty arrays', () => {
      setGraphData([], []);

      expect(nodes.get()).toEqual([]);
      expect(edges.get()).toEqual([]);
    });

    it('should set nodes without edges', () => {
      const testNodes = [createTestNode('node-1'), createTestNode('node-2')];

      setGraphData(testNodes, []);

      expect(nodes.get()).toEqual(testNodes);
      expect(edges.get()).toEqual([]);
    });

    it('should set edges without nodes', () => {
      const testEdges = [createTestEdge('node-1', 'node-2')];

      setGraphData([], testEdges);

      expect(nodes.get()).toEqual([]);
      expect(edges.get()).toEqual(testEdges);
    });

    it('should replace existing data', () => {
      const initialNodes = [createTestNode('node-1')];
      const initialEdges = [createTestEdge('node-1', 'node-2')];
      setGraphData(initialNodes, initialEdges);

      const newNodes = [createTestNode('node-3'), createTestNode('node-4')];
      const newEdges = [createTestEdge('node-3', 'node-4')];
      setGraphData(newNodes, newEdges);

      expect(nodes.get()).toEqual(newNodes);
      expect(edges.get()).toEqual(newEdges);
      expect(nodes.get()).not.toEqual(initialNodes);
      expect(edges.get()).not.toEqual(initialEdges);
    });

    it('should handle large datasets', () => {
      const testNodes: GraphNode[] = [];
      const testEdges: GraphEdge[] = [];

      for (let i = 0; i < 1000; i++) {
        testNodes.push(createTestNode(`node-${i}`));
        if (i > 0) {
          testEdges.push(createTestEdge(`node-${i - 1}`, `node-${i}`));
        }
      }

      setGraphData(testNodes, testEdges);

      expect(nodes.get()).toHaveLength(1000);
      expect(edges.get()).toHaveLength(999);
    });

});

  // ==================== clearGraphData Tests ====================

  describe('clearGraphData', () => {
    it('should clear nodes and edges', () => {
      const testNodes = [createTestNode('node-1'), createTestNode('node-2')];
      const testEdges = [createTestEdge('node-1', 'node-2')];
      setGraphData(testNodes, testEdges);

      clearGraphData();

      expect(nodes.get()).toEqual([]);
      expect(edges.get()).toEqual([]);
    });

    it('should work when data is already empty', () => {
      setGraphData([], []);

      clearGraphData();

      expect(nodes.get()).toEqual([]);
      expect(edges.get()).toEqual([]);
    });

    it('should clear large datasets', () => {
      const testNodes: GraphNode[] = [];
      const testEdges: GraphEdge[] = [];

      for (let i = 0; i < 1000; i++) {
        testNodes.push(createTestNode(`node-${i}`));
        if (i > 0) {
          testEdges.push(createTestEdge(`node-${i - 1}`, `node-${i}`));
        }
      }

      setGraphData(testNodes, testEdges);
      clearGraphData();

      expect(nodes.get()).toEqual([]);
      expect(edges.get()).toEqual([]);
    });
  });

  // ==================== Integration Tests ====================

  describe('integration scenarios', () => {
    it('should handle multiple setGraphData calls', () => {
      const dataset1 = {
        nodes: [createTestNode('node-1')],
        edges: [createTestEdge('node-1', 'node-2')],
      };

      const dataset2 = {
        nodes: [createTestNode('node-3'), createTestNode('node-4')],
        edges: [createTestEdge('node-3', 'node-4')],
      };

      const dataset3 = {
        nodes: [createTestNode('node-5')],
        edges: [],
      };

      setGraphData(dataset1.nodes, dataset1.edges);
      expect(nodes.get()).toEqual(dataset1.nodes);

      setGraphData(dataset2.nodes, dataset2.edges);
      expect(nodes.get()).toEqual(dataset2.nodes);

      setGraphData(dataset3.nodes, dataset3.edges);
      expect(nodes.get()).toEqual(dataset3.nodes);
    });

    it('should handle alternating between setGraphData and clearGraphData', () => {
      const testNodes = [createTestNode('node-1')];
      const testEdges = [createTestEdge('node-1', 'node-2')];

      setGraphData(testNodes, testEdges);
      expect(nodes.get()).toHaveLength(1);

      clearGraphData();
      expect(nodes.get()).toHaveLength(0);

      setGraphData(testNodes, testEdges);
      expect(nodes.get()).toHaveLength(1);

      clearGraphData();
      expect(nodes.get()).toHaveLength(0);
    });

    it('should handle complex graph structures', () => {
      // Create a diamond graph: 1 -> 2,3 -> 4
      const testNodes = [
        createTestNode('node-1'),
        createTestNode('node-2'),
        createTestNode('node-3'),
        createTestNode('node-4'),
      ];
      const testEdges = [
        createTestEdge('node-1', 'node-2'),
        createTestEdge('node-1', 'node-3'),
        createTestEdge('node-2', 'node-4'),
        createTestEdge('node-3', 'node-4'),
      ];

      setGraphData(testNodes, testEdges);

      expect(nodes.get()).toHaveLength(4);
      expect(edges.get()).toHaveLength(4);
    });

    it('should handle nodes with various properties', () => {
      const testNodes: GraphNode[] = [
        {
          id: 'node-1',
          name: 'Framework A',
          type: 'framework',
          path: '/path/to/framework',
          platform: 'ios',
          project: 'Project1',
          origin: 'first-party',
        },
        {
          id: 'node-2',
          name: 'Package B',
          type: 'package',
          path: '/path/to/package',
          platform: 'macos',
          project: 'Project2',
          origin: 'third-party',
        },
      ];

      setGraphData(testNodes, []);

      const storedNodes = nodes.get();
      expect(storedNodes).toHaveLength(2);
      expect(storedNodes[0].type).toBe('framework');
      expect(storedNodes[1].type).toBe('package');
      expect(storedNodes[0].origin).toBe('first-party');
      expect(storedNodes[1].origin).toBe('third-party');
    });
  });
});

/**
 * Data Actions Tests
 *
 * Comprehensive tests for data state mutation functions.
 * Tests graph data initialization, updates, and clearing.
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
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
    type: NodeType.Framework,
    path: `/path/to/${id}`,
    platform: Platform.iOS,
    project: 'TestProject',
    origin: Origin.Local,
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
  });
});

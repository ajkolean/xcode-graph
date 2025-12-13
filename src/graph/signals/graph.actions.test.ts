/**
 * Graph Actions Tests
 *
 * Comprehensive tests for graph state mutation functions.
 * Tests selection, view mode, circular dependencies, and complex interactions.
 */

import { ViewMode } from '@shared/schemas/app.schema';
import type { GraphNode } from '@shared/schemas/graph.schema';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import {
  focusNode,
  resetView,
  selectCluster,
  selectNode,
  setCircularDependencies,
  setHoveredNode,
  setViewMode,
  showDependents,
  showImpact,
} from './graph.actions';
import {
  circularDependencies,
  hoveredNode,
  selectedCluster,
  selectedNode,
  viewMode,
} from './graph.signals';

describe('graph.actions', () => {
  let snapshot: SignalSnapshot;

  // Helper to create a test node
  const createTestNode = (id: string, name = `Node ${id}`): GraphNode => ({
    id,
    name,
    type: 'framework',
    path: `/path/to/${id}`,
    platform: 'ios',
    project: 'TestProject',
    origin: 'first-party',
  });

  beforeEach(() => {
    snapshot = createSignalSnapshot([
      selectedNode,
      selectedCluster,
      hoveredNode,
      viewMode,
      circularDependencies,
    ]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  // ==================== Basic Actions ====================

  describe('selectNode', () => {
    it('should set selected node', () => {
      const node = createTestNode('node-1');

      selectNode(node);

      expect(selectedNode.get()).toBe(node);
    });

    it('should clear selected cluster when selecting node', () => {
      selectedCluster.set('cluster-1');

      const node = createTestNode('node-1');
      selectNode(node);

      expect(selectedCluster.get()).toBeNull();
    });

    it('should set view mode to Full when deselecting node', () => {
      const node = createTestNode('node-1');
      selectNode(node);
      viewMode.set(ViewMode.Focused);

      selectNode(null);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should not change view mode when selecting node', () => {
      viewMode.set(ViewMode.Focused);
      const node = createTestNode('node-1');

      selectNode(node);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should allow selecting null to deselect', () => {
      const node = createTestNode('node-1');
      selectNode(node);

      selectNode(null);

      expect(selectedNode.get()).toBeNull();
    });
  });

  describe('selectCluster', () => {
    it('should set selected cluster', () => {
      selectCluster('cluster-1');

      expect(selectedCluster.get()).toBe('cluster-1');
    });

    it('should clear selected node when selecting cluster', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);

      selectCluster('cluster-1');

      expect(selectedNode.get()).toBeNull();
    });

    it('should set view mode to Full when selecting cluster', () => {
      viewMode.set(ViewMode.Focused);

      selectCluster('cluster-1');

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should set view mode to Full when deselecting cluster', () => {
      selectCluster('cluster-1');
      viewMode.set(ViewMode.Focused);

      selectCluster(null);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should allow selecting null to deselect', () => {
      selectCluster('cluster-1');

      selectCluster(null);

      expect(selectedCluster.get()).toBeNull();
    });
  });

  describe('setHoveredNode', () => {
    it('should set hovered node ID', async () => {
      setHoveredNode('node-1');
      await new Promise(requestAnimationFrame);

      expect(hoveredNode.get()).toBe('node-1');
    });

    it('should allow clearing hovered node with null', async () => {
      setHoveredNode('node-1');
      await new Promise(requestAnimationFrame);

      setHoveredNode(null);
      await new Promise(requestAnimationFrame);

      expect(hoveredNode.get()).toBeNull();
    });

    it('should allow changing hovered node', async () => {
      setHoveredNode('node-1');
      setHoveredNode('node-2');
      await new Promise(requestAnimationFrame);

      expect(hoveredNode.get()).toBe('node-2');
    });
  });

  describe('setViewMode', () => {
    it('should set view mode to Full', () => {
      setViewMode(ViewMode.Full);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should set view mode to Focused', () => {
      setViewMode(ViewMode.Focused);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should set view mode to Dependents', () => {
      setViewMode(ViewMode.Dependents);

      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should set view mode to Both', () => {
      setViewMode(ViewMode.Both);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should set view mode to Impact', () => {
      setViewMode(ViewMode.Impact);

      expect(viewMode.get()).toBe(ViewMode.Impact);
    });

    it('should allow changing view mode multiple times', () => {
      setViewMode(ViewMode.Focused);
      expect(viewMode.get()).toBe(ViewMode.Focused);

      setViewMode(ViewMode.Dependents);
      expect(viewMode.get()).toBe(ViewMode.Dependents);

      setViewMode(ViewMode.Full);
      expect(viewMode.get()).toBe(ViewMode.Full);
    });
  });

  describe('setCircularDependencies', () => {
    it('should set circular dependencies', () => {
      const cycles = [
        ['node-1', 'node-2', 'node-1'],
        ['node-3', 'node-4', 'node-5', 'node-3'],
      ];

      setCircularDependencies(cycles);

      expect(circularDependencies.get()).toEqual(cycles);
    });

    it('should allow setting empty array', () => {
      setCircularDependencies([['node-1', 'node-2', 'node-1']]);

      setCircularDependencies([]);

      expect(circularDependencies.get()).toEqual([]);
    });

    it('should replace previous circular dependencies', () => {
      setCircularDependencies([['node-1', 'node-2', 'node-1']]);

      const newCycles = [['node-3', 'node-4', 'node-3']];
      setCircularDependencies(newCycles);

      expect(circularDependencies.get()).toEqual(newCycles);
    });
  });

  // ==================== Complex Actions ====================

  describe('focusNode', () => {
    it('should select node and set view mode to Focused', () => {
      const node = createTestNode('node-1');

      focusNode(node);

      expect(selectedNode.get()).toBe(node);
      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should clear selected cluster when focusing node', () => {
      selectedCluster.set('cluster-1');
      const node = createTestNode('node-1');

      focusNode(node);

      expect(selectedCluster.get()).toBeNull();
    });

    it('should cycle from Focused to Full when clicking same node', () => {
      const node = createTestNode('node-1');
      focusNode(node);
      expect(viewMode.get()).toBe(ViewMode.Focused);

      focusNode(node);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should cycle from Both to Dependents when clicking same node', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      viewMode.set(ViewMode.Both);

      focusNode(node);

      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should cycle from Dependents to Both when clicking same node', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      viewMode.set(ViewMode.Dependents);

      focusNode(node);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should reset to Focused when clicking different node', () => {
      const node1 = createTestNode('node-1');
      const node2 = createTestNode('node-2');

      focusNode(node1);
      viewMode.set(ViewMode.Full);

      focusNode(node2);

      expect(selectedNode.get()).toBe(node2);
      expect(viewMode.get()).toBe(ViewMode.Focused);
    });
  });

  describe('showDependents', () => {
    it('should select node and set view mode to Dependents', () => {
      const node = createTestNode('node-1');

      showDependents(node);

      expect(selectedNode.get()).toBe(node);
      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should clear selected cluster when showing dependents', () => {
      selectedCluster.set('cluster-1');
      const node = createTestNode('node-1');

      showDependents(node);

      expect(selectedCluster.get()).toBeNull();
    });

    it('should cycle from Dependents to Full when clicking same node', () => {
      const node = createTestNode('node-1');
      showDependents(node);
      expect(viewMode.get()).toBe(ViewMode.Dependents);

      showDependents(node);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should cycle from Both to Focused when clicking same node', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      viewMode.set(ViewMode.Both);

      showDependents(node);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should cycle from Focused to Both when clicking same node', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      viewMode.set(ViewMode.Focused);

      showDependents(node);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should reset to Dependents when clicking different node', () => {
      const node1 = createTestNode('node-1');
      const node2 = createTestNode('node-2');

      showDependents(node1);
      viewMode.set(ViewMode.Full);

      showDependents(node2);

      expect(selectedNode.get()).toBe(node2);
      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });
  });

  describe('showImpact', () => {
    it('should select node and set view mode to Impact', () => {
      const node = createTestNode('node-1');

      showImpact(node);

      expect(selectedNode.get()).toBe(node);
      expect(viewMode.get()).toBe(ViewMode.Impact);
    });

    it('should clear selected cluster when showing impact', () => {
      selectedCluster.set('cluster-1');
      const node = createTestNode('node-1');

      showImpact(node);

      expect(selectedCluster.get()).toBeNull();
    });

    it('should always set view mode to Impact regardless of current mode', () => {
      const node = createTestNode('node-1');
      viewMode.set(ViewMode.Focused);

      showImpact(node);
      expect(viewMode.get()).toBe(ViewMode.Impact);

      // Click again
      showImpact(node);
      expect(viewMode.get()).toBe(ViewMode.Impact);
    });
  });

  describe('resetView', () => {
    it('should clear selected node', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);

      resetView();

      expect(selectedNode.get()).toBeNull();
    });

    it('should clear selected cluster', () => {
      selectedCluster.set('cluster-1');

      resetView();

      expect(selectedCluster.get()).toBeNull();
    });

    it('should set view mode to Full', () => {
      viewMode.set(ViewMode.Focused);

      resetView();

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should clear all selections and reset view mode', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      selectedCluster.set('cluster-1');
      viewMode.set(ViewMode.Impact);

      resetView();

      expect(selectedNode.get()).toBeNull();
      expect(selectedCluster.get()).toBeNull();
      expect(viewMode.get()).toBe(ViewMode.Full);
    });
  });

  // ==================== Integration Tests ====================

  describe('integration scenarios', () => {
    it('should handle switching between node and cluster selection', () => {
      const node = createTestNode('node-1');

      selectNode(node);
      expect(selectedNode.get()).toBe(node);
      expect(selectedCluster.get()).toBeNull();

      selectCluster('cluster-1');
      expect(selectedNode.get()).toBeNull();
      expect(selectedCluster.get()).toBe('cluster-1');

      selectNode(node);
      expect(selectedNode.get()).toBe(node);
      expect(selectedCluster.get()).toBeNull();
    });

    it('should handle complex view mode cycling with focusNode', () => {
      const node = createTestNode('node-1');

      // First click: Focused
      focusNode(node);
      expect(viewMode.get()).toBe(ViewMode.Focused);

      // Second click: Full
      focusNode(node);
      expect(viewMode.get()).toBe(ViewMode.Full);

      // Set to Both
      viewMode.set(ViewMode.Both);

      // Third click: Dependents
      focusNode(node);
      expect(viewMode.get()).toBe(ViewMode.Dependents);

      // Fourth click: Both
      focusNode(node);
      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should handle complex view mode cycling with showDependents', () => {
      const node = createTestNode('node-1');

      // First click: Dependents
      showDependents(node);
      expect(viewMode.get()).toBe(ViewMode.Dependents);

      // Second click: Full
      showDependents(node);
      expect(viewMode.get()).toBe(ViewMode.Full);

      // Set to Both
      viewMode.set(ViewMode.Both);

      // Third click: Focused
      showDependents(node);
      expect(viewMode.get()).toBe(ViewMode.Focused);

      // Fourth click: Both
      showDependents(node);
      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should maintain hover state independently of selection', async () => {
      const node = createTestNode('node-1');

      setHoveredNode('node-2');
      await new Promise(requestAnimationFrame);
      selectNode(node);

      expect(hoveredNode.get()).toBe('node-2');
      expect(selectedNode.get()).toBe(node);
    });

    it('should handle rapid selection changes', () => {
      const node1 = createTestNode('node-1');
      const node2 = createTestNode('node-2');
      const node3 = createTestNode('node-3');

      selectNode(node1);
      selectCluster('cluster-1');
      selectNode(node2);
      selectCluster('cluster-2');
      selectNode(node3);

      expect(selectedNode.get()).toBe(node3);
      expect(selectedCluster.get()).toBeNull();
    });
  });
});

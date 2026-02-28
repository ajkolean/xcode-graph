/**
 * Graph Actions Tests
 *
 * Comprehensive tests for graph state mutation functions.
 * Tests selection, highlight toggles, circular dependencies, and complex interactions.
 */

import { ViewMode } from '@shared/schemas/app.schema';
import type { GraphNode } from '@shared/schemas/graph.schema';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.schema';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import {
  resetHighlightToggles,
  resetView,
  selectCluster,
  selectNode,
  setCircularDependencies,
  setHoveredNode,
  toggleHighlight,
} from './graph.actions';
import {
  circularDependencies,
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
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
    type: NodeType.Framework,
    path: `/path/to/${id}`,
    platform: Platform.iOS,
    project: 'TestProject',
    origin: Origin.Local,
  });

  beforeEach(() => {
    snapshot = createSignalSnapshot([
      selectedNode,
      selectedCluster,
      hoveredNode,
      highlightDirectDeps,
      highlightTransitiveDeps,
      highlightDirectDependents,
      highlightTransitiveDependents,
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

    it('should reset highlight toggles when deselecting node', () => {
      const node = createTestNode('node-1');
      selectNode(node);
      highlightDirectDeps.set(true);

      selectNode(null);

      expect(highlightDirectDeps.get()).toBe(false);
      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should auto-enable direct deps and dependents when selecting a node', () => {
      const node = createTestNode('node-1');

      selectNode(node);

      expect(highlightDirectDeps.get()).toBe(true);
      expect(highlightDirectDependents.get()).toBe(true);
      expect(highlightTransitiveDeps.get()).toBe(false);
      expect(highlightTransitiveDependents.get()).toBe(false);
      expect(viewMode.get()).toBe(ViewMode.Both);
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

    it('should reset highlight toggles when selecting cluster', () => {
      highlightDirectDeps.set(true);

      selectCluster('cluster-1');

      expect(highlightDirectDeps.get()).toBe(false);
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

  describe('setCircularDependencies', () => {
    it('should replace previous circular dependencies', () => {
      setCircularDependencies([['node-1', 'node-2', 'node-1']]);

      const newCycles = [['node-3', 'node-4', 'node-3']];
      setCircularDependencies(newCycles);

      expect(circularDependencies.get()).toEqual(newCycles);
    });
  });

  // ==================== Highlight Toggle Actions ====================

  describe('toggleHighlight', () => {
    it('should toggle direct deps on and off', () => {
      expect(highlightDirectDeps.get()).toBe(false);

      toggleHighlight('direct-deps');
      expect(highlightDirectDeps.get()).toBe(true);

      toggleHighlight('direct-deps');
      expect(highlightDirectDeps.get()).toBe(false);
    });

    it('should toggle transitive deps on and off', () => {
      toggleHighlight('transitive-deps');
      expect(highlightTransitiveDeps.get()).toBe(true);

      toggleHighlight('transitive-deps');
      expect(highlightTransitiveDeps.get()).toBe(false);
    });

    it('should toggle direct dependents on and off', () => {
      toggleHighlight('direct-dependents');
      expect(highlightDirectDependents.get()).toBe(true);

      toggleHighlight('direct-dependents');
      expect(highlightDirectDependents.get()).toBe(false);
    });

    it('should toggle transitive dependents on and off', () => {
      toggleHighlight('transitive-dependents');
      expect(highlightTransitiveDependents.get()).toBe(true);

      toggleHighlight('transitive-dependents');
      expect(highlightTransitiveDependents.get()).toBe(false);
    });

    it('should allow multiple toggles active simultaneously', () => {
      toggleHighlight('direct-deps');
      toggleHighlight('direct-dependents');

      expect(highlightDirectDeps.get()).toBe(true);
      expect(highlightDirectDependents.get()).toBe(true);
      expect(highlightTransitiveDeps.get()).toBe(false);
    });
  });

  describe('resetHighlightToggles', () => {
    it('should reset all toggles to false', () => {
      highlightDirectDeps.set(true);
      highlightTransitiveDeps.set(true);
      highlightDirectDependents.set(true);
      highlightTransitiveDependents.set(true);

      resetHighlightToggles();

      expect(highlightDirectDeps.get()).toBe(false);
      expect(highlightTransitiveDeps.get()).toBe(false);
      expect(highlightDirectDependents.get()).toBe(false);
      expect(highlightTransitiveDependents.get()).toBe(false);
    });
  });

  // ==================== Computed viewMode ====================

  describe('viewMode (computed)', () => {
    it('should be Full when no toggles active', () => {
      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should be Focused when deps toggle active', () => {
      highlightDirectDeps.set(true);
      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should be Focused when transitive deps toggle active', () => {
      highlightTransitiveDeps.set(true);
      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should be Dependents when dependents toggle active', () => {
      highlightDirectDependents.set(true);
      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should be Both when deps and dependents toggles active', () => {
      highlightDirectDeps.set(true);
      highlightDirectDependents.set(true);
      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should be Both when transitive deps and transitive dependents active', () => {
      highlightTransitiveDeps.set(true);
      highlightTransitiveDependents.set(true);
      expect(viewMode.get()).toBe(ViewMode.Both);
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

    it('should reset all highlight toggles', () => {
      highlightDirectDeps.set(true);
      highlightTransitiveDependents.set(true);

      resetView();

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should clear all selections and reset toggles', () => {
      const node = createTestNode('node-1');
      selectedNode.set(node);
      selectedCluster.set('cluster-1');
      highlightDirectDeps.set(true);

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

    it('should reset toggles when switching from node to cluster', () => {
      const node = createTestNode('node-1');
      selectNode(node);
      // selectNode auto-enables direct deps + direct dependents = Both
      expect(viewMode.get()).toBe(ViewMode.Both);

      selectCluster('cluster-1');
      expect(viewMode.get()).toBe(ViewMode.Full);
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

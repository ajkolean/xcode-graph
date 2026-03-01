/**
 * Graph Signals Tests
 *
 * Tests for graph signal definitions and computed signal derivations.
 * Focuses on the viewMode computed signal and its interaction with
 * highlight toggle signals.
 */

import { ViewMode } from '@shared/schemas/app.types';
import type { GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import {
  circularDependencies,
  createIsNodeSelected,
  hasSelection,
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  hoveredNode,
  resetGraphSignals,
  selectedCluster,
  selectedNode,
  viewMode,
} from './graph.signals';


function createTestNode(id: string): GraphNode {
  return {
    id,
    name: `Node ${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
  };
}

describe('graph.signals', () => {
  let snapshot: SignalSnapshot;

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


  describe('viewMode', () => {
    it('should return Full when all toggles are off', () => {
      highlightDirectDeps.set(false);
      highlightTransitiveDeps.set(false);
      highlightDirectDependents.set(false);
      highlightTransitiveDependents.set(false);

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should return Focused when only direct deps is on', () => {
      highlightDirectDeps.set(true);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should return Focused when only transitive deps is on', () => {
      highlightTransitiveDeps.set(true);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should return Focused when both deps toggles are on', () => {
      highlightDirectDeps.set(true);
      highlightTransitiveDeps.set(true);

      expect(viewMode.get()).toBe(ViewMode.Focused);
    });

    it('should return Dependents when only direct dependents is on', () => {
      highlightDirectDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should return Dependents when only transitive dependents is on', () => {
      highlightTransitiveDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should return Dependents when both dependent toggles are on', () => {
      highlightDirectDependents.set(true);
      highlightTransitiveDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Dependents);
    });

    it('should return Both when deps and dependents toggles are both on', () => {
      highlightDirectDeps.set(true);
      highlightDirectDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should return Both when transitive deps and transitive dependents are on', () => {
      highlightTransitiveDeps.set(true);
      highlightTransitiveDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should return Both when all toggles are on', () => {
      highlightDirectDeps.set(true);
      highlightTransitiveDeps.set(true);
      highlightDirectDependents.set(true);
      highlightTransitiveDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should return Both when direct deps and transitive dependents are on', () => {
      highlightDirectDeps.set(true);
      highlightTransitiveDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Both);
    });

    it('should react to toggle changes dynamically', () => {
      expect(viewMode.get()).toBe(ViewMode.Full);

      highlightDirectDeps.set(true);
      expect(viewMode.get()).toBe(ViewMode.Focused);

      highlightDirectDependents.set(true);
      expect(viewMode.get()).toBe(ViewMode.Both);

      highlightDirectDeps.set(false);
      expect(viewMode.get()).toBe(ViewMode.Dependents);

      highlightDirectDependents.set(false);
      expect(viewMode.get()).toBe(ViewMode.Full);
    });
  });


  describe('hasSelection', () => {
    it('should return false when nothing is selected', () => {
      selectedNode.set(null);
      selectedCluster.set(null);

      expect(hasSelection.get()).toBe(false);
    });

    it('should return true when a node is selected', () => {
      selectedNode.set(createTestNode('node-1'));

      expect(hasSelection.get()).toBe(true);
    });

    it('should return true when a cluster is selected', () => {
      selectedCluster.set('cluster-1');

      expect(hasSelection.get()).toBe(true);
    });

    it('should return true when both node and cluster are selected', () => {
      selectedNode.set(createTestNode('node-1'));
      selectedCluster.set('cluster-1');

      expect(hasSelection.get()).toBe(true);
    });
  });


  describe('createIsNodeSelected', () => {
    it('should return false when no node is selected', () => {
      selectedNode.set(null);

      const isSelected = createIsNodeSelected('node-1');
      expect(isSelected.get()).toBe(false);
    });

    it('should return true when the matching node is selected', () => {
      selectedNode.set(createTestNode('node-1'));

      const isSelected = createIsNodeSelected('node-1');
      expect(isSelected.get()).toBe(true);
    });

    it('should return false when a different node is selected', () => {
      selectedNode.set(createTestNode('node-2'));

      const isSelected = createIsNodeSelected('node-1');
      expect(isSelected.get()).toBe(false);
    });

    it('should react to selection changes', () => {
      const isSelected = createIsNodeSelected('node-1');

      expect(isSelected.get()).toBe(false);

      selectedNode.set(createTestNode('node-1'));
      expect(isSelected.get()).toBe(true);

      selectedNode.set(createTestNode('node-2'));
      expect(isSelected.get()).toBe(false);

      selectedNode.set(null);
      expect(isSelected.get()).toBe(false);
    });
  });


  describe('resetGraphSignals', () => {
    it('should reset all signals to initial state', () => {
      // Set everything to non-default
      selectedNode.set(createTestNode('node-1'));
      selectedCluster.set('cluster-1');
      hoveredNode.set('node-2');
      highlightDirectDeps.set(true);
      highlightTransitiveDeps.set(true);
      highlightDirectDependents.set(true);
      highlightTransitiveDependents.set(true);
      circularDependencies.set([['a', 'b', 'a']]);

      resetGraphSignals();

      expect(selectedNode.get()).toBeNull();
      expect(selectedCluster.get()).toBeNull();
      expect(hoveredNode.get()).toBeNull();
      expect(highlightDirectDeps.get()).toBe(false);
      expect(highlightTransitiveDeps.get()).toBe(false);
      expect(highlightDirectDependents.get()).toBe(false);
      expect(highlightTransitiveDependents.get()).toBe(false);
      expect(circularDependencies.get()).toEqual([]);
    });

    it('should result in Full view mode after reset', () => {
      highlightDirectDeps.set(true);
      highlightDirectDependents.set(true);
      expect(viewMode.get()).toBe(ViewMode.Both);

      resetGraphSignals();

      expect(viewMode.get()).toBe(ViewMode.Full);
    });

    it('should result in no selection after reset', () => {
      selectedNode.set(createTestNode('node-1'));
      selectedCluster.set('cluster-1');
      expect(hasSelection.get()).toBe(true);

      resetGraphSignals();

      expect(hasSelection.get()).toBe(false);
    });
  });


  describe('signal defaults', () => {
    it('should have null for selectedNode initially', () => {
      resetGraphSignals();
      expect(selectedNode.get()).toBeNull();
    });

    it('should have null for selectedCluster initially', () => {
      resetGraphSignals();
      expect(selectedCluster.get()).toBeNull();
    });

    it('should have null for hoveredNode initially', () => {
      resetGraphSignals();
      expect(hoveredNode.get()).toBeNull();
    });

    it('should have empty array for circularDependencies initially', () => {
      resetGraphSignals();
      expect(circularDependencies.get()).toEqual([]);
    });

    it('should have all highlight toggles off initially', () => {
      resetGraphSignals();
      expect(highlightDirectDeps.get()).toBe(false);
      expect(highlightTransitiveDeps.get()).toBe(false);
      expect(highlightDirectDependents.get()).toBe(false);
      expect(highlightTransitiveDependents.get()).toBe(false);
    });
  });
});

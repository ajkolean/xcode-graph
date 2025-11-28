/**
 * Comprehensive tests for graphStore
 * Target: 80%+ coverage
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createNode } from '../test/fixtures';
import { useGraphStore } from './graphStore';

describe('useGraphStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGraphStore.setState({
      selectedNode: null,
      selectedCluster: null,
      hoveredNode: null,
      viewMode: 'full',
      circularDependencies: [],
    });
  });

  describe('Initial State', () => {
    it('should have null selections', () => {
      const state = useGraphStore.getState();

      expect(state.selectedNode).toBeNull();
      expect(state.selectedCluster).toBeNull();
      expect(state.hoveredNode).toBeNull();
    });

    it('should have full view mode', () => {
      expect(useGraphStore.getState().viewMode).toBe('full');
    });

    it('should have empty circular dependencies', () => {
      expect(useGraphStore.getState().circularDependencies).toEqual([]);
    });
  });

  describe('selectNode', () => {
    it('should select a node', () => {
      const node = createNode({ id: 'test', name: 'Test' });

      useGraphStore.getState().selectNode(node);

      expect(useGraphStore.getState().selectedNode).toEqual(node);
    });

    it('should clear cluster selection when selecting node', () => {
      useGraphStore.setState({ selectedCluster: 'cluster1' });

      const node = createNode({ id: 'test', name: 'Test' });
      useGraphStore.getState().selectNode(node);

      expect(useGraphStore.getState().selectedCluster).toBeNull();
    });

    it('should reset to full view when deselecting', () => {
      const node = createNode({ id: 'test', name: 'Test' });
      useGraphStore.setState({ selectedNode: node, viewMode: 'focused' });

      useGraphStore.getState().selectNode(null);

      expect(useGraphStore.getState().viewMode).toBe('full');
    });

    it('should preserve view mode when selecting different node', () => {
      const node1 = createNode({ id: 'node1', name: 'Node1' });
      const node2 = createNode({ id: 'node2', name: 'Node2' });

      useGraphStore.setState({ selectedNode: node1, viewMode: 'focused' });
      useGraphStore.getState().selectNode(node2);

      expect(useGraphStore.getState().viewMode).toBe('focused');
    });
  });

  describe('selectCluster', () => {
    it('should select a cluster', () => {
      useGraphStore.getState().selectCluster('cluster1');

      expect(useGraphStore.getState().selectedCluster).toBe('cluster1');
    });

    it('should clear node selection when selecting cluster', () => {
      const node = createNode({ id: 'test', name: 'Test' });
      useGraphStore.setState({ selectedNode: node });

      useGraphStore.getState().selectCluster('cluster1');

      expect(useGraphStore.getState().selectedNode).toBeNull();
    });

    it('should reset to full view when selecting cluster', () => {
      useGraphStore.setState({ viewMode: 'focused' });

      useGraphStore.getState().selectCluster('cluster1');

      expect(useGraphStore.getState().viewMode).toBe('full');
    });
  });

  describe('setHoveredNode', () => {
    it('should set hovered node', () => {
      useGraphStore.getState().setHoveredNode('node1');

      expect(useGraphStore.getState().hoveredNode).toBe('node1');
    });

    it('should clear hovered node', () => {
      useGraphStore.setState({ hoveredNode: 'node1' });

      useGraphStore.getState().setHoveredNode(null);

      expect(useGraphStore.getState().hoveredNode).toBeNull();
    });
  });

  describe('setViewMode', () => {
    it('should update view mode', () => {
      useGraphStore.getState().setViewMode('focused');

      expect(useGraphStore.getState().viewMode).toBe('focused');
    });

    it('should accept all valid view modes', () => {
      const modes: Array<'full' | 'focused' | 'dependents' | 'both'> = [
        'full',
        'focused',
        'dependents',
        'both',
      ];

      for (const mode of modes) {
        useGraphStore.getState().setViewMode(mode);
        expect(useGraphStore.getState().viewMode).toBe(mode);
      }
    });
  });

  describe('setCircularDependencies', () => {
    it('should set circular dependencies', () => {
      const cycles = [['A', 'B', 'C', 'A']];

      useGraphStore.getState().setCircularDependencies(cycles);

      expect(useGraphStore.getState().circularDependencies).toEqual(cycles);
    });

    it('should handle empty cycles array', () => {
      useGraphStore.setState({ circularDependencies: [['A', 'B']] });

      useGraphStore.getState().setCircularDependencies([]);

      expect(useGraphStore.getState().circularDependencies).toHaveLength(0);
    });
  });

  describe('focusNode', () => {
    const testNode = createNode({ id: 'test', name: 'Test' });

    it('should focus node and set view mode to focused', () => {
      useGraphStore.getState().focusNode(testNode);

      expect(useGraphStore.getState().selectedNode).toEqual(testNode);
      expect(useGraphStore.getState().viewMode).toBe('focused');
    });

    it('should toggle focused -> full when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'focused' });

      useGraphStore.getState().focusNode(testNode);

      expect(useGraphStore.getState().viewMode).toBe('full');
    });

    it('should cycle both -> dependents when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'both' });

      useGraphStore.getState().focusNode(testNode);

      expect(useGraphStore.getState().viewMode).toBe('dependents');
    });

    it('should cycle dependents -> both when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'dependents' });

      useGraphStore.getState().focusNode(testNode);

      expect(useGraphStore.getState().viewMode).toBe('both');
    });

    it('should clear cluster selection', () => {
      useGraphStore.setState({ selectedCluster: 'cluster1' });

      useGraphStore.getState().focusNode(testNode);

      expect(useGraphStore.getState().selectedCluster).toBeNull();
    });
  });

  describe('showDependents', () => {
    const testNode = createNode({ id: 'test', name: 'Test' });

    it('should show dependents and set view mode', () => {
      useGraphStore.getState().showDependents(testNode);

      expect(useGraphStore.getState().selectedNode).toEqual(testNode);
      expect(useGraphStore.getState().viewMode).toBe('dependents');
    });

    it('should toggle dependents -> full when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'dependents' });

      useGraphStore.getState().showDependents(testNode);

      expect(useGraphStore.getState().viewMode).toBe('full');
    });

    it('should cycle both -> focused when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'both' });

      useGraphStore.getState().showDependents(testNode);

      expect(useGraphStore.getState().viewMode).toBe('focused');
    });

    it('should cycle focused -> both when clicking same node', () => {
      useGraphStore.setState({ selectedNode: testNode, viewMode: 'focused' });

      useGraphStore.getState().showDependents(testNode);

      expect(useGraphStore.getState().viewMode).toBe('both');
    });
  });

  describe('showImpact', () => {
    it('should show impact view', () => {
      const testNode = createNode({ id: 'test', name: 'Test' });

      useGraphStore.getState().showImpact(testNode);

      expect(useGraphStore.getState().selectedNode).toEqual(testNode);
      expect(useGraphStore.getState().viewMode).toBe('impact');
      expect(useGraphStore.getState().selectedCluster).toBeNull();
    });
  });

  describe('resetView', () => {
    it('should reset all selections', () => {
      const node = createNode({ id: 'test', name: 'Test' });
      useGraphStore.setState({
        selectedNode: node,
        selectedCluster: 'cluster1',
        viewMode: 'focused',
      });

      useGraphStore.getState().resetView();

      const state = useGraphStore.getState();
      expect(state.selectedNode).toBeNull();
      expect(state.selectedCluster).toBeNull();
      expect(state.viewMode).toBe('full');
    });
  });

  describe('Subscription and Reactivity', () => {
    it('should notify subscribers on state changes', () => {
      let callCount = 0;
      const unsubscribe = useGraphStore.subscribe(() => {
        callCount++;
      });

      const node = createNode({ id: 'test', name: 'Test' });
      useGraphStore.getState().selectNode(node);

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });
  });
});

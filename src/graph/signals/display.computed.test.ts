/**
 * Display Computed Signals Tests
 *
 * Tests for the computed signals that derive filtered and display data
 * from graph state, filters, and highlight mode.
 */

import { ViewMode } from '@shared/schemas/app.types';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { allPackages, allProjects, filters, searchQuery } from '@shared/signals/filter.signals';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAllInclusiveFilters, createNodeTypeFilter } from '../../fixtures';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import { edges, nodes } from './data.signals';
import { displayData, filteredData, transitiveData } from './display.computed';
import {
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDeps,
  selectedNode,
  viewMode,
} from './graph.signals';

// ==================== Helpers ====================

function createTestNode(id: string, overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id,
    name: `Node ${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    ...overrides,
  };
}

function createTestEdge(source: string, target: string): GraphEdge {
  return { source, target };
}

describe('display.computed', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([
      nodes,
      edges,
      filters,
      searchQuery,
      selectedNode,
      highlightDirectDeps,
      highlightTransitiveDeps,
      highlightDirectDependents,
      allProjects,
      allPackages,
    ]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  // ==================== filteredData Tests ====================

  describe('filteredData', () => {
    it('should return all nodes and edges when filters include everything', () => {
      const testNodes = [
        createTestNode('a', { project: 'Core' }),
        createTestNode('b', { project: 'Core' }),
      ];
      const testEdges = [createTestEdge('a', 'b')];

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');

      nodes.set(testNodes);
      edges.set(testEdges);
      filters.set(allFilters);
      searchQuery.set('');

      const result = filteredData.get();

      expect(result.filteredNodes).toHaveLength(2);
      expect(result.filteredEdges).toHaveLength(1);
      expect(result.searchResults).toBeNull();
    });

    it('should reduce nodes when a node type filter is applied', () => {
      const testNodes = [
        createTestNode('a', { type: NodeType.App, project: 'Main' }),
        createTestNode('b', { type: NodeType.Framework, project: 'Core' }),
        createTestNode('c', { type: NodeType.Library, project: 'Core' }),
      ];
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set(testNodes);
      edges.set(testEdges);

      // Filter to only show App nodes
      const typeFilter = createNodeTypeFilter([NodeType.App]);
      typeFilter.projects.add('Main');
      typeFilter.projects.add('Core');
      filters.set(typeFilter);
      searchQuery.set('');

      const result = filteredData.get();

      expect(result.filteredNodes).toHaveLength(1);
      expect(result.filteredNodes[0]?.id).toBe('a');
      // Edges require both endpoints to survive, so none should remain
      expect(result.filteredEdges).toHaveLength(0);
    });

    it('should filter edges when one endpoint is filtered out', () => {
      const testNodes = [
        createTestNode('a', { type: NodeType.Framework, project: 'Core' }),
        createTestNode('b', { type: NodeType.Framework, project: 'Core' }),
        createTestNode('c', { type: NodeType.Package, origin: Origin.External }),
      ];
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set(testNodes);
      edges.set(testEdges);

      // Filter to only Frameworks (exclude Package)
      const typeFilter = createNodeTypeFilter([NodeType.Framework]);
      typeFilter.projects.add('Core');
      filters.set(typeFilter);
      searchQuery.set('');

      const result = filteredData.get();

      expect(result.filteredNodes).toHaveLength(2);
      // Only edge a->b survives (b->c has c filtered out)
      expect(result.filteredEdges).toHaveLength(1);
      expect(result.filteredEdges[0]?.source).toBe('a');
      expect(result.filteredEdges[0]?.target).toBe('b');
    });

    it('should handle empty node data', () => {
      nodes.set([]);
      edges.set([]);
      filters.set(createAllInclusiveFilters());
      searchQuery.set('');

      const result = filteredData.get();

      expect(result.filteredNodes).toHaveLength(0);
      expect(result.filteredEdges).toHaveLength(0);
      expect(result.searchResults).toBeNull();
    });

    it('should return search results count when search query is active', () => {
      const testNodes = [
        createTestNode('a', { name: 'CoreModule', project: 'Main' }),
        createTestNode('b', { name: 'UIModule', project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('Core');

      const result = filteredData.get();

      // "Core" only matches "CoreModule" by name (not UIModule)
      expect(result.searchResults).toBe(1);
      expect(result.filteredNodes).toHaveLength(1);
      expect(result.filteredNodes[0]?.name).toBe('CoreModule');
    });
  });

  // ==================== transitiveData Tests ====================

  describe('transitiveData', () => {
    it('should return empty results when view mode is Full', () => {
      const testNodes = [createTestNode('a'), createTestNode('b')];
      const testEdges = [createTestEdge('a', 'b')];

      nodes.set(testNodes);
      edges.set(testEdges);

      // All toggles off -> viewMode = Full
      highlightDirectDeps.set(false);

      const result = transitiveData.get();

      expect(result.transitiveDeps.nodes.size).toBe(0);
      expect(result.transitiveDependents.nodes.size).toBe(0);
    });

    it('should compute transitive deps when highlight mode is Focused', () => {
      const nodeA = createTestNode('a');
      const nodeB = createTestNode('b');
      const nodeC = createTestNode('c');
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC]);
      edges.set(testEdges);
      selectedNode.set(nodeA);
      highlightDirectDeps.set(true);

      expect(viewMode.get()).toBe(ViewMode.Focused);

      const result = transitiveData.get();

      // a -> b -> c, so transitive deps should include a, b, c
      expect(result.transitiveDeps.nodes.has('a')).toBe(true);
      expect(result.transitiveDeps.nodes.has('b')).toBe(true);
      expect(result.transitiveDeps.nodes.has('c')).toBe(true);
    });

    it('should compute transitive dependents when highlight mode is Dependents', () => {
      const nodeA = createTestNode('a');
      const nodeB = createTestNode('b');
      const nodeC = createTestNode('c');
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC]);
      edges.set(testEdges);
      selectedNode.set(nodeC);
      highlightDirectDependents.set(true);

      expect(viewMode.get()).toBe(ViewMode.Dependents);

      const result = transitiveData.get();

      // c is depended on by b (which is depended on by a)
      expect(result.transitiveDependents.nodes.has('c')).toBe(true);
      expect(result.transitiveDependents.nodes.has('b')).toBe(true);
      expect(result.transitiveDependents.nodes.has('a')).toBe(true);
    });

    it('should return empty when no node is selected even with Focused mode', () => {
      const testEdges = [createTestEdge('a', 'b')];

      nodes.set([createTestNode('a'), createTestNode('b')]);
      edges.set(testEdges);
      selectedNode.set(null);
      highlightDirectDeps.set(true);

      const result = transitiveData.get();

      expect(result.transitiveDeps.nodes.size).toBe(0);
    });
  });

  // ==================== displayData Tests ====================

  describe('displayData', () => {
    it('should combine filtered data with transitive data', () => {
      const nodeA = createTestNode('a', { project: 'Core' });
      const nodeB = createTestNode('b', { project: 'Core' });
      const nodeC = createTestNode('c', { project: 'Core' });
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      // Select node 'a' and highlight deps
      selectedNode.set(nodeA);
      highlightDirectDeps.set(true);

      const result = displayData.get();

      // Should have all filtered nodes
      expect(result.filteredNodes).toHaveLength(3);
      expect(result.filteredEdges).toHaveLength(2);

      // Should have transitive deps populated
      expect(result.transitiveDeps.nodes.has('a')).toBe(true);
      expect(result.transitiveDeps.nodes.has('b')).toBe(true);
      expect(result.transitiveDeps.nodes.has('c')).toBe(true);
    });

    it('should reflect filter changes in display data', () => {
      const nodeA = createTestNode('a', { type: NodeType.App, project: 'Main' });
      const nodeB = createTestNode('b', { type: NodeType.Framework, project: 'Core' });
      const testEdges = [createTestEdge('a', 'b')];

      nodes.set([nodeA, nodeB]);
      edges.set(testEdges);

      // Start with all-inclusive filters
      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      let result = displayData.get();
      expect(result.filteredNodes).toHaveLength(2);

      // Now restrict to only App type
      const restrictedFilter = createNodeTypeFilter([NodeType.App]);
      restrictedFilter.projects.add('Main');
      restrictedFilter.projects.add('Core');
      filters.set(restrictedFilter);

      result = displayData.get();
      expect(result.filteredNodes).toHaveLength(1);
      expect(result.filteredNodes[0]?.type).toBe(NodeType.App);
    });

    it('should handle empty data gracefully', () => {
      nodes.set([]);
      edges.set([]);
      filters.set(createAllInclusiveFilters());
      searchQuery.set('');

      const result = displayData.get();

      expect(result.filteredNodes).toHaveLength(0);
      expect(result.filteredEdges).toHaveLength(0);
      expect(result.searchResults).toBeNull();
      expect(result.transitiveDeps.nodes.size).toBe(0);
      expect(result.transitiveDependents.nodes.size).toBe(0);
    });
  });
});

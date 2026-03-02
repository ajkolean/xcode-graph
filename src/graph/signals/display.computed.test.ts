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
import { previewFilter } from '@shared/signals/ui.signals';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAllInclusiveFilters, createNodeTypeFilter } from '../../fixtures';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import { edges, nodes } from './data.signals';
import { dimmedNodeIds, displayData, filteredData, transitiveData } from './display.computed';
import {
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  selectedNode,
  viewMode,
} from './graph.signals';

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
      highlightTransitiveDependents,
      allProjects,
      allPackages,
      previewFilter,
    ]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

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

  describe('dimmedNodeIds', () => {
    it('should dim nodes that do not match the search query by name', () => {
      // Node b has name "UIModule" but is in project "CoreProject".
      // matchesSearch matches by name, type, or project. So searching "Core"
      // will match b via project "CoreProject", keeping it in filteredNodes.
      // But shouldDimBySearch only checks name, so "UIModule" doesn't match
      // "core" and will be dimmed.
      const testNodes = [
        createTestNode('a', { name: 'CoreModule', project: 'CoreProject' }),
        createTestNode('b', { name: 'UIModule', project: 'CoreProject' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('CoreProject');
      filters.set(allFilters);
      searchQuery.set('Core');

      const dimmed = dimmedNodeIds.get();

      // UIModule passes the filter (project matches "Core") but its name
      // doesn't contain "core", so shouldDimBySearch dims it
      expect(dimmed.has('b')).toBe(true);
      // CoreModule matches by name, so it's NOT dimmed
      expect(dimmed.has('a')).toBe(false);
    });

    it('should dim nodes outside the selection chain when highlight toggles are active', () => {
      const nodeA = createTestNode('a', { project: 'Core' });
      const nodeB = createTestNode('b', { project: 'Core' });
      const nodeC = createTestNode('c', { project: 'Core' });
      const testEdges = [createTestEdge('a', 'b')];

      nodes.set([nodeA, nodeB, nodeC]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      // Select node A and enable direct deps highlight
      selectedNode.set(nodeA);
      highlightDirectDeps.set(true);

      const dimmed = dimmedNodeIds.get();

      // nodeC is not in the dependency chain of nodeA, so it should be dimmed
      expect(dimmed.has('c')).toBe(true);
      // nodeA (selected) and nodeB (direct dep) should NOT be dimmed
      expect(dimmed.has('a')).toBe(false);
      expect(dimmed.has('b')).toBe(false);
    });

    it('should dim nodes by preview filter (nodeType)', () => {
      const testNodes = [
        createTestNode('a', { type: NodeType.App, project: 'Main' }),
        createTestNode('b', { type: NodeType.Framework, project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'nodeType', value: NodeType.App });

      const dimmed = dimmedNodeIds.get();

      // Framework node should be dimmed (doesn't match App preview)
      expect(dimmed.has('b')).toBe(true);
      // App node should NOT be dimmed
      expect(dimmed.has('a')).toBe(false);
    });

    it('should dim nodes by preview filter (platform)', () => {
      const testNodes = [
        createTestNode('a', { platform: Platform.iOS, project: 'Main' }),
        createTestNode('b', { platform: Platform.macOS, project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'platform', value: Platform.iOS });

      const dimmed = dimmedNodeIds.get();

      expect(dimmed.has('b')).toBe(true);
      expect(dimmed.has('a')).toBe(false);
    });

    it('should dim nodes by preview filter (origin)', () => {
      const testNodes = [
        createTestNode('a', { origin: Origin.Local, project: 'Main' }),
        createTestNode('b', { origin: Origin.External, project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'origin', value: Origin.Local });

      const dimmed = dimmedNodeIds.get();

      expect(dimmed.has('b')).toBe(true);
      expect(dimmed.has('a')).toBe(false);
    });

    it('should dim nodes by preview filter (project)', () => {
      const testNodes = [
        createTestNode('a', { project: 'CoreProject' }),
        createTestNode('b', { project: 'UIProject' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('CoreProject');
      allFilters.projects.add('UIProject');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'project', value: 'CoreProject' });

      const dimmed = dimmedNodeIds.get();

      expect(dimmed.has('b')).toBe(true);
      expect(dimmed.has('a')).toBe(false);
    });

    it('should dim nodes by preview filter (package)', () => {
      const testNodes = [
        createTestNode('a', {
          type: NodeType.Package,
          name: 'SwiftUI',
          origin: Origin.External,
        }),
        createTestNode('b', {
          type: NodeType.Package,
          name: 'Combine',
          origin: Origin.External,
        }),
        createTestNode('c', { type: NodeType.Framework, name: 'SwiftUI', project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      allFilters.packages.add('SwiftUI');
      allFilters.packages.add('Combine');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'package', value: 'SwiftUI' });

      const dimmed = dimmedNodeIds.get();

      // Combine package should be dimmed
      expect(dimmed.has('b')).toBe(true);
      // Framework named SwiftUI should be dimmed (not a Package type)
      expect(dimmed.has('c')).toBe(true);
      // Package named SwiftUI should NOT be dimmed
      expect(dimmed.has('a')).toBe(false);
    });

    it('should not dim nodes for an unknown preview filter type', () => {
      const testNodes = [
        createTestNode('a', { project: 'Main' }),
        createTestNode('b', { project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('');
      previewFilter.set({ type: 'unknown' as 'nodeType', value: 'test' });

      const dimmed = dimmedNodeIds.get();

      // Unknown filter type should not dim any nodes (default case returns false)
      expect(dimmed.has('a')).toBe(false);
      expect(dimmed.has('b')).toBe(false);
    });

    it('should handle transitive deps and dependents in selection chain', () => {
      // a -> b -> c, and d depends on nothing
      const nodeA = createTestNode('a', { project: 'Core' });
      const nodeB = createTestNode('b', { project: 'Core' });
      const nodeC = createTestNode('c', { project: 'Core' });
      const nodeD = createTestNode('d', { project: 'Core' });
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC, nodeD]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      // Select node A and enable both direct + transitive deps
      // isNodeInChain checks depth: direct deps (depth<=1) need showDirect=true,
      // transitive deps (depth>1) need showTransitive=true
      selectedNode.set(nodeA);
      highlightDirectDeps.set(true);
      highlightTransitiveDeps.set(true);

      const dimmed = dimmedNodeIds.get();

      // nodeD has no connection to A, should be dimmed
      expect(dimmed.has('d')).toBe(true);
      // nodeA (selected), nodeB (direct dep at depth 1), nodeC (transitive dep at depth 2) should NOT be dimmed
      expect(dimmed.has('a')).toBe(false);
      expect(dimmed.has('b')).toBe(false);
      expect(dimmed.has('c')).toBe(false);
    });

    it('should handle dependents chain dimming', () => {
      // a -> b -> c
      const nodeA = createTestNode('a', { project: 'Core' });
      const nodeB = createTestNode('b', { project: 'Core' });
      const nodeC = createTestNode('c', { project: 'Core' });
      const nodeD = createTestNode('d', { project: 'Core' });
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC, nodeD]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      // Select node C and enable direct dependents
      selectedNode.set(nodeC);
      highlightDirectDependents.set(true);

      const dimmed = dimmedNodeIds.get();

      // nodeD has no connection to C, should be dimmed
      expect(dimmed.has('d')).toBe(true);
    });

    it('should handle transitive dependents chain dimming', () => {
      // a -> b -> c
      const nodeA = createTestNode('a', { project: 'Core' });
      const nodeB = createTestNode('b', { project: 'Core' });
      const nodeC = createTestNode('c', { project: 'Core' });
      const nodeD = createTestNode('d', { project: 'Core' });
      const testEdges = [createTestEdge('a', 'b'), createTestEdge('b', 'c')];

      nodes.set([nodeA, nodeB, nodeC, nodeD]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);
      searchQuery.set('');

      // Select node C and enable transitive dependents
      selectedNode.set(nodeC);
      highlightTransitiveDependents.set(true);

      const dimmed = dimmedNodeIds.get();

      // nodeD has no connection to C, should be dimmed
      expect(dimmed.has('d')).toBe(true);
      // nodeC (selected) should NOT be dimmed
      expect(dimmed.has('c')).toBe(false);
    });

    it('should not dim any nodes when no search, selection, or preview is active', () => {
      const testNodes = [
        createTestNode('a', { project: 'Main' }),
        createTestNode('b', { project: 'Main' }),
      ];

      nodes.set(testNodes);
      edges.set([]);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Main');
      filters.set(allFilters);
      searchQuery.set('');
      selectedNode.set(null);
      previewFilter.set(null);

      const dimmed = dimmedNodeIds.get();

      expect(dimmed.size).toBe(0);
    });

    it('should prioritize search dimming over selection dimming', () => {
      const nodeA = createTestNode('a', { name: 'CoreModule', project: 'Core' });
      const nodeB = createTestNode('b', { name: 'UIModule', project: 'Core' });
      const testEdges = [createTestEdge('a', 'b')];

      nodes.set([nodeA, nodeB]);
      edges.set(testEdges);

      const allFilters = createAllInclusiveFilters();
      allFilters.projects.add('Core');
      filters.set(allFilters);

      // Set search query AND selection with highlights
      searchQuery.set('Core');
      selectedNode.set(nodeA);
      highlightDirectDeps.set(true);

      const dimmed = dimmedNodeIds.get();

      // UIModule doesn't match 'Core' search, so it's dimmed by search (continue skips selection check)
      expect(dimmed.has('b')).toBe(true);
    });
  });
});

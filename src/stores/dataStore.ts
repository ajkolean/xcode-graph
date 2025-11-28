/**
 * Data Store - holds graph data and memoized derived state
 * Separates data management from UI state for better performance
 */

import { create } from 'zustand';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { FilterState, ViewMode } from '../schemas/app.schema';
import { applyGraphFilters } from '../utils/graphFilters';
import { computeTransitiveDependencies, type TransitiveResult } from '../utils/graphTraversal';
import { deepEqual } from '../utils/memoization';

interface FilteredData {
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  searchResults: number | null;
}

interface DisplayData extends FilteredData {
  transitiveDeps: TransitiveResult;
  transitiveDependents: TransitiveResult;
}

interface DataStore {
  // Source data
  nodes: GraphNode[];
  edges: GraphEdge[];

  // Cached derived data
  _cachedFilteredData: FilteredData | null;
  _cachedDisplayData: DisplayData | null;
  _lastFilters: FilterState | null;
  _lastSearchQuery: string;
  _lastViewMode: ViewMode;
  _lastSelectedNodeId: string | null;

  // Actions
  setGraphData: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  getFilteredData: (filters: FilterState, searchQuery: string) => FilteredData;
  getDisplayData: (
    filters: FilterState,
    searchQuery: string,
    viewMode: ViewMode,
    selectedNode: GraphNode | null,
  ) => DisplayData;

  // Clear cache when needed
  clearCache: () => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  nodes: [],
  edges: [],
  _cachedFilteredData: null,
  _cachedDisplayData: null,
  _lastFilters: null,
  _lastSearchQuery: '',
  _lastViewMode: 'full',
  _lastSelectedNodeId: null,

  setGraphData: (nodes, edges) => {
    set({
      nodes,
      edges,
      _cachedFilteredData: null,
      _cachedDisplayData: null,
    });
  },

  getFilteredData: (filters, searchQuery) => {
    const state = get();

    // Check if we can return cached result
    if (
      state._cachedFilteredData &&
      state._lastFilters &&
      deepEqual(state._lastFilters, filters) &&
      state._lastSearchQuery === searchQuery
    ) {
      return state._cachedFilteredData;
    }

    // Compute new filtered data
    const result = applyGraphFilters(state.nodes, state.edges, filters, searchQuery);

    // Cache the result
    set({
      _cachedFilteredData: result,
      _lastFilters: filters,
      _lastSearchQuery: searchQuery,
    });

    return result;
  },

  getDisplayData: (filters, searchQuery, viewMode, selectedNode) => {
    const state = get();

    // Check if we can return cached result
    const selectedNodeId = selectedNode?.id ?? null;
    if (
      state._cachedDisplayData &&
      state._lastFilters &&
      deepEqual(state._lastFilters, filters) &&
      state._lastSearchQuery === searchQuery &&
      state._lastViewMode === viewMode &&
      state._lastSelectedNodeId === selectedNodeId
    ) {
      return state._cachedDisplayData;
    }

    // Get filtered data (will use cache if available)
    const { filteredNodes, filteredEdges, searchResults } = get().getFilteredData(
      filters,
      searchQuery,
    );

    // Compute transitive dependencies
    const { transitiveDeps, transitiveDependents } = computeTransitiveDependencies(
      viewMode,
      selectedNode,
      state.edges,
    );

    // Filter to show only relevant nodes based on view mode
    let displayNodes = filteredNodes;
    let displayEdges = filteredEdges;

    if (viewMode === 'focused' && transitiveDeps.nodes.size > 0) {
      displayNodes = filteredNodes.filter(
        (n) => n.id === selectedNodeId || transitiveDeps.nodes.has(n.id),
      );
      displayEdges = filteredEdges.filter((e) =>
        transitiveDeps.edges.has(`${e.source}->${e.target}`),
      );
    } else if (viewMode === 'dependents' && transitiveDependents.nodes.size > 0) {
      displayNodes = filteredNodes.filter(
        (n) => n.id === selectedNodeId || transitiveDependents.nodes.has(n.id),
      );
      displayEdges = filteredEdges.filter((e) =>
        transitiveDependents.edges.has(`${e.source}->${e.target}`),
      );
    } else if (viewMode === 'both') {
      const allRelevantNodes = new Set(
        [selectedNodeId, ...transitiveDeps.nodes, ...transitiveDependents.nodes].filter(
          (id): id is string => id !== null,
        ),
      );

      displayNodes = filteredNodes.filter((n) => allRelevantNodes.has(n.id));

      const allRelevantEdges = new Set([
        ...Array.from(transitiveDeps.edges),
        ...Array.from(transitiveDependents.edges),
      ]);
      displayEdges = filteredEdges.filter((e) => allRelevantEdges.has(`${e.source}->${e.target}`));
    }

    const result: DisplayData = {
      filteredNodes: displayNodes,
      filteredEdges: displayEdges,
      searchResults,
      transitiveDeps,
      transitiveDependents,
    };

    // Cache the result
    set({
      _cachedDisplayData: result,
      _lastFilters: filters,
      _lastSearchQuery: searchQuery,
      _lastViewMode: viewMode,
      _lastSelectedNodeId: selectedNodeId,
    });

    return result;
  },

  clearCache: () => {
    set({
      _cachedFilteredData: null,
      _cachedDisplayData: null,
      _lastFilters: null,
      _lastSearchQuery: '',
      _lastViewMode: 'full',
      _lastSelectedNodeId: null,
    });
  },
}));

// Optimized selectors
export const useGraphNodes = () => useDataStore((s) => s.nodes);
export const useGraphEdges = () => useDataStore((s) => s.edges);

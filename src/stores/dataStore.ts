/**
 * Data Store - Graph data and memoized derived state
 *
 * Separates data management from UI state for better performance.
 * Caches filtered and display data to avoid expensive recomputation.
 *
 * @module stores/dataStore
 */

import { create } from 'zustand';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { FilterState, ViewMode } from '../schemas/app.schema';
import { applyGraphFilters } from '../utils/graph/graph-filters';
import { computeTransitiveDependencies, type TransitiveResult } from '../utils/graph/traversal';
import { deepEqual } from '../utils/memoization';

/**
 * Result of filtering graph data
 */
interface FilteredData {
  /** Nodes that pass current filters */
  filteredNodes: GraphNode[];
  /** Edges between filtered nodes */
  filteredEdges: GraphEdge[];
  /** Number of search matches (null if no search) */
  searchResults: number | null;
}

/**
 * Extended filtered data with transitive dependency info
 */
interface DisplayData extends FilteredData {
  /** Transitive dependencies of selected node */
  transitiveDeps: TransitiveResult;
  /** Transitive dependents of selected node */
  transitiveDependents: TransitiveResult;
}

/**
 * Data store state and actions
 */
interface DataStore {
  // ==================== Source Data ====================
  /** All graph nodes */
  nodes: GraphNode[];
  /** All graph edges */
  edges: GraphEdge[];

  // ==================== Cache State ====================
  /** Cached filtered data result */
  _cachedFilteredData: FilteredData | null;
  /** Cached display data result */
  _cachedDisplayData: DisplayData | null;
  /** Last filters used for caching */
  _lastFilters: FilterState | null;
  /** Last search query used for caching */
  _lastSearchQuery: string;
  /** Last view mode used for caching */
  _lastViewMode: ViewMode;
  /** Last selected node ID used for caching */
  _lastSelectedNodeId: string | null;

  // ==================== Actions ====================
  /** Set graph data (clears cache) */
  setGraphData: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  /** Get filtered data (uses cache when possible) */
  getFilteredData: (filters: FilterState, searchQuery: string) => FilteredData;
  /** Get display data including transitive deps (uses cache when possible) */
  getDisplayData: (
    filters: FilterState,
    searchQuery: string,
    viewMode: ViewMode,
    selectedNode: GraphNode | null,
  ) => DisplayData;
  /** Clear all cached data */
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
    } else if (
      (viewMode === 'dependents' || viewMode === 'impact') &&
      transitiveDependents.nodes.size > 0
    ) {
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

// ==================== Optimized Selectors ====================

/** Get all graph nodes */
export const useGraphNodes = () => useDataStore((s) => s.nodes);
/** Get all graph edges */
export const useGraphEdges = () => useDataStore((s) => s.edges);

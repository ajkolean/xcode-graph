/**
 * Display Computed Signals - Memoized derived graph state
 *
 * Replaces the manual memoization in dataStore with automatic
 * computed signal dependency tracking.
 *
 * @module signals/display.computed
 */

import { Signal } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { filters, searchQuery } from '@shared/signals/filter.signals';
import { applyGraphFilters } from '../utils/graph-filters';
import { computeTransitiveDependencies, type TransitiveResult } from '../utils/traversal';
import { edges, nodes } from './data.signals';
import { selectedNode, viewMode } from './graph.signals';

/**
 * Result of filtering graph data
 */
export interface FilteredData {
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
export interface DisplayData extends FilteredData {
  /** Transitive dependencies of selected node */
  transitiveDeps: TransitiveResult;
  /** Transitive dependents of selected node */
  transitiveDependents: TransitiveResult;
}

/** Computed signal for filtered graph data. */
export const filteredData: Signal.Computed<FilteredData> = new Signal.Computed<FilteredData>(() => {
  const currentNodes = nodes.get();
  const currentEdges = edges.get();
  const currentFilters = filters.get();
  const currentSearchQuery = searchQuery.get();

  return applyGraphFilters(currentNodes, currentEdges, currentFilters, currentSearchQuery);
});

/** Computed signal for transitive dependency data. */
export const transitiveData: Signal.Computed<{
  transitiveDeps: TransitiveResult;
  transitiveDependents: TransitiveResult;
}> = new Signal.Computed(() => {
  const currentViewMode = viewMode.get();
  const currentSelectedNode = selectedNode.get();
  const currentEdges = edges.get();

  return computeTransitiveDependencies(currentViewMode, currentSelectedNode, currentEdges);
});

/**
 * Computed signal for final display data.
 * Always passes all filtered nodes/edges through to the canvas.
 * The canvas handles visibility (direct mode = hide non-chain, highlight mode = depth alpha).
 */
export const displayData: Signal.Computed<DisplayData> = new Signal.Computed<DisplayData>(() => {
  const { filteredNodes, filteredEdges, searchResults } = filteredData.get();
  const { transitiveDeps, transitiveDependents } = transitiveData.get();

  return {
    filteredNodes: filteredNodes,
    filteredEdges: filteredEdges,
    searchResults: searchResults,
    transitiveDeps: transitiveDeps,
    transitiveDependents: transitiveDependents,
  };
});

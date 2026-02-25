/**
 * Display Computed Signals - Memoized derived graph state
 *
 * Replaces the manual memoization in dataStore with automatic
 * computed signal dependency tracking.
 *
 * @module signals/display.computed
 */

import { Signal } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { filters, searchQuery } from '@shared/signals/filter.signals';
import { applyGraphFilters } from '../utils/graph-filters';
import { computeTransitiveDependencies, type TransitiveResult } from '../utils/traversal';
import { edges, nodes } from './data.signals';
import { selectedNode, viewMode } from './graph.signals';

// ==================== Types ====================

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

// ==================== Computed Signals ====================

/**
 * Computed signal for filtered graph data.
 * Automatically recomputes when nodes, edges, filters, or searchQuery change.
 */
export const filteredData = new Signal.Computed<FilteredData>(() => {
  const currentNodes = nodes.get();
  const currentEdges = edges.get();
  const currentFilters = filters.get();
  const currentSearchQuery = searchQuery.get();

  return applyGraphFilters(currentNodes, currentEdges, currentFilters, currentSearchQuery);
});

/**
 * Computed signal for transitive dependency data.
 * Automatically recomputes when viewMode, selectedNode, or edges change.
 */
export const transitiveData = new Signal.Computed(() => {
  const currentViewMode = viewMode.get();
  const currentSelectedNode = selectedNode.get();
  const currentEdges = edges.get();

  return computeTransitiveDependencies(currentViewMode, currentSelectedNode, currentEdges);
});

/**
 * Computed signal for final display data.
 * Combines filtered data with view mode filtering based on transitive deps.
 * Automatically recomputes when any dependency changes.
 */
export const displayData = new Signal.Computed<DisplayData>(() => {
  const { filteredNodes, filteredEdges, searchResults } = filteredData.get();
  const { transitiveDeps, transitiveDependents } = transitiveData.get();
  const currentViewMode = viewMode.get();
  const currentSelectedNode = selectedNode.get();
  const selectedNodeId = currentSelectedNode?.id ?? null;

  let displayNodes = filteredNodes;
  let displayEdges = filteredEdges;

  if (currentViewMode === 'focused' && transitiveDeps.nodes.size > 0) {
    displayNodes = filteredNodes.filter(
      (n: GraphNode) => n.id === selectedNodeId || transitiveDeps.nodes.has(n.id),
    );
    displayEdges = filteredEdges.filter((e: GraphEdge) =>
      transitiveDeps.edges.has(`${e.source}->${e.target}`),
    );
  } else if (currentViewMode === 'dependents' && transitiveDependents.nodes.size > 0) {
    displayNodes = filteredNodes.filter(
      (n: GraphNode) => n.id === selectedNodeId || transitiveDependents.nodes.has(n.id),
    );
    displayEdges = filteredEdges.filter((e: GraphEdge) =>
      transitiveDependents.edges.has(`${e.source}->${e.target}`),
    );
  } else if (currentViewMode === 'both') {
    const allRelevantNodes = new Set(
      [selectedNodeId, ...transitiveDeps.nodes, ...transitiveDependents.nodes].filter(
        (id): id is string => id !== null,
      ),
    );

    displayNodes = filteredNodes.filter((n: GraphNode) => allRelevantNodes.has(n.id));

    const allRelevantEdges = new Set([
      ...Array.from(transitiveDeps.edges),
      ...Array.from(transitiveDependents.edges),
    ]);
    displayEdges = filteredEdges.filter((e: GraphEdge) =>
      allRelevantEdges.has(`${e.source}->${e.target}`),
    );
  }

  return {
    filteredNodes: displayNodes,
    filteredEdges: displayEdges,
    searchResults,
    transitiveDeps,
    transitiveDependents,
  };
});

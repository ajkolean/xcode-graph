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
import { NodeType } from '@shared/schemas/graph.types';
import { filters, searchQuery } from '@shared/signals/filter.signals';
import { previewFilter } from '@shared/signals/ui.signals';
import { applyGraphFilters } from '../utils/graph-filters';
import { computeTransitiveDependencies, type TransitiveResult } from '../utils/traversal';
import { edges, nodes } from './data.signals';
import {
  highlightDirectDependents,
  highlightDirectDeps,
  highlightTransitiveDependents,
  highlightTransitiveDeps,
  selectedNode,
  viewMode,
} from './graph.signals';

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

/**
 * Pre-computed set of dimmed node IDs.
 *
 * Combines search, selection/highlight-toggle, and preview-filter dimming
 * into a single Set that the renderer can check with O(1) `Set.has()`.
 *
 * Cluster dimming is intentionally excluded because `hoveredCluster` and
 * `selectedCluster` are local interaction state in GraphCanvas, not signals.
 */
export const dimmedNodeIds: Signal.Computed<Set<string>> = new Signal.Computed(() => {
  const { filteredNodes } = filteredData.get();
  const query = searchQuery.get();
  const selected = selectedNode.get();
  const preview = previewFilter.get();
  const { transitiveDeps, transitiveDependents } = transitiveData.get();

  const showDirectDepsVal = highlightDirectDeps.get();
  const showTransitiveDepsVal = highlightTransitiveDeps.get();
  const showDirectDependentsVal = highlightDirectDependents.get();
  const showTransitiveDependentsVal = highlightTransitiveDependents.get();
  const isChainActive =
    showDirectDepsVal ||
    showTransitiveDepsVal ||
    showDirectDependentsVal ||
    showTransitiveDependentsVal;

  const dimmed = new Set<string>();
  const lowerQuery = query ? query.toLowerCase() : '';

  for (const node of filteredNodes) {
    // Search dimming
    if (lowerQuery && !node.name.toLowerCase().includes(lowerQuery)) {
      dimmed.add(node.id);
      continue;
    }

    // Selection + highlight-toggle dimming
    if (selected && selected.id !== node.id && isChainActive) {
      let inActiveChain = false;

      if (transitiveDeps.nodes.has(node.id)) {
        const depth = transitiveDeps.nodeDepths?.get(node.id) ?? 0;
        if (depth <= 1 ? showDirectDepsVal : showTransitiveDepsVal) inActiveChain = true;
      }
      if (!inActiveChain && transitiveDependents.nodes.has(node.id)) {
        const depth = transitiveDependents.nodeDepths?.get(node.id) ?? 0;
        if (depth <= 1 ? showDirectDependentsVal : showTransitiveDependentsVal)
          inActiveChain = true;
      }

      if (!inActiveChain) {
        dimmed.add(node.id);
        continue;
      }
    }

    // Preview filter dimming
    if (preview) {
      let previewDimmed = false;
      switch (preview.type) {
        case 'nodeType':
          previewDimmed = node.type !== preview.value;
          break;
        case 'platform':
          previewDimmed = node.platform !== preview.value;
          break;
        case 'origin':
          previewDimmed = node.origin !== preview.value;
          break;
        case 'project':
          previewDimmed = node.project !== preview.value;
          break;
        case 'package':
          previewDimmed = !(node.type === NodeType.Package && node.name === preview.value);
          break;
      }
      if (previewDimmed) {
        dimmed.add(node.id);
      }
    }
  }

  return dimmed;
});

/**
 * Display Computed Signals - Memoized derived graph state
 *
 * Replaces the manual memoization in dataStore with automatic
 * computed signal dependency tracking.
 *
 * @module signals/display.computed
 */
import { Signal } from '@lit-labs/signals';
import { filters, searchQuery } from '@shared/signals/filter.signals';
import { applyGraphFilters } from '../utils/graph-filters';
import { computeTransitiveDependencies } from '../utils/traversal';
import { edges, nodes } from './data.signals';
import { selectedNode, viewMode } from './graph.signals';
// ==================== Computed Signals ====================
/**
 * Computed signal for filtered graph data.
 * Automatically recomputes when nodes, edges, filters, or searchQuery change.
 */
export const filteredData = new Signal.Computed(() => {
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
 * Always passes all filtered nodes/edges through to the canvas.
 * The canvas handles visibility (direct mode = hide non-chain, highlight mode = depth alpha).
 * Automatically recomputes when any dependency changes.
 */
export const displayData = new Signal.Computed(() => {
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
//# sourceMappingURL=display.computed.js.map
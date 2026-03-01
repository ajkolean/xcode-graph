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
import { type TransitiveResult } from '../utils/traversal';
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
/**
 * Computed signal for filtered graph data.
 * Automatically recomputes when nodes, edges, filters, or searchQuery change.
 */
export declare const filteredData: Signal.Computed<FilteredData>;
/**
 * Computed signal for transitive dependency data.
 * Automatically recomputes when viewMode, selectedNode, or edges change.
 */
export declare const transitiveData: Signal.Computed<{
    transitiveDeps: TransitiveResult;
    transitiveDependents: TransitiveResult;
}>;
/**
 * Computed signal for final display data.
 * Always passes all filtered nodes/edges through to the canvas.
 * The canvas handles visibility (direct mode = hide non-chain, highlight mode = depth alpha).
 * Automatically recomputes when any dependency changes.
 */
export declare const displayData: Signal.Computed<DisplayData>;

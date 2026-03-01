/**
 * Graph Signals - Selection and view state management
 *
 * Manages the currently selected node/cluster, view mode, and
 * circular dependency detection. Uses Lit Signals for reactive state.
 *
 * @module signals/graph
 */
import { Signal } from '@lit-labs/signals';
import { ViewMode } from '@shared/schemas/app.types';
import type { GraphNode } from '@shared/schemas/graph.types';
/** Currently selected node (null if none) */
export declare const selectedNode: Signal.State<GraphNode | null>;
/** Currently selected cluster ID (null if none) */
export declare const selectedCluster: Signal.State<string | null>;
/** Currently hovered node ID (null if none) */
export declare const hoveredNode: Signal.State<string | null>;
/** Detected circular dependency paths */
export declare const circularDependencies: Signal.State<string[][]>;
/** Whether direct dependencies are highlighted */
export declare const highlightDirectDeps: Signal.State<boolean>;
/** Whether transitive dependencies are highlighted */
export declare const highlightTransitiveDeps: Signal.State<boolean>;
/** Whether direct dependents are highlighted */
export declare const highlightDirectDependents: Signal.State<boolean>;
/** Whether transitive dependents are highlighted */
export declare const highlightTransitiveDependents: Signal.State<boolean>;
/** Current graph visualization mode, derived from highlight toggles */
export declare const viewMode: Signal.Computed<ViewMode>;
/** Check if any node or cluster is currently selected */
export declare const hasSelection: Signal.Computed<boolean>;
/**
 * Factory to create a computed signal that checks if a specific node is selected
 * @param nodeId - The node ID to check
 * @returns A computed signal that returns true if the node is selected
 */
export declare function createIsNodeSelected(nodeId: string): Signal.Computed<boolean>;
/**
 * Reset all graph signals to their initial state.
 * Useful for testing and cleanup.
 */
export declare function resetGraphSignals(): void;

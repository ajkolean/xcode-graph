/**
 * Graph Signals - Selection and view state management
 *
 * Manages the currently selected node/cluster, view mode, and
 * circular dependency detection. Uses Lit Signals for reactive state.
 *
 * @module signals/graph
 */
import { Signal, signal } from '@lit-labs/signals';
import { ViewMode } from '@shared/schemas/app.types';
// ==================== State Signals ====================
/** Currently selected node (null if none) */
export const selectedNode = signal(null);
/** Currently selected cluster ID (null if none) */
export const selectedCluster = signal(null);
/** Currently hovered node ID (null if none) */
export const hoveredNode = signal(null);
/** Detected circular dependency paths */
export const circularDependencies = signal([]);
// ==================== Highlight Toggle Signals ====================
/** Whether direct dependencies are highlighted */
export const highlightDirectDeps = signal(false);
/** Whether transitive dependencies are highlighted */
export const highlightTransitiveDeps = signal(false);
/** Whether direct dependents are highlighted */
export const highlightDirectDependents = signal(false);
/** Whether transitive dependents are highlighted */
export const highlightTransitiveDependents = signal(false);
// ==================== Computed Signals ====================
/** Current graph visualization mode, derived from highlight toggles */
export const viewMode = new Signal.Computed(() => {
    const anyDeps = highlightDirectDeps.get() || highlightTransitiveDeps.get();
    const anyDependents = highlightDirectDependents.get() || highlightTransitiveDependents.get();
    if (anyDeps && anyDependents)
        return ViewMode.Both;
    if (anyDeps)
        return ViewMode.Focused;
    if (anyDependents)
        return ViewMode.Dependents;
    return ViewMode.Full;
});
/** Check if any node or cluster is currently selected */
export const hasSelection = new Signal.Computed(() => selectedNode.get() !== null || selectedCluster.get() !== null);
/**
 * Factory to create a computed signal that checks if a specific node is selected
 * @param nodeId - The node ID to check
 * @returns A computed signal that returns true if the node is selected
 */
export function createIsNodeSelected(nodeId) {
    return new Signal.Computed(() => selectedNode.get()?.id === nodeId);
}
// ==================== Reset Utility ====================
/**
 * Reset all graph signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetGraphSignals() {
    selectedNode.set(null);
    selectedCluster.set(null);
    hoveredNode.set(null);
    highlightDirectDeps.set(false);
    highlightTransitiveDeps.set(false);
    highlightDirectDependents.set(false);
    highlightTransitiveDependents.set(false);
    circularDependencies.set([]);
}
//# sourceMappingURL=graph.signals.js.map
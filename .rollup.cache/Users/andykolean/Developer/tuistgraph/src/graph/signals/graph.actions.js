/**
 * Graph Actions - State mutation functions for graph signals
 *
 * Contains all actions for modifying graph selection and view state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/graph.actions
 */
import { circularDependencies, highlightDirectDependents, highlightDirectDeps, highlightTransitiveDependents, highlightTransitiveDeps, hoveredNode, selectedCluster, selectedNode, } from './graph.signals';
// ==================== Basic Actions ====================
/**
 * Select a node (clears cluster selection)
 * @param node - The node to select, or null to deselect
 */
export function selectNode(node) {
    selectedNode.set(node);
    selectedCluster.set(null);
    if (node) {
        // Auto-enable direct deps/dependents when selecting a node
        highlightDirectDeps.set(true);
        highlightDirectDependents.set(true);
        highlightTransitiveDeps.set(false);
        highlightTransitiveDependents.set(false);
    }
    else {
        resetHighlightToggles();
    }
}
/**
 * Select a cluster (clears node selection)
 * @param clusterId - The cluster ID to select, or null to deselect
 */
export function selectCluster(clusterId) {
    selectedCluster.set(clusterId);
    selectedNode.set(null);
    if (clusterId) {
        highlightDirectDeps.set(true);
        highlightDirectDependents.set(true);
        highlightTransitiveDeps.set(false);
        highlightTransitiveDependents.set(false);
    }
    else {
        resetHighlightToggles();
    }
}
/**
 * Set the hovered node for highlighting (throttled via RAF)
 * @param nodeId - The node ID to highlight, or null to clear
 */
let pendingHoverUpdate;
let hoverRafId = null;
export function setHoveredNode(nodeId) {
    // Store the pending update
    pendingHoverUpdate = nodeId;
    // Cancel previous RAF if pending
    if (hoverRafId !== null)
        return;
    // Schedule update for next frame
    hoverRafId = requestAnimationFrame(() => {
        hoveredNode.set(pendingHoverUpdate ?? null);
        hoverRafId = null;
        pendingHoverUpdate = undefined;
    });
}
/**
 * Update detected circular dependencies
 * @param cycles - Array of circular dependency paths
 */
export function setCircularDependencies(cycles) {
    circularDependencies.set(cycles);
}
// ==================== Highlight Toggle Actions ====================
/**
 * Toggle a highlight card on/off
 * @param card - Which highlight card to toggle
 */
export function toggleHighlight(card) {
    switch (card) {
        case 'direct-deps':
            highlightDirectDeps.set(!highlightDirectDeps.get());
            break;
        case 'transitive-deps':
            highlightTransitiveDeps.set(!highlightTransitiveDeps.get());
            break;
        case 'direct-dependents':
            highlightDirectDependents.set(!highlightDirectDependents.get());
            break;
        case 'transitive-dependents':
            highlightTransitiveDependents.set(!highlightTransitiveDependents.get());
            break;
    }
}
/**
 * Reset all highlight toggles to false
 */
export function resetHighlightToggles() {
    highlightDirectDeps.set(false);
    highlightTransitiveDeps.set(false);
    highlightDirectDependents.set(false);
    highlightTransitiveDependents.set(false);
}
// ==================== Complex Actions ====================
/**
 * Reset to full view with no selection
 */
export function resetView() {
    selectedNode.set(null);
    selectedCluster.set(null);
    resetHighlightToggles();
}
//# sourceMappingURL=graph.actions.js.map
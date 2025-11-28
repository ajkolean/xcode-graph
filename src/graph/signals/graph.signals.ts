/**
 * Graph Signals - Selection and view state management
 *
 * Manages the currently selected node/cluster, view mode, and
 * circular dependency detection. Uses Lit Signals for reactive state.
 *
 * @module signals/graph
 */

import { Signal, signal } from '@lit-labs/signals';
import { ViewMode } from '@shared/schemas/app.schema';
import type { GraphNode } from '@shared/schemas/graph.schema';

// ==================== State Signals ====================

/** Currently selected node (null if none) */
export const selectedNode = signal<GraphNode | null>(null);

/** Currently selected cluster ID (null if none) */
export const selectedCluster = signal<string | null>(null);

/** Currently hovered node ID (null if none) */
export const hoveredNode = signal<string | null>(null);

/** Current graph visualization mode */
export const viewMode = signal<ViewMode>(ViewMode.Full);

/** Detected circular dependency paths */
export const circularDependencies = signal<string[][]>([]);

// ==================== Computed Signals ====================

/** Check if any node or cluster is currently selected */
export const hasSelection = new Signal.Computed(
  () => selectedNode.get() !== null || selectedCluster.get() !== null,
);

/**
 * Factory to create a computed signal that checks if a specific node is selected
 * @param nodeId - The node ID to check
 * @returns A computed signal that returns true if the node is selected
 */
export function createIsNodeSelected(nodeId: string): Signal.Computed<boolean> {
  return new Signal.Computed(() => selectedNode.get()?.id === nodeId);
}

// ==================== Reset Utility ====================

/**
 * Reset all graph signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetGraphSignals(): void {
  selectedNode.set(null);
  selectedCluster.set(null);
  hoveredNode.set(null);
  viewMode.set(ViewMode.Full);
  circularDependencies.set([]);
}

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
export const selectedNode: Signal.State<GraphNode | null> = signal<GraphNode | null>(null);

/** Currently selected cluster ID (null if none) */
export const selectedCluster: Signal.State<string | null> = signal<string | null>(null);

/** Currently hovered node ID (null if none) */
export const hoveredNode: Signal.State<string | null> = signal<string | null>(null);

/** Current graph visualization mode */
export const viewMode: Signal.State<ViewMode> = signal<ViewMode>(ViewMode.Full);

/** Detected circular dependency paths */
export const circularDependencies: Signal.State<string[][]> = signal<string[][]>([]);

/** Chain display mode: 'direct' filters to chain only, 'highlight' shows all with depth-based alpha */
export type ChainDisplayMode = 'direct' | 'highlight';
export const chainDisplayMode: Signal.State<ChainDisplayMode> = signal<ChainDisplayMode>('direct');

// ==================== Computed Signals ====================

/** Check if any node or cluster is currently selected */
export const hasSelection: Signal.Computed<boolean> = new Signal.Computed(
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
  chainDisplayMode.set('direct');
}

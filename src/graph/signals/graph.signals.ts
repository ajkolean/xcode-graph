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
import type { GraphNode } from '@shared/schemas/graph.types';

/** Currently selected node (null if none) */
export const selectedNode: Signal.State<GraphNode | null> = signal<GraphNode | null>(null);

/** Currently selected cluster ID (null if none) */
export const selectedCluster: Signal.State<string | null> = signal<string | null>(null);

/** Currently hovered node ID (null if none) */
export const hoveredNode: Signal.State<string | null> = signal<string | null>(null);

/** Detected circular dependency paths */
export const circularDependencies: Signal.State<string[][]> = signal<string[][]>([]);

/** Whether direct dependencies are highlighted */
export const highlightDirectDeps: Signal.State<boolean> = signal<boolean>(false);

/** Whether transitive dependencies are highlighted */
export const highlightTransitiveDeps: Signal.State<boolean> = signal<boolean>(false);

/** Whether direct dependents are highlighted */
export const highlightDirectDependents: Signal.State<boolean> = signal<boolean>(false);

/** Whether transitive dependents are highlighted */
export const highlightTransitiveDependents: Signal.State<boolean> = signal<boolean>(false);

/** Current graph visualization mode, derived from highlight toggles */
export const viewMode: Signal.Computed<ViewMode> = new Signal.Computed(() => {
  const anyDeps = highlightDirectDeps.get() || highlightTransitiveDeps.get();
  const anyDependents = highlightDirectDependents.get() || highlightTransitiveDependents.get();

  if (anyDeps && anyDependents) return ViewMode.Both;
  if (anyDeps) return ViewMode.Focused;
  if (anyDependents) return ViewMode.Dependents;
  return ViewMode.Full;
});

/** Check if any node or cluster is currently selected */
export const hasSelection: Signal.Computed<boolean> = new Signal.Computed(
  () => selectedNode.get() !== null || selectedCluster.get() !== null,
);

/** Factory to create a computed signal that checks if a specific node is selected */
export function createIsNodeSelected(nodeId: string): Signal.Computed<boolean> {
  return new Signal.Computed(() => selectedNode.get()?.id === nodeId);
}

/**
 * Reset all graph signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetGraphSignals(): void {
  selectedNode.set(null);
  selectedCluster.set(null);
  hoveredNode.set(null);
  highlightDirectDeps.set(false);
  highlightTransitiveDeps.set(false);
  highlightDirectDependents.set(false);
  highlightTransitiveDependents.set(false);
  circularDependencies.set([]);
}

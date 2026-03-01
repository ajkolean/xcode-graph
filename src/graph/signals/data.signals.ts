/**
 * Data Signals - Graph data source state
 *
 * Manages the source graph data (nodes and edges).
 * Computed signals for derived state are in display.computed.ts.
 *
 * @module signals/data
 */

import { type Signal, signal } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';

/** All graph nodes */
export const nodes: Signal.State<GraphNode[]> = signal<GraphNode[]>([]);

/** All graph edges */
export const edges: Signal.State<GraphEdge[]> = signal<GraphEdge[]>([]);

/**
 * Reset all data signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetDataSignals(): void {
  nodes.set([]);
  edges.set([]);
}

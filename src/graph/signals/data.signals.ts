/**
 * Data Signals - Graph data source state
 *
 * Manages the source graph data (nodes and edges).
 * Computed signals for derived state are in display.computed.ts.
 *
 * @module signals/data
 */

import { signal } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';

// ==================== State Signals ====================

/** All graph nodes */
export const nodes = signal<GraphNode[]>([]);

/** All graph edges */
export const edges = signal<GraphEdge[]>([]);

// ==================== Reset Utility ====================

/**
 * Reset all data signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetDataSignals(): void {
  nodes.set([]);
  edges.set([]);
}

/**
 * Data Signals - Graph data source state
 *
 * Manages the source graph data (nodes and edges).
 * Computed signals for derived state are in display.computed.ts.
 *
 * @module signals/data
 */
import { type Signal } from '@lit-labs/signals';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
/** All graph nodes */
export declare const nodes: Signal.State<GraphNode[]>;
/** All graph edges */
export declare const edges: Signal.State<GraphEdge[]>;
/**
 * Reset all data signals to their initial state.
 * Useful for testing and cleanup.
 */
export declare function resetDataSignals(): void;
//# sourceMappingURL=data.signals.d.ts.map
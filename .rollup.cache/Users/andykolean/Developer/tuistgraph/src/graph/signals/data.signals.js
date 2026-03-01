/**
 * Data Signals - Graph data source state
 *
 * Manages the source graph data (nodes and edges).
 * Computed signals for derived state are in display.computed.ts.
 *
 * @module signals/data
 */
import { signal } from '@lit-labs/signals';
// ==================== State Signals ====================
/** All graph nodes */
export const nodes = signal([]);
/** All graph edges */
export const edges = signal([]);
// ==================== Reset Utility ====================
/**
 * Reset all data signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetDataSignals() {
    nodes.set([]);
    edges.set([]);
}
//# sourceMappingURL=data.signals.js.map
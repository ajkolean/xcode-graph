/**
 * UI Signals - User interface state management
 *
 * Manages UI-specific state including active tab, zoom level,
 * animation toggle, and preview filter highlights.
 *
 * @module signals/ui
 */
import { signal } from '@lit-labs/signals';
import { DEFAULT_ACTIVE_TAB } from '@shared/schemas';
// ==================== State Signals ====================
/** Currently active application tab */
export const activeTab = signal(DEFAULT_ACTIVE_TAB);
/** Current zoom level (0.2 - 2.0) */
export const zoom = signal(1);
/** Base zoom level (scale factor that fits the graph) */
export const baseZoom = signal(1);
/** Whether layout animation is enabled */
export const enableAnimation = signal(false);
/** Current preview filter for hover effects */
export const previewFilter = signal(null);
// ==================== Reset Utility ====================
/**
 * Reset all UI signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetUISignals() {
    activeTab.set(DEFAULT_ACTIVE_TAB);
    zoom.set(1);
    baseZoom.set(1);
    enableAnimation.set(false);
    previewFilter.set(null);
}
//# sourceMappingURL=ui.signals.js.map
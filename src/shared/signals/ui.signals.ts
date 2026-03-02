/**
 * UI Signals - User interface state management
 *
 * Manages UI-specific state including active tab, zoom level,
 * animation toggle, and preview filter highlights.
 *
 * @module signals/ui
 */

import { type Signal, signal } from '@lit-labs/signals';
import { type ActiveTab, DEFAULT_ACTIVE_TAB } from '@shared/schemas';

/**
 * Preview filter for hover highlights
 *
 * When hovering over filter options, shows which nodes would be affected
 *
 * @public
 */
export type PreviewFilter = {
  /** Type of filter being previewed */
  type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
  /** Value being previewed */
  value: string;
} | null;

/**
 * Currently active application tab
 *
 * @public
 */
export const activeTab: Signal.State<ActiveTab> = signal<ActiveTab>(DEFAULT_ACTIVE_TAB);

/**
 * Current zoom level (0.2 - 2.0)
 *
 * @public
 */
export const zoom: Signal.State<number> = signal<number>(1);

/**
 * Base zoom level (scale factor that fits the graph)
 *
 * @public
 */
export const baseZoom: Signal.State<number> = signal<number>(1);

/**
 * Whether layout animation is enabled
 *
 * @public
 */
export const enableAnimation: Signal.State<boolean> = signal<boolean>(false);

/**
 * Current preview filter for hover effects
 *
 * @public
 */
export const previewFilter: Signal.State<PreviewFilter> = signal<PreviewFilter>(null);

/**
 * Reset all UI signals to their initial state.
 * Useful for testing and cleanup.
 *
 * @public
 */
export function resetUISignals(): void {
  activeTab.set(DEFAULT_ACTIVE_TAB);
  zoom.set(1);
  baseZoom.set(1);
  enableAnimation.set(false);
  previewFilter.set(null);
}

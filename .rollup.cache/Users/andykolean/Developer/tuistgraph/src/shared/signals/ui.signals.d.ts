/**
 * UI Signals - User interface state management
 *
 * Manages UI-specific state including active tab, zoom level,
 * animation toggle, and preview filter highlights.
 *
 * @module signals/ui
 */
import { type Signal } from '@lit-labs/signals';
import { type ActiveTab } from '@shared/schemas';
/**
 * Preview filter for hover highlights
 *
 * When hovering over filter options, shows which nodes would be affected
 */
export type PreviewFilter = {
    /** Type of filter being previewed */
    type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
    /** Value being previewed */
    value: string;
} | null;
/** Currently active application tab */
export declare const activeTab: Signal.State<ActiveTab>;
/** Current zoom level (0.2 - 2.0) */
export declare const zoom: Signal.State<number>;
/** Base zoom level (scale factor that fits the graph) */
export declare const baseZoom: Signal.State<number>;
/** Whether layout animation is enabled */
export declare const enableAnimation: Signal.State<boolean>;
/** Current preview filter for hover effects */
export declare const previewFilter: Signal.State<PreviewFilter>;
/**
 * Reset all UI signals to their initial state.
 * Useful for testing and cleanup.
 */
export declare function resetUISignals(): void;

/**
 * UI Actions - State mutation functions for UI signals
 *
 * Contains all actions for modifying UI state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/ui.actions
 */
import type { ActiveTab } from '@shared/schemas';
import { type PreviewFilter } from './ui.signals';
/**
 * Change the active tab
 * @param tab - The tab to activate
 */
export declare function setActiveTab(tab: ActiveTab): void;
/**
 * Set zoom level (clamped to 0.1-5.0)
 * @param value - The new zoom level
 */
export declare function setZoom(value: number): void;
/**
 * Increase zoom by 0.1
 */
export declare function zoomIn(): void;
/**
 * Decrease zoom by 0.1
 */
export declare function zoomOut(): void;
/**
 * Reset zoom to 1.0
 */
export declare function resetZoom(): void;
/**
 * Set base zoom level (fit scale)
 * @param value - The base scale factor
 */
export declare function setBaseZoom(value: number): void;
/**
 * Toggle animation on/off
 */
export declare function toggleAnimation(): void;
/**
 * Set animation enabled state
 * @param enabled - Whether animation should be enabled
 */
export declare function setEnableAnimation(enabled: boolean): void;
/**
 * Set preview filter for hover effects
 * @param preview - The preview filter state, or null to clear
 */
export declare function setPreviewFilter(preview: PreviewFilter): void;
//# sourceMappingURL=ui.actions.d.ts.map
/**
 * UI Actions - State mutation functions for UI signals
 *
 * Contains all actions for modifying UI state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/ui.actions
 */

import type { ActiveTab } from '@shared/schemas';
import { ZOOM_CONFIG } from '@/ui/utils/zoom-constants';
import {
  activeTab,
  baseZoom,
  enableAnimation,
  type PreviewFilter,
  previewFilter,
  zoom,
} from './ui.signals';

// ==================== Tab Actions ====================

/**
 * Change the active tab
 * @param tab - The tab to activate
 */
export function setActiveTab(tab: ActiveTab): void {
  activeTab.set(tab);
}

// ==================== Zoom Actions ====================

/**
 * Set zoom level (clamped to 0.1-5.0)
 * @param value - The new zoom level
 */
export function setZoom(value: number): void {
  zoom.set(Math.max(ZOOM_CONFIG.MIN_ZOOM, Math.min(ZOOM_CONFIG.MAX_ZOOM, value)));
}

/**
 * Increase zoom by 0.1
 */
export function zoomIn(): void {
  zoom.set(Math.min(ZOOM_CONFIG.MAX_ZOOM, zoom.get() + 0.1));
}

/**
 * Decrease zoom by 0.1
 */
export function zoomOut(): void {
  zoom.set(Math.max(ZOOM_CONFIG.MIN_ZOOM, zoom.get() - 0.1));
}

/**
 * Reset zoom to 1.0
 */
export function resetZoom(): void {
  zoom.set(1);
}

/**
 * Set base zoom level (fit scale)
 * @param value - The base scale factor
 */
export function setBaseZoom(value: number): void {
  baseZoom.set(value);
}

// ==================== Animation Actions ====================

/**
 * Toggle animation on/off
 */
export function toggleAnimation(): void {
  enableAnimation.set(!enableAnimation.get());
}

/**
 * Set animation enabled state
 * @param enabled - Whether animation should be enabled
 */
export function setEnableAnimation(enabled: boolean): void {
  enableAnimation.set(enabled);
}

// ==================== Preview Filter Actions ====================

/**
 * Set preview filter for hover effects
 * @param preview - The preview filter state, or null to clear
 */
export function setPreviewFilter(preview: PreviewFilter): void {
  previewFilter.set(preview);
}

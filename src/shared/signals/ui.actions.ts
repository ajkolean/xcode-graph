/**
 * UI Actions - State mutation functions for UI signals
 *
 * Contains all actions for modifying UI state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/ui.actions
 */

import type { ActiveTab } from '@shared/schemas';
import type { LayoutDimension } from '@/graph/layout/d3-layout';
import {
  activeTab,
  enableAnimation,
  layoutDimension,
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
  zoom.set(Math.max(0.1, Math.min(5, value)));
}

/**
 * Increase zoom by 0.1
 */
export function zoomIn(): void {
  zoom.set(Math.min(2, zoom.get() + 0.1));
}

/**
 * Decrease zoom by 0.1
 */
export function zoomOut(): void {
  zoom.set(Math.max(0.2, zoom.get() - 0.1));
}

/**
 * Reset zoom to 1.0
 */
export function resetZoom(): void {
  zoom.set(1);
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

// ==================== Layout Dimension Actions ====================

/**
 * Toggle between 2D and 3D layout
 */
export function toggleLayoutDimension(): void {
  layoutDimension.set(layoutDimension.get() === '2d' ? '3d' : '2d');
}

/**
 * Set layout dimension explicitly
 * @param dimension - The layout dimension ('2d' or '3d')
 */
export function setLayoutDimension(dimension: LayoutDimension): void {
  layoutDimension.set(dimension);
}

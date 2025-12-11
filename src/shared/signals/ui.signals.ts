/**
 * UI Signals - User interface state management
 *
 * Manages UI-specific state including active tab, zoom level,
 * animation toggle, and preview filter highlights.
 *
 * @module signals/ui
 */

import { signal } from '@lit-labs/signals';
import { type ActiveTab, DEFAULT_ACTIVE_TAB } from '@shared/schemas';
import type { LayoutDimension } from '@/graph/layout/d3-layout';

// ==================== Types ====================

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

// ==================== State Signals ====================

/** Currently active application tab */
export const activeTab = signal<ActiveTab>(DEFAULT_ACTIVE_TAB);

/** Current zoom level (0.2 - 2.0) */
export const zoom = signal<number>(1);

/** Whether layout animation is enabled */
export const enableAnimation = signal<boolean>(false);

/** Current preview filter for hover effects */
export const previewFilter = signal<PreviewFilter>(null);

/** Layout dimension: 2D or 3D */
export const layoutDimension = signal<LayoutDimension>('2d');

// ==================== Reset Utility ====================

/**
 * Reset all UI signals to their initial state.
 * Useful for testing and cleanup.
 */
export function resetUISignals(): void {
  activeTab.set(DEFAULT_ACTIVE_TAB);
  zoom.set(1);
  enableAnimation.set(false);
  previewFilter.set(null);
  layoutDimension.set('2d');
}

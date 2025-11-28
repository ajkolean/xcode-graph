/**
 * UI Store - User interface state management
 *
 * Manages UI-specific state including active tab, zoom level,
 * animation toggle, and preview filter highlights.
 *
 * @module stores/uiStore
 */

import { create } from 'zustand';
import { type ActiveTab, DEFAULT_ACTIVE_TAB } from '@/schemas';

export type { ActiveTab };

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

/**
 * UI store state and actions
 */
export interface UIStore {
  /** Currently active application tab */
  activeTab: ActiveTab;
  /** Current zoom level (0.2 - 2.0) */
  zoom: number;
  /** Whether layout animation is enabled */
  enableAnimation: boolean;
  /** Current preview filter for hover effects */
  previewFilter: PreviewFilter;

  // ==================== Actions ====================
  /** Change active tab */
  setActiveTab: (tab: ActiveTab) => void;
  /** Set zoom level (clamped to 0.2-2.0) */
  setZoom: (zoom: number) => void;
  /** Increase zoom by 0.1 */
  zoomIn: () => void;
  /** Decrease zoom by 0.1 */
  zoomOut: () => void;
  /** Reset zoom to 1.0 */
  resetZoom: () => void;
  /** Toggle animation on/off */
  toggleAnimation: () => void;
  /** Set animation enabled state */
  setEnableAnimation: (enabled: boolean) => void;
  /** Set preview filter for hover effects */
  setPreviewFilter: (preview: PreviewFilter) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: DEFAULT_ACTIVE_TAB,
  zoom: 1,
  enableAnimation: false,
  previewFilter: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(2, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(2, s.zoom + 0.1) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.2, s.zoom - 0.1) })),
  resetZoom: () => set({ zoom: 1 }),
  toggleAnimation: () => set((s) => ({ enableAnimation: !s.enableAnimation })),
  setEnableAnimation: (enabled) => set({ enableAnimation: enabled }),
  setPreviewFilter: (preview) => set({ previewFilter: preview }),
}));

// ==================== Optimized Selectors ====================

/** Get current active tab */
export const useActiveTab = () => useUIStore((s) => s.activeTab);
/** Get current zoom level */
export const useZoom = () => useUIStore((s) => s.zoom);
/** Get animation enabled state */
export const useEnableAnimation = () => useUIStore((s) => s.enableAnimation);
/** Get current preview filter */
export const usePreviewFilter = () => useUIStore((s) => s.previewFilter);

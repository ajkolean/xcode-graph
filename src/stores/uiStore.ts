import { create } from 'zustand';

// Re-define ActiveTab to avoid circular dependency
export type ActiveTab =
  | 'overview'
  | 'builds'
  | 'test-runs'
  | 'module-cache'
  | 'xcode-cache'
  | 'previews'
  | 'qa'
  | 'bundles'
  | 'graph';

export type PreviewFilter = {
  type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
  value: string;
} | null;

interface UIStore {
  activeTab: ActiveTab;
  zoom: number;
  enableAnimation: boolean;
  previewFilter: PreviewFilter;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleAnimation: () => void;
  setEnableAnimation: (enabled: boolean) => void;
  setPreviewFilter: (preview: PreviewFilter) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'graph',
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

// Selectors for optimized subscriptions
export const useActiveTab = () => useUIStore((s) => s.activeTab);
export const useZoom = () => useUIStore((s) => s.zoom);
export const useEnableAnimation = () => useUIStore((s) => s.enableAnimation);
export const usePreviewFilter = () => useUIStore((s) => s.previewFilter);

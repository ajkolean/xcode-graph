/**
 * Viewport Tracking Utilities
 *
 * Reactive viewport state management for virtual rendering.
 * Tracks pan, zoom, and viewport dimensions efficiently.
 */

import { create } from 'zustand';
import type { ViewportBounds } from './viewport-culling';
import { calculateViewportBounds } from './viewport-culling';

export interface ViewportState {
  // SVG dimensions
  width: number;
  height: number;

  // Transform
  panX: number;
  panY: number;
  zoom: number;

  // Computed bounds (cached)
  bounds: ViewportBounds;

  // Actions
  setDimensions: (width: number, height: number) => void;
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  setTransform: (panX: number, panY: number, zoom: number) => void;
  updateBounds: () => void;
}

/**
 * Viewport store for reactive viewport tracking
 * Used by virtual rendering to efficiently track what's visible
 */
export const useViewportStore = create<ViewportState>((set, get) => ({
  width: 1000,
  height: 800,
  panX: 0,
  panY: 0,
  zoom: 1,
  bounds: { minX: -200, maxX: 1200, minY: -200, maxY: 1000, margin: 200 },

  setDimensions: (width, height) => {
    set({ width, height });
    get().updateBounds();
  },

  setPan: (panX, panY) => {
    set({ panX, panY });
    get().updateBounds();
  },

  setZoom: (zoom) => {
    set({ zoom });
    get().updateBounds();
  },

  setTransform: (panX, panY, zoom) => {
    set({ panX, panY, zoom });
    get().updateBounds();
  },

  updateBounds: () => {
    const { width, height, panX, panY, zoom } = get();
    const bounds = calculateViewportBounds(width, height, panX, panY, zoom, 200);
    set({ bounds });
  },
}));

/**
 * ResizeObserver-based viewport dimension tracking
 * Automatically updates viewport store when SVG resizes
 */
export class ViewportTracker {
  private resizeObserver: ResizeObserver | null = null;
  private element: HTMLElement | SVGElement | null = null;

  /**
   * Start tracking an element's dimensions
   */
  observe(element: HTMLElement | SVGElement) {
    this.element = element;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        useViewportStore.getState().setDimensions(width, height);
      }
    });

    this.resizeObserver.observe(element);

    // Set initial dimensions
    const rect = element.getBoundingClientRect();
    useViewportStore.getState().setDimensions(rect.width, rect.height);
  }

  /**
   * Stop tracking
   */
  disconnect() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.element = null;
  }
}

/**
 * Debounced viewport update
 * Prevents excessive re-renders during rapid pan/zoom
 */
export class DebouncedViewportUpdater {
  private timeoutId: number | null = null;
  private delay: number;

  constructor(delay = 16) {
    // ~60fps
    this.delay = delay;
  }

  /**
   * Schedule a viewport update (debounced)
   */
  scheduleUpdate(panX: number, panY: number, zoom: number) {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      useViewportStore.getState().setTransform(panX, panY, zoom);
      this.timeoutId = null;
    }, this.delay);
  }

  /**
   * Force immediate update (skip debounce)
   */
  immediateUpdate(panX: number, panY: number, zoom: number) {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    useViewportStore.getState().setTransform(panX, panY, zoom);
  }

  /**
   * Cancel pending updates
   */
  cancel() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Calculate if an entity should be rendered based on distance from viewport
 * Uses LOD (Level of Detail) strategy
 */
export function calculateLOD(
  distanceFromViewportCenter: number,
  viewportDiagonal: number,
): 'high' | 'medium' | 'low' | 'hidden' {
  const ratio = distanceFromViewportCenter / viewportDiagonal;

  if (ratio < 0.5) return 'high'; // Near center - full detail
  if (ratio < 1.0) return 'medium'; // In viewport - medium detail
  if (ratio < 1.5) return 'low'; // Just outside - low detail
  return 'hidden'; // Far away - don't render
}

/**
 * Get viewport center point
 */
export function getViewportCenter(bounds: ViewportBounds): { x: number; y: number } {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/**
 * Calculate distance from point to viewport center
 */
export function distanceToViewportCenter(
  point: { x: number; y: number },
  bounds: ViewportBounds,
): number {
  const center = getViewportCenter(bounds);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return Math.sqrt(dx * dx + dy * dy);
}

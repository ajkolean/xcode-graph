import type { ClusterPosition } from '@shared/schemas/simulation.types';
import { ZOOM_CONFIG } from '@shared/utils/zoom-config';

/** Result of a fit-to-viewport calculation. */
export interface FitResult {
  zoom: number;
  pan: { x: number; y: number };
}

/**
 * Computes the zoom and pan values needed to fit all clusters within the
 * given viewport rectangle with padding.
 *
 * @returns The computed zoom and pan, or null if no clusters are available
 */
export function computeFitToViewport(
  clusterPositions: ReadonlyMap<string, ClusterPosition>,
  viewportWidth: number,
  viewportHeight: number,
): FitResult | null {
  if (clusterPositions.size === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  clusterPositions.forEach((pos) => {
    const halfW = pos.width / 2;
    const halfH = pos.height / 2;
    minX = Math.min(minX, pos.x - halfW);
    maxX = Math.max(maxX, pos.x + halfW);
    minY = Math.min(minY, pos.y - halfH);
    maxY = Math.max(maxY, pos.y + halfH);
  });

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  )
    return null;

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;
  const padding = 40;
  const scaleX = (viewportWidth - padding * 2) / graphWidth;
  const scaleY = (viewportHeight - padding * 2) / graphHeight;
  const fitZoom = Math.max(ZOOM_CONFIG.MIN_ZOOM, Math.min(1.5, Math.min(scaleX, scaleY)));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    zoom: fitZoom,
    pan: {
      x: viewportWidth / 2 - centerX * fitZoom,
      y: viewportHeight / 2 - centerY * fitZoom,
    },
  };
}

/** Converts screen (pixel) coordinates to world (graph) coordinates. */
export function screenToWorld(
  screenX: number,
  screenY: number,
  pan: { x: number; y: number },
  zoom: number,
): { x: number; y: number } {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

/** Returns the mouse position relative to the canvas element's bounding rect. */
export function getCanvasMousePos(e: MouseEvent, canvasRect: DOMRect): { x: number; y: number } {
  return {
    x: e.clientX - canvasRect.left,
    y: e.clientY - canvasRect.top,
  };
}

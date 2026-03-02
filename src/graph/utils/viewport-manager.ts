import type { ClusterPosition } from '@shared/schemas';
import { ZOOM_CONFIG } from '@shared/utils/zoom-config';

/** Input context for viewport fitting calculations */
export interface ViewportContext {
  /** Bounding rectangle of the canvas element */
  rect: DOMRect;
  /** Current cluster positions in world coordinates */
  clusterPositions: Map<string, ClusterPosition>;
}

/** Result of a viewport fit calculation */
export interface ViewportFitResult {
  /** Computed zoom level */
  zoom: number;
  /** Horizontal pan offset (pixels) */
  panX: number;
  /** Vertical pan offset (pixels) */
  panY: number;
}

/**
 * Calculate the initial pan position to center the graph.
 *
 * @param rect - Canvas bounding rectangle
 * @returns Center point of the rectangle
 */
export function centerGraph(rect: DOMRect): { x: number; y: number } {
  return { x: rect.width / 2, y: rect.height / 2 };
}

/**
 * Calculate zoom and pan to fit all clusters within the viewport.
 * Returns null if cluster positions are empty or contain non-finite values.
 *
 * @param ctx - Viewport context with canvas rect and cluster positions
 * @returns Zoom and pan values to fit all clusters, or null if fitting is not possible
 */
export function fitToViewport(ctx: ViewportContext): ViewportFitResult | null {
  if (!ctx.clusterPositions.size) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  ctx.clusterPositions.forEach((pos) => {
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
    /* v8 ignore next */
    return null;

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;
  const padding = 40;
  const scaleX = (ctx.rect.width - padding * 2) / graphWidth;
  const scaleY = (ctx.rect.height - padding * 2) / graphHeight;
  const zoom = Math.max(ZOOM_CONFIG.MIN_ZOOM, Math.min(1.5, Math.min(scaleX, scaleY)));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    zoom,
    panX: ctx.rect.width / 2 - centerX * zoom,
    panY: ctx.rect.height / 2 - centerY * zoom,
  };
}

/**
 * Convert screen coordinates to world coordinates.
 *
 * @param screenX - Screen X position (pixels)
 * @param screenY - Screen Y position (pixels)
 * @param panX - Current horizontal pan offset
 * @param panY - Current vertical pan offset
 * @param zoom - Current zoom level
 * @returns World coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  panX: number,
  panY: number,
  zoom: number,
): { x: number; y: number } {
  return {
    x: (screenX - panX) / zoom,
    y: (screenY - panY) / zoom,
  };
}

/**
 * Get mouse position relative to a canvas element.
 *
 * @param e - Mouse event
 * @param canvas - Canvas element to compute position relative to
 * @returns Position in canvas-local coordinates
 */
export function getMousePos(e: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

/**
 * Shared types for canvas drawing sub-modules.
 *
 * The DrawContext interface bundles per-frame rendering state so that
 * extracted draw functions remain pure (no reference to CanvasScene).
 */

import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewportBounds } from '@ui/utils/viewport';

/** Per-frame rendering context passed to every draw helper. */
export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  theme: CanvasTheme;
  zoom: number;
  time: number;
  viewport: ViewportBounds;
  dpr: number;
  pan: { x: number; y: number };
}

/**
 * Canvas Utilities - Barrel file
 *
 * Re-exports the public API from the canvas rendering module.
 * Note: Drawing helpers (canvas-draw-*) are internal to CanvasScene
 * and not re-exported.
 *
 * @module graph/components/canvas
 */

export {
  CanvasScene,
  type SceneCallbacks,
  type SceneConfig,
} from './canvas-scene';

export {
  computeFitToViewport,
  type FitResult,
  getCanvasMousePos,
  screenToWorld,
} from './canvas-viewport';

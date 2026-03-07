/**
 * Shared Utilities - Barrel file
 *
 * Re-exports all public utility functions, constants, and types
 * from the shared/utils directory.
 *
 * @module shared/utils
 */

export { addToMultiMap, getOrDefault, range, resolveDefaults, times } from './collections';

export { getIcon, type IconName, iconNames, icons } from './icon-adapter';

export { adjacentPairs, pairwise } from './pairwise';

export { createTypedMachine } from './zag-helpers';

export {
  CLUSTER_LABEL_CONFIG,
  LOD_THRESHOLDS,
  normalizeZoom,
  ZOOM_CONFIG,
  ZOOM_LIGHTNESS_ADJUSTMENT,
  ZOOM_OPACITY,
  ZOOM_SATURATION,
  ZOOM_STROKE_WIDTH,
} from './zoom-config';

/**
 * Rendering Utilities Module
 *
 * Visual rendering utilities for graph visualization:
 * - Color generation and theming
 * - Zoom-aware visual adjustments
 * - Node and platform icons
 * - Sizing calculations
 * - Viewport culling for performance
 *
 * @module utils/rendering
 */
export { FILTER_ICON_COLOR } from './colors';
export { generateColor, generateColorPalette, generateColorWithAlpha, } from './color-generator';
export { adjustColorForZoom, adjustOpacityForZoom } from './zoom-colors';
export { getNodeTypeColor, getNodeTypeColorFromTheme, NODE_TYPE_COLORS } from './node-colors';
export { getNodeIconPath, getNodeTypeLabel } from './node-icons';
export { getPlatformColor, getPlatformIconPath, PLATFORM_COLOR } from './platform-icons';
export { getBaseNodeSize, getNodeSize } from './sizing';
export { calculateViewportBounds, isCircleInViewport, isLineInViewport, type ViewportBounds, } from './viewport';
export { generateBezierPath } from './paths';

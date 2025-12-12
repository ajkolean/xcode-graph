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

// ==================== Color Constants ====================

export { FILTER_ICON_COLOR } from "./colors";

// ==================== Color Generation ====================

export {
  generateColor,
  generateColorPalette,
  generateColorWithAlpha,
} from "./color-generator";

// ==================== Zoom Adjustments ====================

export { adjustColorForZoom, adjustOpacityForZoom } from "./zoom-colors";

// ==================== Node Theming ====================

export { getNodeTypeColor, NODE_TYPE_COLORS } from "./node-colors";

// ==================== Icons ====================

export { getNodeIconPath, getNodeTypeLabel } from "./node-icons";
export { getPlatformIconPath, PLATFORM_COLOR } from "./platform-icons";

// ==================== Sizing ====================

export { getBaseNodeSize, getNodeSize } from "./sizing";

// ==================== Viewport Culling ====================

export {
  calculateViewportBounds,
  isCircleInViewport,
  isLineInViewport,
  type ViewportBounds,
} from "./viewport";

// ==================== Path Generation ====================

export { generateBezierPath } from "./paths";

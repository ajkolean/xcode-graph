/**
 * GraphEdge Lit Component
 *
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-edge
 *     x1="100"
 *     y1="100"
 *     x2="200"
 *     y2="200"
 *     color="#8B5CF6"
 *     is-highlighted
 *     animated
 *   ></graph-edge>
 * </svg>
 * ```
 */

import { generateBezierPath } from '@ui/utils/paths';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { LitElement, svg } from 'lit';

export class GraphEdge extends LitElement {
  static override readonly properties = {
    x1: { type: Number },
    y1: { type: Number },
    x2: { type: Number },
    y2: { type: Number },
    color: { type: String },
    isHighlighted: { type: Boolean, attribute: 'is-highlighted' },
    isDependent: { type: Boolean, attribute: 'is-dependent' },
    opacity: { type: Number },
    zoom: { type: Number },
    animated: { type: Boolean },
  };

  // No Shadow DOM for SVG elements - must be in same SVG context
  protected override createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  declare x1: number | undefined;
  declare y1: number | undefined;
  declare x2: number | undefined;
  declare y2: number | undefined;
  declare color: string | undefined;
  declare isHighlighted: boolean | undefined;
  declare isDependent: boolean | undefined;
  declare opacity: number | undefined;
  declare zoom: number | undefined;
  declare animated: boolean | undefined;

  // ========================================
  // Render
  // ========================================

  override render() {
    const x1 = this.x1 ?? 0;
    const y1 = this.y1 ?? 0;
    const x2 = this.x2 ?? 0;
    const y2 = this.y2 ?? 0;
    const color = this.color ?? '#888';
    const zoom = this.zoom ?? 1;
    const opacity = this.opacity ?? 1;
    const isDependent = this.isDependent ?? false;
    const animated = this.animated ?? false;
    const isHighlighted = this.isHighlighted ?? false;

    // Calculate distance to determine if we should use bezier curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    const useBezier = distance > 150;

    // Adjust color based on zoom level
    const zoomAdjustedColor = adjustColorForZoom(color, zoom);

    // Base opacity: highlighted (0.8), normal (0.3)
    const baseOpacity = isHighlighted ? 0.8 : 0.3;
    const zoomOpacity = adjustOpacityForZoom(baseOpacity, zoom);
    const finalOpacity = zoomOpacity * opacity;

    // Cross-cluster = long dashes "8,4", Regular = short dashes "4,2"
    const dashPattern = isDependent ? '8,4' : '4,2';

    // Generate path (bezier curve or straight line)
    const path = useBezier ? generateBezierPath(x1, y1, x2, y2) : `M ${x1},${y1} L ${x2},${y2}`;

    return svg`
      <g class="graph-edge" style="transition: opacity var(--durations-slow) ease">
        ${
          isHighlighted
            ? svg`
                <path
                  d="${path}"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="3"
                  fill="none"
                  opacity="${adjustOpacityForZoom(0.3, zoom) * opacity}"
                  filter="url(#glow-strong)"
                  stroke-dasharray="${dashPattern}"
                  class="${animated ? 'flow-animation' : ''}"
                  shape-rendering="geometricPrecision"
                />
              `
            : ''
        }
        <path
          d="${path}"
          stroke="${zoomAdjustedColor}"
          stroke-width="${isHighlighted ? 2 : 1}"
          fill="none"
          opacity="${finalOpacity}"
          stroke-dasharray="${dashPattern}"
          class="${animated ? 'flow-animation' : ''}"
          shape-rendering="geometricPrecision"
          style="transition: opacity var(--durations-slow) ease, stroke-width var(--durations-normal) ease"
        />
      </g>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-edge': GraphEdge;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-edge')) {
  customElements.define('graph-edge', GraphEdge);
}

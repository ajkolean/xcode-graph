/**
 * GraphEdge Lit Component
 *
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @example
 * ```html
 * <svg>
 *   <xcode-graph-edge
 *     x1="100"
 *     y1="100"
 *     x2="200"
 *     y2="200"
 *     color="#8B5CF6"
 *     is-highlighted
 *     animated
 *   ></xcode-graph-edge>
 * </svg>
 * ```
 */

import { generateBezierPath } from '@ui/utils/paths';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { LitElement, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @summary SVG edge connection between graph nodes
 */
export class GraphEdge extends LitElement {
  // No Shadow DOM for SVG elements - must be in same SVG context
  protected override createRenderRoot(): this {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ type: Number })
  declare x1: number | undefined;

  @property({ type: Number })
  declare y1: number | undefined;

  @property({ type: Number })
  declare x2: number | undefined;

  @property({ type: Number })
  declare y2: number | undefined;

  @property({ type: String })
  declare color: string | undefined;

  @property({ type: Boolean, attribute: 'is-highlighted' })
  declare isHighlighted: boolean | undefined;

  @property({ type: Boolean, attribute: 'is-dependent' })
  declare isDependent: boolean | undefined;

  @property({ type: Number })
  declare opacity: number | undefined;

  @property({ type: Number })
  declare zoom: number | undefined;

  @property({ type: Boolean })
  declare animated: boolean | undefined;

  // ========================================
  // Render
  // ========================================

  private resolveEdgeProps() {
    return {
      x1: this.x1 ?? 0,
      y1: this.y1 ?? 0,
      x2: this.x2 ?? 0,
      y2: this.y2 ?? 0,
      color: this.color ?? '#888',
      zoom: this.zoom ?? 1,
      opacity: this.opacity ?? 1,
      isDependent: this.isDependent ?? false,
      animated: this.animated ?? false,
      isHighlighted: this.isHighlighted ?? false,
    };
  }

  override render(): TemplateResult {
    const { x1, y1, x2, y2, color, zoom, opacity, isDependent, animated, isHighlighted } =
      this.resolveEdgeProps();

    // Calculate distance to determine if we should use bezier curve
    const distance = Math.hypot(x2 - x1, y2 - y1);
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
    const animationClass = animated ? 'flow-animation' : '';

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
                  class="${animationClass}"
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
    'xcode-graph-edge': GraphEdge;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-edge')) {
  customElements.define('xcode-graph-edge', GraphEdge);
}

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

import { LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/zoomColorUtils';

export class GraphEdge extends LitElement {
  // No Shadow DOM for SVG elements - must be in same SVG context
  protected createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  @property({ type: Number })
  declare x1: number;

  @property({ type: Number })
  declare y1: number;

  @property({ type: Number })
  declare x2: number;

  @property({ type: Number })
  declare y2: number;

  @property({ type: String })
  declare color: string;

  @property({ type: Boolean, attribute: 'is-highlighted' })
  declare isHighlighted: boolean;

  @property({ type: Boolean, attribute: 'is-dependent' })
  isDependent: boolean = false;

  @property({ type: Number })
  opacity: number = 1.0;

  @property({ type: Number })
  zoom: number = 1.0;

  @property({ type: Boolean })
  animated: boolean = false;

  // ========================================
  // Helpers
  // ========================================

  private generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Control point offset (creates gentle curve)
    const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;

    // Control points for smooth S-curve
    const cx1 = x1 + offset;
    const cy1 = y1;
    const cx2 = x2 - offset;
    const cy2 = y2;

    return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
  }

  // ========================================
  // Render
  // ========================================

  render() {
    // Calculate distance to determine if we should use bezier curve
    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const useBezier = distance > 150;

    // Adjust color based on zoom level
    const zoomAdjustedColor = adjustColorForZoom(this.color, this.zoom);

    // Base opacity: highlighted (0.8), normal (0.3)
    const baseOpacity = this.isHighlighted ? 0.8 : 0.3;
    const zoomOpacity = adjustOpacityForZoom(baseOpacity, this.zoom);
    const finalOpacity = zoomOpacity * this.opacity;

    // Cross-cluster = long dashes "8,4", Regular = short dashes "4,2"
    const dashPattern = this.isDependent ? '8,4' : '4,2';

    // Generate path (bezier curve or straight line)
    const path = useBezier
      ? this.generateBezierPath(this.x1, this.y1, this.x2, this.y2)
      : `M ${this.x1},${this.y1} L ${this.x2},${this.y2}`;

    return svg`
      <g class="graph-edge" style="transition: opacity 0.3s ease">
        ${
          this.isHighlighted
            ? svg`
                <path
                  d="${path}"
                  stroke="${zoomAdjustedColor}"
                  stroke-width="3"
                  fill="none"
                  opacity="${adjustOpacityForZoom(0.3, this.zoom) * this.opacity}"
                  filter="url(#glow-strong)"
                  stroke-dasharray="${dashPattern}"
                  class="${this.animated ? 'flow-animation' : ''}"
                  shape-rendering="geometricPrecision"
                />
              `
            : ''
        }
        <path
          d="${path}"
          stroke="${zoomAdjustedColor}"
          stroke-width="${this.isHighlighted ? 2 : 1}"
          fill="none"
          opacity="${finalOpacity}"
          stroke-dasharray="${dashPattern}"
          class="${this.animated ? 'flow-animation' : ''}"
          shape-rendering="geometricPrecision"
          style="transition: opacity 0.3s ease, stroke-width 0.2s ease"
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

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
import { __decorate } from "tslib";
import { generateBezierPath } from '@ui/utils/paths';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { LitElement, svg } from 'lit';
import { property } from 'lit/decorators.js';
/**
 * SVG edge/connection between nodes in the graph visualization.
 * Supports bezier curves, animations, highlighting, and zoom adjustments.
 *
 * @summary SVG edge connection between graph nodes
 */
export class GraphEdge extends LitElement {
    // No Shadow DOM for SVG elements - must be in same SVG context
    createRenderRoot() {
        return this;
    }
    // ========================================
    // Render
    // ========================================
    resolveEdgeProps() {
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
    render() {
        const { x1, y1, x2, y2, color, zoom, opacity, isDependent, animated, isHighlighted } = this.resolveEdgeProps();
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
        return svg `
      <g class="graph-edge" style="transition: opacity var(--durations-slow) ease">
        ${isHighlighted
            ? svg `
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
            : ''}
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
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "x1", void 0);
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "y1", void 0);
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "x2", void 0);
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "y2", void 0);
__decorate([
    property({ type: String })
], GraphEdge.prototype, "color", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-highlighted' })
], GraphEdge.prototype, "isHighlighted", void 0);
__decorate([
    property({ type: Boolean, attribute: 'is-dependent' })
], GraphEdge.prototype, "isDependent", void 0);
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "opacity", void 0);
__decorate([
    property({ type: Number })
], GraphEdge.prototype, "zoom", void 0);
__decorate([
    property({ type: Boolean })
], GraphEdge.prototype, "animated", void 0);
// Register custom element with HMR support
if (!customElements.get('xcode-graph-edge')) {
    customElements.define('xcode-graph-edge', GraphEdge);
}
//# sourceMappingURL=graph-edge.js.map
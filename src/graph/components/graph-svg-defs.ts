/**
 * GraphSVGDefs Lit Component
 *
 * SVG definitions (filters, markers) used by the graph visualization.
 * Provides reusable filters and arrow markers for edges.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-svg-defs></graph-svg-defs>
 *   <!-- Other SVG content can reference the defined filters/markers -->
 * </svg>
 * ```
 */

import { html, LitElement, svg } from 'lit';
import { customElement } from 'lit/decorators.js';

export class GraphSVGDefs extends LitElement {
  // No Shadow DOM for SVG defs - they need to be in the same SVG context
  protected override createRenderRoot() {
    return this;
  }

  override render() {
    return svg`
      <defs>
        <!-- Glow filters -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Arrow markers -->
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="rgba(199, 204, 209, 0.4)" />
        </marker>
        <marker
          id="arrowhead-highlight"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6F2CFF" />
        </marker>
      </defs>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-svg-defs': GraphSVGDefs;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-svg-defs')) {
  customElements.define('graph-svg-defs', GraphSVGDefs);
}

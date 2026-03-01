/**
 * GraphSVGDefs Lit Component
 *
 * SVG definitions (filters, markers, reusable shapes) used by the graph visualization.
 * Provides reusable filters, arrow markers, and node shape templates for performance.
 *
 * Performance optimization: Node shapes are defined once and reused via <use> elements,
 * reducing DOM size and improving rendering performance for large graphs.
 *
 * @example
 * ```html
 * <svg>
 *   <graph-svg-defs></graph-svg-defs>
 *   <!-- Other SVG content can reference the defined filters/markers/shapes -->
 * </svg>
 * ```
 */

import { getNodeIconPath } from '@ui/utils/node-icons';
import { LitElement, svg, type TemplateResult } from 'lit';

/**
 * SVG definitions (filters, markers, reusable shapes) used by the graph visualization.
 * Provides reusable filters, arrow markers, and node shape templates for performance.
 *
 * @summary Reusable SVG defs for graph filters, markers, and shapes
 */
export class GraphSVGDefs extends LitElement {
  // No Shadow DOM for SVG defs - they need to be in the same SVG context
  protected override createRenderRoot(): this {
    return this;
  }

  override render(): TemplateResult {
    // Generate reusable node shapes for all type/platform combinations
    const nodeTypes = [
      'app',
      'framework',
      'library',
      'package',
      'testUnit',
      'testUi',
      'cli',
    ] as const;
    const platforms = ['iOS', 'macOS', 'tvOS', 'watchOS', 'visionOS'] as const;

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

        <!-- Reusable node icon shapes (performance optimization) -->
        ${nodeTypes.flatMap((type) =>
          platforms.map((platform) => {
            const iconPath = getNodeIconPath(type, platform);
            const shapeId = `node-icon-${type}-${platform}`;
            return svg`
              <path id="${shapeId}" d="${iconPath}" />
            `;
          }),
        )}
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

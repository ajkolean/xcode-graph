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
 *   <xcode-graph-svg-defs></xcode-graph-svg-defs>
 *   <!-- Other SVG content can reference the defined filters/markers/shapes -->
 * </svg>
 * ```
 */
import { LitElement, type TemplateResult } from 'lit';
/**
 * SVG definitions (filters, markers, reusable shapes) used by the graph visualization.
 * Provides reusable filters, arrow markers, and node shape templates for performance.
 *
 * @summary Reusable SVG defs for graph filters, markers, and shapes
 */
export declare class GraphSVGDefs extends LitElement {
    protected createRenderRoot(): this;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-svg-defs': GraphSVGDefs;
    }
}
//# sourceMappingURL=graph-svg-defs.d.ts.map
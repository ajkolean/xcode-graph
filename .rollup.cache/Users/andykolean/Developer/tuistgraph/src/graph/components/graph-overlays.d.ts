/**
 * GraphOverlays Lit Components
 *
 * Overlay components for graph visualization:
 * - GraphBackground: Grid pattern background
 * - GraphControls: Zoom controls and animation toggle
 * - GraphEmptyState: Empty state message
 * - GraphInstructions: Usage instructions
 *
 * @example
 * ```html
 * <xcode-graph-background></xcode-graph-background>
 * <xcode-graph-controls zoom="1.0"></xcode-graph-controls>
 * <xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Grid pattern background overlay for the graph visualization area.
 *
 * @summary Grid pattern background overlay
 */
export declare class GraphBackground extends LitElement {
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
/**
 * Zoom controls and animation toggle overlay for the graph visualization.
 * Displays zoom percentage, zoom in/out buttons, and fit-to-view reset.
 *
 * @summary Zoom controls overlay
 * @fires zoom-step - Dispatched when a zoom step button is clicked (detail: number)
 * @fires zoom-reset - Dispatched when the fit-to-view button is clicked
 */
export declare class GraphControls extends LitElement {
    zoom: number;
    baseZoom: number;
    nodeCount: number;
    edgeCount: number;
    static readonly styles: CSSResultGroup;
    private static readonly ZOOM_STEPS;
    private get zoomRatio();
    private get atMinZoom();
    private get atMaxZoom();
    private handleZoomIn;
    private handleZoomOut;
    private handleZoomReset;
    private handleWheel;
    private handleMouseDown;
    render(): TemplateResult;
}
/**
 * Empty state message overlay shown when no nodes match the current filters.
 *
 * @summary Empty state message overlay
 */
export declare class GraphEmptyStateOverlay extends LitElement {
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
/**
 * Usage instructions overlay showing drag, click, and scroll hints.
 *
 * @summary Usage instructions overlay
 */
export declare class GraphInstructions extends LitElement {
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-background': GraphBackground;
        'xcode-graph-controls': GraphControls;
        'xcode-graph-visualization-empty-state': GraphEmptyStateOverlay;
        'xcode-graph-instructions': GraphInstructions;
    }
}
//# sourceMappingURL=graph-overlays.d.ts.map
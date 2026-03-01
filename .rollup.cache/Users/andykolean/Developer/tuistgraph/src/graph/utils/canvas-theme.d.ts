/**
 * Canvas Theme - CSS Custom Property Bridge
 *
 * Resolves CSS custom properties from the host element's computed style
 * and returns a typed theme object for Canvas2D rendering.
 *
 * Host applications override colors by setting CSS custom properties
 * on <xcode-graph-canvas> or any ancestor element.
 */
export interface CanvasTheme {
    nodeApp: string;
    nodeFramework: string;
    nodeLibrary: string;
    nodeTest: string;
    nodeCli: string;
    nodePackage: string;
    canvasBg: string;
    tooltipBg: string;
    shadowColor: string;
    cycleEdgeColor: string;
    cycleGlowColor: string;
}
/** Read CSS custom properties from an element's computed style */
export declare function resolveCanvasTheme(el: HTMLElement): CanvasTheme;
//# sourceMappingURL=canvas-theme.d.ts.map
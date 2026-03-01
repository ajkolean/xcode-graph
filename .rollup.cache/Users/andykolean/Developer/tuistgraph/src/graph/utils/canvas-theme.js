/**
 * Canvas Theme - CSS Custom Property Bridge
 *
 * Resolves CSS custom properties from the host element's computed style
 * and returns a typed theme object for Canvas2D rendering.
 *
 * Host applications override colors by setting CSS custom properties
 * on <xcode-graph-canvas> or any ancestor element.
 */
/** Read CSS custom properties from an element's computed style */
export function resolveCanvasTheme(el) {
    const s = getComputedStyle(el);
    const get = (prop, fallback) => s.getPropertyValue(prop).trim() || fallback;
    return {
        nodeApp: get('--colors-node-app', 'rgba(240, 176, 64, 1)'),
        nodeFramework: get('--colors-node-framework', 'rgba(100, 181, 246, 1)'),
        nodeLibrary: get('--colors-node-library', 'rgba(129, 199, 132, 1)'),
        nodeTest: get('--colors-node-test', 'rgba(240, 120, 170, 1)'),
        nodeCli: get('--colors-node-cli', 'rgba(120, 160, 246, 1)'),
        nodePackage: get('--colors-node-package', 'rgba(234, 196, 72, 1)'),
        canvasBg: get('--colors-canvas-bg', '#161617'),
        tooltipBg: get('--colors-canvas-tooltip-bg', 'rgba(24, 24, 28, 0.95)'),
        shadowColor: get('--colors-canvas-shadow', 'rgba(24, 24, 28, 0.9)'),
        cycleEdgeColor: get('--colors-canvas-cycle-edge', 'rgba(239, 68, 68, 0.8)'),
        cycleGlowColor: get('--colors-canvas-cycle-glow', 'rgba(239, 68, 68, 0.6)'),
    };
}
//# sourceMappingURL=canvas-theme.js.map
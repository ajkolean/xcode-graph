/**
 * Canvas Theme - CSS Custom Property Bridge
 *
 * Resolves CSS custom properties from the host element's computed style
 * and returns a typed theme object for Canvas2D rendering.
 *
 * Host applications override colors by setting CSS custom properties
 * on <graph-canvas> or any ancestor element.
 */

export interface CanvasTheme {
  // Node type colors (from --colors-node-*)
  nodeApp: string;
  nodeFramework: string;
  nodeLibrary: string;
  nodeTest: string;
  nodeCli: string;
  nodePackage: string;

  // Canvas chrome colors
  tooltipBg: string;
  shadowColor: string;
  cycleEdgeColor: string;
  cycleGlowColor: string;

  // Starfield colors
  starfieldWarm: string;
  starfieldGolden: string;
  starfieldCool: string;
}

/** Read CSS custom properties from an element's computed style */
export function resolveCanvasTheme(el: HTMLElement): CanvasTheme {
  const s = getComputedStyle(el);
  const get = (prop: string, fallback: string) => s.getPropertyValue(prop).trim() || fallback;

  return {
    nodeApp: get('--colors-node-app', 'rgba(255, 160, 60, 1)'),
    nodeFramework: get('--colors-node-framework', 'rgba(64, 224, 208, 1)'),
    nodeLibrary: get('--colors-node-library', 'rgba(80, 220, 140, 1)'),
    nodeTest: get('--colors-node-test', 'rgba(255, 120, 180, 1)'),
    nodeCli: get('--colors-node-cli', 'rgba(160, 140, 255, 1)'),
    nodePackage: get('--colors-node-package', 'rgba(255, 200, 100, 1)'),
    tooltipBg: get('--colors-canvas-tooltip-bg', 'rgba(30, 30, 35, 0.95)'),
    shadowColor: get('--colors-canvas-shadow', 'rgba(30, 30, 35, 0.9)'),
    cycleEdgeColor: get('--colors-canvas-cycle-edge', 'rgba(255, 100, 50, 0.8)'),
    cycleGlowColor: get('--colors-canvas-cycle-glow', 'rgba(255, 100, 50, 0.6)'),
    starfieldWarm: get('--colors-starfield-warm', '#f7f1da'),
    starfieldGolden: get('--colors-starfield-golden', '#f5e0b5'),
    starfieldCool: get('--colors-starfield-cool', '#d6e0ff'),
  };
}

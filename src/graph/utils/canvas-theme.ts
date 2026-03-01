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
  // Node type colors (from --colors-node-*)
  nodeApp: string;
  nodeFramework: string;
  nodeLibrary: string;
  nodeTest: string;
  nodeCli: string;
  nodePackage: string;

  // Canvas background (flat fill)
  canvasBg: string;

  // Canvas chrome colors
  tooltipBg: string;
  shadowColor: string;
  cycleEdgeColor: string;
  cycleGlowColor: string;

  // Theme detection
  isDark: boolean;
}

interface ThemeFallbacks {
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

export const DARK_FALLBACKS: ThemeFallbacks = {
  nodeApp: 'rgba(240, 176, 64, 1)',
  nodeFramework: 'rgba(100, 181, 246, 1)',
  nodeLibrary: 'rgba(129, 199, 132, 1)',
  nodeTest: 'rgba(240, 120, 170, 1)',
  nodeCli: 'rgba(120, 160, 246, 1)',
  nodePackage: 'rgba(234, 196, 72, 1)',
  canvasBg: '#161617',
  tooltipBg: 'rgba(24, 24, 28, 0.95)',
  shadowColor: 'rgba(24, 24, 28, 0.9)',
  cycleEdgeColor: 'rgba(239, 68, 68, 0.8)',
  cycleGlowColor: 'rgba(239, 68, 68, 0.6)',
};

export const LIGHT_FALLBACKS: ThemeFallbacks = {
  nodeApp: 'rgba(166, 110, 0, 1)',
  nodeFramework: 'rgba(37, 99, 235, 1)',
  nodeLibrary: 'rgba(17, 138, 62, 1)',
  nodeTest: 'rgba(219, 39, 119, 1)',
  nodeCli: 'rgba(79, 70, 229, 1)',
  nodePackage: 'rgba(146, 100, 2, 1)',
  canvasBg: '#f5f5f7',
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  cycleEdgeColor: 'rgba(220, 38, 38, 0.8)',
  cycleGlowColor: 'rgba(220, 38, 38, 0.4)',
};

/** Read CSS custom properties from an element's computed style */
export function resolveCanvasTheme(el: HTMLElement): CanvasTheme {
  const s = getComputedStyle(el);
  const get = (prop: string, fallback: string) => s.getPropertyValue(prop).trim() || fallback;

  // Detect if we're in dark mode by checking background luminance
  const bgColor = get('--colors-background', '#161617');
  const isDark = isDarkColor(bgColor);
  const fb = isDark ? DARK_FALLBACKS : LIGHT_FALLBACKS;

  return {
    nodeApp: get('--colors-node-app', fb.nodeApp),
    nodeFramework: get('--colors-node-framework', fb.nodeFramework),
    nodeLibrary: get('--colors-node-library', fb.nodeLibrary),
    nodeTest: get('--colors-node-test', fb.nodeTest),
    nodeCli: get('--colors-node-cli', fb.nodeCli),
    nodePackage: get('--colors-node-package', fb.nodePackage),
    canvasBg: get('--colors-canvas-bg', fb.canvasBg),
    tooltipBg: get('--colors-canvas-tooltip-bg', fb.tooltipBg),
    shadowColor: get('--colors-canvas-shadow', fb.shadowColor),
    cycleEdgeColor: get('--colors-canvas-cycle-edge', fb.cycleEdgeColor),
    cycleGlowColor: get('--colors-canvas-cycle-glow', fb.cycleGlowColor),
    isDark,
  };
}

/** Simple luminance check to determine if a color is dark */
function isDarkColor(color: string): boolean {
  let r = 0;
  let g = 0;
  let b = 0;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = Number.parseInt(hex.substring(0, 2), 16);
    g = Number.parseInt(hex.substring(2, 4), 16);
    b = Number.parseInt(hex.substring(4, 6), 16);
  } else {
    const match = color.match(/(\d+)/g);
    if (match) {
      r = Number.parseInt(match[0] ?? '0', 10);
      g = Number.parseInt(match[1] ?? '0', 10);
      b = Number.parseInt(match[2] ?? '0', 10);
    }
  }
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

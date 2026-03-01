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

/** Read CSS custom properties from an element's computed style */
export function resolveCanvasTheme(el: HTMLElement): CanvasTheme {
  const s = getComputedStyle(el);
  const get = (prop: string, fallback: string) => s.getPropertyValue(prop).trim() || fallback;

  // Detect if we're in dark mode by checking background luminance
  const bgColor = get('--colors-background', '#161617');
  const isDark = isDarkColor(bgColor);

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
    isDark,
  };
}

/** Simple luminance check to determine if a color is dark */
function isDarkColor(color: string): boolean {
  // Parse hex or rgba
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

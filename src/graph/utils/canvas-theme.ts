/**
 * Canvas Theme - CSS Custom Property Bridge
 *
 * Resolves CSS custom properties from the host element's computed style
 * and returns a typed theme object for Canvas2D rendering.
 *
 * Host applications override colors by setting CSS custom properties
 * on <xcode-graph-canvas> or any ancestor element.
 *
 * Node color fallbacks match the canonical palette in
 * src/shared/constants/node-palette.ts.
 */

import { NODE_PALETTE } from '@/shared/constants/node-palette.ts';

// ---------------------------------------------------------------------------
// Color manipulation helpers (merged from canvas-colors.ts)
// ---------------------------------------------------------------------------

/** Convert a hex color (#RRGGBB) to an rgba() string */
export function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Parse an rgba/rgb/hex color string and return it with a new alpha value */
export function colorWithAlpha(color: string, newAlpha: number): string {
  const rgbaMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${newAlpha})`;
  }
  const hexMatch = color.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (hexMatch) {
    const [, rHex, gHex, bHex] = hexMatch;
    if (!rHex || !gHex || !bHex) return color;
    const r = Number.parseInt(rHex, 16);
    const g = Number.parseInt(gHex, 16);
    const b = Number.parseInt(bHex, 16);
    return `rgba(${r},${g},${b},${newAlpha})`;
  }
  return color;
}

// ---------------------------------------------------------------------------
// Canvas Theme
// ---------------------------------------------------------------------------

/**
 * Resolved theme values for Canvas2D rendering.
 * All color strings are ready to use as fillStyle/strokeStyle values.
 */
export interface CanvasTheme {
  /** App node color (from `--colors-node-app`) */
  nodeApp: string;
  /** Framework node color (from `--colors-node-framework`) */
  nodeFramework: string;
  /** Library node color (from `--colors-node-library`) */
  nodeLibrary: string;
  /** Test node color (from `--colors-node-test`) */
  nodeTest: string;
  /** CLI node color (from `--colors-node-cli`) */
  nodeCli: string;
  /** Package node color (from `--colors-node-package`) */
  nodePackage: string;

  /** Canvas background fill color */
  canvasBg: string;

  /** Tooltip background color */
  tooltipBg: string;
  /** Shadow/drop-shadow color */
  shadowColor: string;
  /** Cycle edge stroke color */
  cycleEdgeColor: string;
  /** Cycle edge glow color */
  cycleGlowColor: string;

  /** Whether the resolved theme is dark (based on background luminance) */
  isDark: boolean;
}

/**
 * Read CSS custom properties from an element's computed style and build a CanvasTheme.
 * Falls back to default palette values when properties are not set.
 *
 * @param el - The host element to read computed styles from
 * @returns Resolved canvas theme with all color values
 */
export function resolveCanvasTheme(el: HTMLElement): CanvasTheme {
  const s = getComputedStyle(el);
  const get = (prop: string, fallback: string) => s.getPropertyValue(prop).trim() || fallback;

  // Detect if we're in dark mode by checking background luminance
  const bgColor = get('--colors-background', '#161617');
  const isDark = isDarkColor(bgColor);

  return {
    nodeApp: get('--colors-node-app', NODE_PALETTE.app),
    nodeFramework: get('--colors-node-framework', NODE_PALETTE.framework),
    nodeLibrary: get('--colors-node-library', NODE_PALETTE.library),
    nodeTest: get('--colors-node-test', NODE_PALETTE['test-unit']),
    nodeCli: get('--colors-node-cli', NODE_PALETTE.cli),
    nodePackage: get('--colors-node-package', NODE_PALETTE.package),
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

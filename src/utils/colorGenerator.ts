// Base color palette from design system
const baseColors = [
  { name: 'primary', rgb: [111, 44, 255] }, // #6F2CFF - Purple
  { name: 'chart-2', rgb: [2, 128, 185] }, // #0280B9 - Blue
  { name: 'chart-3', rgb: [40, 167, 69] }, // #28A745 - Green
  { name: 'chart-4', rgb: [253, 121, 28] }, // #FD791C - Orange
  { name: 'chart-5', rgb: [229, 28, 1] }, // #E51C01 - Red
  { name: 'purple', rgb: [156, 39, 176] }, // #9C27B0 - Deep Purple
  { name: 'pink', rgb: [233, 30, 99] }, // #E91E63 - Pink
  { name: 'amber', rgb: [255, 152, 0] }, // #FF9800 - Amber
  { name: 'teal', rgb: [0, 150, 136] }, // #009688 - Teal
  { name: 'indigo', rgb: [63, 81, 181] }, // #3F51B5 - Indigo
  { name: 'cyan', rgb: [0, 188, 212] }, // #00BCD4 - Cyan
  { name: 'lime', rgb: [205, 220, 57] }, // #CDDC39 - Lime
];

// Simple hash function to generate consistent index from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Helper: Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = computeHue(r, g, b, max, d);
  }

  return { h, s, l };
}

// Helper: Compute hue component
function computeHue(r: number, g: number, b: number, max: number, d: number): number {
  switch (max) {
    case r:
      return ((g - b) / d + (g < b ? 6 : 0)) / 6;
    case g:
      return ((b - r) / d + 2) / 6;
    case b:
      return ((r - g) / d + 4) / 6;
    default:
      return 0;
  }
}

// Helper: Convert hue to RGB component
function hue2rgb(p: number, q: number, t: number): number {
  let adjustedT = t;
  if (adjustedT < 0) adjustedT += 1;
  if (adjustedT > 1) adjustedT -= 1;
  if (adjustedT < 1 / 6) return p + (q - p) * 6 * adjustedT;
  if (adjustedT < 1 / 2) return q;
  if (adjustedT < 2 / 3) return p + (q - p) * (2 / 3 - adjustedT) * 6;
  return p;
}

// Helper: Convert HSL to RGB components
function hslToRgb(h: number, s: number, l: number): { r2: number; g2: number; b2: number } {
  if (s === 0) {
    return { r2: l, g2: l, b2: l };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r2: hue2rgb(p, q, h + 1 / 3),
    g2: hue2rgb(p, q, h),
    b2: hue2rgb(p, q, h - 1 / 3),
  };
}

// Helper: Convert number to hex string
function toHex(n: number): string {
  const hex = Math.round(n * 255).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

// Adjust color lightness/saturation for variation
function adjustColor(rgb: number[], lightnessShift: number, saturationShift: number): string {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const { h, s, l } = rgbToHsl(r, g, b);

  const adjustedS = Math.max(0, Math.min(1, s + saturationShift));
  const adjustedL = Math.max(0, Math.min(1, l + lightnessShift));

  const { r2, g2, b2 } = hslToRgb(h, adjustedS, adjustedL);

  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

/**
 * Generate a consistent, distinct color for any string using design system colors
 * @param input - The string to generate a color for (e.g., project name, platform name)
 * @param category - Optional category for additional variation ('platform', 'project', 'package', etc.)
 */
export function generateColor(input: string, category?: string): string {
  const hash = hashString(input);
  const baseIndex = hash % baseColors.length;
  const baseColor = baseColors[baseIndex];

  // Add variation based on category
  let lightnessShift = 0;
  let saturationShift = 0;

  if (category) {
    const categoryHash = hashString(category);
    lightnessShift = ((categoryHash % 30) - 15) / 100; // -0.15 to +0.15
    saturationShift = ((categoryHash % 20) - 10) / 100; // -0.10 to +0.10
  }

  // Add slight variation based on input itself
  const inputVariation = (hash % 20) / 100; // 0 to 0.20
  lightnessShift += inputVariation * 0.1;

  return adjustColor(baseColor.rgb, lightnessShift, saturationShift);
}

/**
 * Get a collection of distinct colors for a list of items
 */
export function generateColorPalette(items: string[], category?: string): Map<string, string> {
  const palette = new Map<string, string>();
  items.forEach((item) => {
    palette.set(item, generateColor(item, category));
  });
  return palette;
}

/**
 * Generate color with specific alpha
 */
export function generateColorWithAlpha(input: string, alpha: number, category?: string): string {
  const hex = generateColor(input, category);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

import { hslToRgb, rgbToHsl, toHex } from './color-math';

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
    const char = str.codePointAt(i) ?? 0;
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Adjust color lightness/saturation for variation
function adjustColor(rgb: number[], lightnessShift: number, saturationShift: number): string {
  const rNorm = rgb[0]! / 255;
  const gNorm = rgb[1]! / 255;
  const bNorm = rgb[2]! / 255;

  const { h, s, l } = rgbToHsl(rNorm, gNorm, bNorm);

  const adjustedS = Math.max(0, Math.min(1, s + saturationShift));
  const adjustedL = Math.max(0, Math.min(1, l + lightnessShift));

  const { r, g, b } = hslToRgb(h, adjustedS, adjustedL);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

  return adjustColor(baseColor!.rgb, lightnessShift, saturationShift);
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
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

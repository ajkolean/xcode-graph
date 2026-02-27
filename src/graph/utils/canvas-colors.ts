/** Shared color manipulation utilities for canvas renderers */

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
    const r = Number.parseInt(hexMatch[1]!, 16);
    const g = Number.parseInt(hexMatch[2]!, 16);
    const b = Number.parseInt(hexMatch[3]!, 16);
    return `rgba(${r},${g},${b},${newAlpha})`;
  }
  return color;
}

/** Shared color manipulation utilities for canvas renderers */
/** Convert a hex color (#RRGGBB) to an rgba() string */
export function hexToRgba(hex, alpha) {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
/** Parse an rgba/rgb/hex color string and return it with a new alpha value */
export function colorWithAlpha(color, newAlpha) {
    const rgbaMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
    if (rgbaMatch) {
        return `rgba(${rgbaMatch[1]},${rgbaMatch[2]},${rgbaMatch[3]},${newAlpha})`;
    }
    const hexMatch = color.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
    if (hexMatch) {
        const [, rHex, gHex, bHex] = hexMatch;
        if (!rHex || !gHex || !bHex)
            return color;
        const r = Number.parseInt(rHex, 16);
        const g = Number.parseInt(gHex, 16);
        const b = Number.parseInt(bHex, 16);
        return `rgba(${r},${g},${b},${newAlpha})`;
    }
    return color;
}
//# sourceMappingURL=canvas-colors.js.map
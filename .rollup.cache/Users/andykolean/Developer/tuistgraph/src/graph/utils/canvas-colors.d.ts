/** Shared color manipulation utilities for canvas renderers */
/** Convert a hex color (#RRGGBB) to an rgba() string */
export declare function hexToRgba(hex: string, alpha: number): string;
/** Parse an rgba/rgb/hex color string and return it with a new alpha value */
export declare function colorWithAlpha(color: string, newAlpha: number): string;

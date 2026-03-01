/**
 * Graph Filtering Utilities
 *
 * Color generation utilities for filtering graph nodes.
 *
 * @module utils/graph/filters
 */
import { generateColor } from '@ui/utils/color-generator';
/**
 * Generate a color map for a set of keys
 *
 * Creates consistent colors for platforms, projects, or packages
 * using the color generator utility.
 *
 * @param keys - Iterable of string keys to generate colors for
 * @param category - Color category for hue selection
 * @returns Map of keys to hex color strings
 */
export function generateColorMap(keys, category) {
    const colors = new Map();
    for (const key of keys) {
        colors.set(key, generateColor(key, category));
    }
    return colors;
}
//# sourceMappingURL=filters.js.map
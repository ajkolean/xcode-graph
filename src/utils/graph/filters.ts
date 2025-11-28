/**
 * Graph Filtering Utilities
 *
 * Color generation utilities for filtering graph nodes.
 *
 * @module utils/graph/filters
 */

import { generateColor } from '../rendering/color-generator';

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
export function generateColorMap<T extends string>(
  keys: Iterable<T>,
  category: 'platform' | 'project' | 'package',
): Map<T, string> {
  const colors = new Map<T, string>();
  for (const key of keys) {
    colors.set(key, generateColor(key, category));
  }
  return colors;
}

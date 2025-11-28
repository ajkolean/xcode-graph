/**
 * Graph Filtering Utilities
 *
 * Color mappings and utilities for filtering graph nodes by type.
 *
 * @module utils/graph/filters
 */

import { generateColor } from '../rendering/color-generator';

// ==================== Color Constants ====================

/**
 * Default colors for each node type
 *
 * Used for consistent visual differentiation in the graph.
 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  app: '#6F2CFF',
  framework: '#0280B9',
  library: '#28A745',
  'test-unit': '#9C27B0',
  'test-ui': '#E91E63',
  cli: '#FD791C',
  package: '#FF9800',
};

// ==================== Color Functions ====================

/**
 * Get the color for a node type
 *
 * @param type - Node type (app, framework, library, etc.)
 * @returns Hex color string, defaults to purple for unknown types
 */
export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] || '#6F2CFF';
}

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

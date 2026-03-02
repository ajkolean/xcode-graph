/**
 * Utilities for node and project colors
 * Noora-aligned palette
 *
 * Colors derive from the canonical palette in {@link @/shared/constants/node-palette}.
 */

import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { NODE_PALETTE } from '@/shared/constants/node-palette';

/**
 * Color mapping for different node types
 * Uses the Noora palette with high contrast colors
 *
 * Derived from `NODE_PALETTE` (single source of truth).
 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  // Orange (apps, main entry points) — Noora orange-500
  app: NODE_PALETTE.app,

  // Azure (frameworks, core infrastructure) — Noora azure-500
  framework: NODE_PALETTE.framework,

  // Green (libraries, utilities) — Noora green-500
  library: NODE_PALETTE.library,

  // Pink (tests) — Noora pink-500
  'test-unit': NODE_PALETTE['test-unit'],
  'test-ui': NODE_PALETTE['test-ui'],

  // Blue (CLI tools) — Noora blue-500
  cli: NODE_PALETTE.cli,

  // Yellow (packages) — Noora yellow-500
  package: NODE_PALETTE.package,
};

const DEFAULT_NODE_COLOR = NODE_PALETTE.app;

/**
 * Gets the color for a node type (static fallback for DOM-based components).
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Hex color string from the Noora palette
 */
export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] ?? DEFAULT_NODE_COLOR;
}

/** Node-color keys of CanvasTheme (excludes non-string props like isDark) */
type NodeColorKey = {
  [K in keyof CanvasTheme]: CanvasTheme[K] extends string ? K : never;
}[keyof CanvasTheme];

/** Map from node type to CanvasTheme key */
const THEME_KEY_MAP: Record<string, NodeColorKey> = {
  app: 'nodeApp',
  framework: 'nodeFramework',
  library: 'nodeLibrary',
  'test-unit': 'nodeTest',
  'test-ui': 'nodeTest',
  cli: 'nodeCli',
  package: 'nodePackage',
};

/**
 * Gets the color for a node type from a resolved CanvasTheme.
 * Use this in Canvas2D rendering to respect CSS custom property overrides.
 *
 * @param type - The node type string
 * @param theme - A resolved `CanvasTheme` object
 * @returns The themed color string for the given type
 */
export function getNodeTypeColorFromTheme(type: string, theme: CanvasTheme): string {
  const key = THEME_KEY_MAP[type];
  return key ? theme[key] : theme.nodeApp;
}

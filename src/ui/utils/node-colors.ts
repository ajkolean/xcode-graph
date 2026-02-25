/**
 * Utilities for node and project colors
 * Mission Control Theme - Amber/Teal color palette
 */

import type { CanvasTheme } from '@graph/utils/canvas-theme';
import { generateColor } from './color-generator';

/**
 * Color mapping for different node types
 * Uses the Mission Control palette with high contrast colors
 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  // Primary - Amber (apps, main entry points)
  app: '#FFA03C',

  // Teal (frameworks, core infrastructure)
  framework: '#40E0D0',

  // Green (libraries, utilities)
  library: '#50DC8C',

  // Pink/Magenta (tests)
  'test-unit': '#FF78B4',
  'test-ui': '#FF78B4',

  // Purple (CLI tools)
  cli: '#A08CFF',

  // Yellow-orange (packages)
  package: '#FFC864',
};

const DEFAULT_NODE_COLOR = '#FFA03C';

/**
 * Gets the color for a node type (static fallback for DOM-based components)
 */
export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] ?? DEFAULT_NODE_COLOR;
}

/** Map from node type to CanvasTheme key */
const THEME_KEY_MAP: Record<string, keyof CanvasTheme> = {
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
 */
export function getNodeTypeColorFromTheme(type: string, theme: CanvasTheme): string {
  const key = THEME_KEY_MAP[type];
  return key ? theme[key] : theme.nodeApp;
}

/**
 * Gets a consistent color for a project name
 */
export function getProjectColor(projectName: string): string {
  return generateColor(projectName, 'project');
}

/**
 * Gets all node type colors for legend display
 */
export function getAllNodeTypeColors(): Record<string, string> {
  return { ...NODE_TYPE_COLORS };
}

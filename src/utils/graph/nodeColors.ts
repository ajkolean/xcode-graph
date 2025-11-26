/**
 * Utilities for node and project colors
 */

import { generateColor } from '../colorGenerator';

/**
 * Color mapping for different node types
 */
const NODE_TYPE_COLORS: Record<string, string> = {
  app: '#6F2CFF',
  framework: '#0280B9',
  library: '#28A745',
  'test-unit': '#9C27B0',
  'test-ui': '#E91E63',
  cli: '#FD791C',
  package: '#FF9800',
};

const DEFAULT_NODE_COLOR = '#6F2CFF';

/**
 * Gets the color for a node type
 */
export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] ?? DEFAULT_NODE_COLOR;
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

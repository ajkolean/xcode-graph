import { generateColor } from './colorGenerator';

export const NODE_TYPE_COLORS: Record<string, string> = {
  app: '#6F2CFF',
  framework: '#0280B9',
  library: '#28A745',
  'test-unit': '#9C27B0',
  'test-ui': '#E91E63',
  cli: '#FD791C',
  package: '#FF9800',
};

export function getNodeTypeColor(type: string): string {
  return NODE_TYPE_COLORS[type] || '#6F2CFF';
}

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

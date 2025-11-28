/**
 * Filter state fixtures
 */

import type { FilterState } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.schema';

/**
 * Create a FilterState that includes everything
 */
export function createAllInclusiveFilters(): FilterState {
  return {
    nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
    platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
    origins: new Set(['local', 'external']),
    projects: new Set(['Main', 'Core', 'Features', 'Tools', 'App']),
    packages: new Set(['Alamofire', 'Kingfisher', 'Package1', 'Package2']),
  };
}

/**
 * Create a FilterState that excludes everything
 */
export function createEmptyFilters(): FilterState {
  return {
    nodeTypes: new Set(),
    platforms: new Set(),
    origins: new Set(),
    projects: new Set(),
    packages: new Set(),
  };
}

/**
 * Create a FilterState with only specific node types
 */
export function createNodeTypeFilter(types: GraphNode['type'][]): FilterState {
  return {
    ...createAllInclusiveFilters(),
    nodeTypes: new Set(types),
  };
}

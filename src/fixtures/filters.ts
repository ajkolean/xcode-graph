/**
 * Filter state fixtures
 */

import type { FilterState } from '@shared/schemas';
import { type GraphNode, NodeType, Origin, Platform } from '@shared/schemas/graph.schema';

/**
 * Create a FilterState that includes everything
 */
export function createAllInclusiveFilters(): FilterState {
  return {
    nodeTypes: new Set([
      NodeType.App,
      NodeType.Framework,
      NodeType.Library,
      NodeType.TestUnit,
      NodeType.TestUi,
      NodeType.Cli,
      NodeType.Package,
    ]),
    platforms: new Set([
      Platform.iOS,
      Platform.macOS,
      Platform.visionOS,
      Platform.tvOS,
      Platform.watchOS,
    ]),
    origins: new Set([Origin.Local, Origin.External]),
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

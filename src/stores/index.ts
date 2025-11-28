/**
 * Stores Module - Zustand state management
 *
 * Centralized exports for all application state stores:
 * - graphStore: Selection and view mode state
 * - filterStore: Filter and search state
 * - uiStore: UI settings (zoom, animation, tabs)
 * - dataStore: Graph data and memoized derived state
 *
 * @module stores
 */

// ==================== Graph Store ====================

export {
  useCircularDependencies,
  useGraphStore,
  useHoveredNode,
  useIsNodeSelected,
  useSelectedCluster,
  useSelectedNode,
  useViewMode,
} from './graphStore';

// ==================== Filter Store ====================

export {
  useFilterStore,
  useFilters,
  useHasActiveFilters,
  useSearchQuery,
} from './filterStore';

// ==================== UI Store ====================

export {
  type ActiveTab,
  type PreviewFilter,
  useActiveTab,
  useEnableAnimation,
  usePreviewFilter,
  useUIStore,
  useZoom,
} from './uiStore';

// ==================== Data Store ====================

export { useDataStore, useGraphEdges, useGraphNodes } from './dataStore';

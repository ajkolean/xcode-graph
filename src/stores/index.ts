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
  type GraphStore,
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
  type FilterStore,
  useFilterStore,
  useFilters,
  useHasActiveFilters,
  useSearchQuery,
} from './filterStore';

// ==================== UI Store ====================

export {
  type ActiveTab,
  type PreviewFilter,
  type UIStore,
  useActiveTab,
  useEnableAnimation,
  usePreviewFilter,
  useUIStore,
  useZoom,
} from './uiStore';

// ==================== Data Store ====================

export {
  type DataStore,
  type DisplayData,
  type FilteredData,
  useDataStore,
  useGraphEdges,
  useGraphNodes,
} from './dataStore';

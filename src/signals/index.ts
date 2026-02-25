/**
 * Signals Module - Lit Signals state management
 *
 * Centralized exports for all application state signals.
 * Replaces Zustand stores with native Lit Signals integration.
 *
 * @module signals
 */

// ==================== Graph Signals ====================

export {
  // State signals
  chainDisplayMode,
  type ChainDisplayMode,
  circularDependencies,
  // Actions
  clearGraphData,
  createIsNodeSelected,
  type DisplayData,
  // Computed
  displayData,
  edges,
  type FilteredData,
  filteredData,
  focusNode,
  hasSelection,
  hoveredNode,
  nodes,
  // Reset utilities
  resetDataSignals,
  resetGraphSignals,
  resetView,
  selectCluster,
  selectedCluster,
  selectedNode,
  selectNode,
  setCircularDependencies,
  setGraphData,
  setHoveredNode,
  setViewMode,
  showDependents,
  toggleChainDisplay,
  transitiveData,
  viewMode,
} from '@graph/signals/index';

// ==================== Filter Signals ====================

export {
  // State signals
  allPackages,
  allProjects,
  // Actions
  clearFilters,
  DEFAULT_FILTERS,
  filters,
  hasActiveFilters,
  initializeFromData,
  // Reset utility
  resetFilterSignals,
  searchQuery,
  setFilters,
  setSearchQuery,
  toggleNodeType,
  toggleOrigin,
  togglePackage,
  togglePlatform,
  toggleProject,
} from '@shared/signals/index';

// ==================== UI Signals ====================

export {
  // State signals
  activeTab,
  enableAnimation,
  type PreviewFilter,
  previewFilter,
  // Reset utility
  resetUISignals,
  // Actions
  resetZoom,
  setActiveTab,
  setEnableAnimation,
  setPreviewFilter,
  setZoom,
  toggleAnimation,
  zoom,
  zoomIn,
  zoomOut,
} from '@shared/signals/index';

// ==================== Reset All Utility ====================

import { resetDataSignals, resetGraphSignals } from '@graph/signals/index';
import { resetFilterSignals, resetUISignals } from '@shared/signals/index';

/**
 * Reset all signals to their initial state.
 * Useful for testing and application reset.
 */
export function resetAllSignals(): void {
  resetGraphSignals();
  resetFilterSignals();
  resetUISignals();
  resetDataSignals();
}

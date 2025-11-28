/**
 * Shared Signals Module
 *
 * Centralized exports for shared signals, actions, and computed values.
 * Used across graph and UI components.
 *
 * @module shared/signals
 */

// ==================== Filter Signals ====================

export {
  clearFilters,
  initializeFromData,
  setFilters,
  setSearchQuery,
  toggleNodeType,
  toggleOrigin,
  togglePackage,
  togglePlatform,
  toggleProject,
} from './filter.actions';
export {
  allPackages,
  allProjects,
  DEFAULT_FILTERS,
  filters,
  hasActiveFilters,
  resetFilterSignals,
  searchQuery,
} from './filter.signals';

// ==================== UI Signals ====================

export {
  resetZoom,
  setActiveTab,
  setEnableAnimation,
  setPreviewFilter,
  setZoom,
  toggleAnimation,
  zoomIn,
  zoomOut,
} from './ui.actions';
export {
  activeTab,
  enableAnimation,
  type PreviewFilter,
  previewFilter,
  resetUISignals,
  zoom,
} from './ui.signals';

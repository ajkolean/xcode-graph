/**
 * Signals Module - Lit Signals state management
 *
 * Centralized exports for all application state signals.
 * Replaces Zustand stores with native Lit Signals integration.
 *
 * @module signals
 */
export { circularDependencies, clearGraphData, createIsNodeSelected, type DisplayData, displayData, edges, type FilteredData, filteredData, type HighlightCard, hasSelection, highlightDirectDependents, highlightDirectDeps, highlightTransitiveDependents, highlightTransitiveDeps, hoveredNode, nodes, resetDataSignals, resetGraphSignals, resetHighlightToggles, resetView, selectCluster, selectedCluster, selectedNode, selectNode, setCircularDependencies, setGraphData, setHoveredNode, toggleHighlight, transitiveData, viewMode, } from '@graph/signals/index';
export { allPackages, allProjects, clearFilters, DEFAULT_FILTERS, filters, hasActiveFilters, initializeFromData, resetFilterSignals, searchQuery, setFilters, setSearchQuery, toggleNodeType, toggleOrigin, togglePackage, togglePlatform, toggleProject, } from '@shared/signals/index';
export { activeTab, enableAnimation, type PreviewFilter, previewFilter, resetUISignals, resetZoom, setActiveTab, setEnableAnimation, setPreviewFilter, setZoom, toggleAnimation, zoom, zoomIn, zoomOut, } from '@shared/signals/index';
/**
 * Reset all signals to their initial state.
 * Useful for testing and application reset.
 */
export declare function resetAllSignals(): void;
//# sourceMappingURL=index.d.ts.map
/**
 * Graph Store - Selection and view state management
 *
 * Manages the currently selected node/cluster, view mode, and
 * circular dependency detection. Uses Zustand for reactive state.
 *
 * @module stores/graphStore
 */

import { create } from 'zustand';
import type { ViewMode } from '../schemas/app.schema';
import type { GraphNode } from '../schemas/graph.schema';

/**
 * Graph store state and actions
 */
export interface GraphStore {
  // ==================== Selection State ====================
  /** Currently selected node (null if none) */
  selectedNode: GraphNode | null;
  /** Currently selected cluster ID (null if none) */
  selectedCluster: string | null;
  /** Currently hovered node ID (null if none) */
  hoveredNode: string | null;

  // ==================== View State ====================
  /** Current graph visualization mode */
  viewMode: ViewMode;

  // ==================== Cycle Detection ====================
  /** Detected circular dependency paths */
  circularDependencies: string[][];

  // ==================== Basic Actions ====================
  /** Select a node (clears cluster selection) */
  selectNode: (node: GraphNode | null) => void;
  /** Select a cluster (clears node selection) */
  selectCluster: (clusterId: string | null) => void;
  /** Set hovered node for highlighting */
  setHoveredNode: (nodeId: string | null) => void;
  /** Change view mode */
  setViewMode: (mode: ViewMode) => void;
  /** Update detected circular dependencies */
  setCircularDependencies: (cycles: string[][]) => void;

  // ==================== Complex Actions ====================
  /** Focus on a node (toggle focused/both/dependents) */
  focusNode: (node: GraphNode) => void;
  /** Show dependents of a node (toggle dependents/both/focused) */
  showDependents: (node: GraphNode) => void;
  /** Show impact analysis for a node */
  showImpact: (node: GraphNode) => void;
  /** Reset to full view with no selection */
  resetView: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  selectedNode: null,
  selectedCluster: null,
  hoveredNode: null,
  viewMode: 'full',
  circularDependencies: [],

  selectNode: (node) =>
    set({
      selectedNode: node,
      selectedCluster: null,
      viewMode: node ? get().viewMode : 'full',
    }),

  selectCluster: (clusterId) =>
    set({
      selectedCluster: clusterId,
      selectedNode: null,
      viewMode: 'full',
    }),

  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCircularDependencies: (cycles) => set({ circularDependencies: cycles }),

  focusNode: (node) => {
    const { viewMode, selectedNode } = get();
    let newMode: ViewMode = 'focused';

    if (selectedNode?.id === node.id) {
      if (viewMode === 'focused') newMode = 'full';
      else if (viewMode === 'both') newMode = 'dependents';
      else if (viewMode === 'dependents') newMode = 'both';
    }

    set({ selectedNode: node, selectedCluster: null, viewMode: newMode });
  },

  showDependents: (node) => {
    const { viewMode, selectedNode } = get();
    let newMode: ViewMode = 'dependents';

    if (selectedNode?.id === node.id) {
      if (viewMode === 'dependents') newMode = 'full';
      else if (viewMode === 'both') newMode = 'focused';
      else if (viewMode === 'focused') newMode = 'both';
    }

    set({ selectedNode: node, selectedCluster: null, viewMode: newMode });
  },

  showImpact: (node) =>
    set({
      selectedNode: node,
      selectedCluster: null,
      viewMode: 'impact',
    }),

  resetView: () =>
    set({
      selectedNode: null,
      selectedCluster: null,
      viewMode: 'full',
    }),
}));

// ==================== Optimized Selectors ====================

/** Get currently selected node */
export const useSelectedNode = () => useGraphStore((s) => s.selectedNode);
/** Get currently selected cluster ID */
export const useSelectedCluster = () => useGraphStore((s) => s.selectedCluster);
/** Get currently hovered node ID */
export const useHoveredNode = () => useGraphStore((s) => s.hoveredNode);
/** Get current view mode */
export const useViewMode = () => useGraphStore((s) => s.viewMode);
/** Check if a specific node is selected */
export const useIsNodeSelected = (nodeId: string) =>
  useGraphStore((s) => s.selectedNode?.id === nodeId);
/** Get detected circular dependencies */
export const useCircularDependencies = () => useGraphStore((s) => s.circularDependencies);

import { create } from 'zustand';
import type { GraphNode } from '../schemas/graph.schema';
import type { ViewMode } from '../schemas/app.schema';

interface GraphStore {
  // Selection state
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredNode: string | null;

  // View state
  viewMode: ViewMode;

  // Actions
  selectNode: (node: GraphNode | null) => void;
  selectCluster: (clusterId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;

  // Complex actions (encapsulate business logic)
  focusNode: (node: GraphNode) => void;
  showDependents: (node: GraphNode) => void;
  showImpact: (node: GraphNode) => void;
  resetView: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  selectedNode: null,
  selectedCluster: null,
  hoveredNode: null,
  viewMode: 'full',

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

// Selectors for optimized subscriptions
export const useSelectedNode = () => useGraphStore((s) => s.selectedNode);
export const useSelectedCluster = () => useGraphStore((s) => s.selectedCluster);
export const useHoveredNode = () => useGraphStore((s) => s.hoveredNode);
export const useViewMode = () => useGraphStore((s) => s.viewMode);
export const useIsNodeSelected = (nodeId: string) =>
  useGraphStore((s) => s.selectedNode?.id === nodeId);

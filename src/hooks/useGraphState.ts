/**
 * Composition hook for graph state management
 * Consolidates related state into single hook
 */

import { useState } from 'react';
import { GraphNode } from '../data/mockGraphData';
import { ViewMode, DEFAULT_VIEW_MODE } from '../constants';

interface GraphState {
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredNode: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  zoom: number;
  enableAnimation: boolean;
  previewFilter: { 
    type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster'; 
    value: string;
  } | null;
}

interface GraphStateActions {
  setSelectedNode: (node: GraphNode | null) => void;
  setSelectedCluster: (clusterId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  setEnableAnimation: (enabled: boolean) => void;
  setPreviewFilter: (filter: GraphState['previewFilter']) => void;
}

type UseGraphStateReturn = GraphState & GraphStateActions;

export function useGraphState(): UseGraphStateReturn {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [zoom, setZoom] = useState(1);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<GraphState['previewFilter']>(null);

  return {
    // State
    selectedNode,
    selectedCluster,
    hoveredNode,
    searchQuery,
    viewMode,
    zoom,
    enableAnimation,
    previewFilter,
    // Actions
    setSelectedNode,
    setSelectedCluster,
    setHoveredNode,
    setSearchQuery,
    setViewMode,
    setZoom,
    setEnableAnimation,
    setPreviewFilter,
  };
}

/**
 * React Wrapper for GraphVisualization Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphVisualization as GraphVisualizationLit } from '../graph/graph-visualization';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';

export const LitGraphVisualizationElement = createComponent({
  tagName: 'graph-visualization',
  elementClass: GraphVisualizationLit,
  react: React,
  events: {
    onNodeSelect: 'node-select',
    onClusterSelect: 'cluster-select',
    onNodeHover: 'node-hover',
    onZoomIn: 'zoom-in',
    onZoomOut: 'zoom-out',
    onZoomReset: 'zoom-reset',
    onToggleAnimation: 'toggle-animation',
  },
});

export interface LitGraphVisualizationProps extends React.HTMLAttributes<HTMLElement> {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  selectedNode?: GraphNode | null;
  selectedCluster?: string | null;
  hoveredNode?: string | null;
  searchQuery?: string;
  viewMode?: ViewMode;
  zoom?: number;
  enableAnimation?: boolean;
  transitiveDeps?: any;
  transitiveDependents?: any;
  previewFilter?: any;
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode | null }>) => void;
  onClusterSelect?: (event: CustomEvent<{ clusterId: string | null }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
  onZoomIn?: (event: CustomEvent) => void;
  onZoomOut?: (event: CustomEvent) => void;
  onZoomReset?: (event: CustomEvent) => void;
  onToggleAnimation?: (event: CustomEvent) => void;
}

export function GraphVisualization({
  nodes,
  edges,
  selectedNode,
  selectedCluster,
  hoveredNode,
  searchQuery = '',
  viewMode = 'full',
  zoom = 1.0,
  enableAnimation = true,
  transitiveDeps,
  transitiveDependents,
  previewFilter,
  onNodeSelect,
  onNodeHover,
  onClusterSelect,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleAnimation,
  ...props
}: LitGraphVisualizationProps = {}) {
  return (
    <LitGraphVisualizationElement
      nodes={nodes}
      edges={edges}
      selectedNode={selectedNode}
      selectedCluster={selectedCluster}
      hoveredNode={hoveredNode}
      search-query={searchQuery}
      view-mode={viewMode}
      zoom={zoom}
      enable-animation={enableAnimation}
      transitiveDeps={transitiveDeps}
      transitiveDependents={transitiveDependents}
      previewFilter={previewFilter}
      onNodeSelect={onNodeSelect}
      onNodeHover={onNodeHover}
      onClusterSelect={onClusterSelect}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onZoomReset={onZoomReset}
      onToggleAnimation={onToggleAnimation}
      {...props}
    />
  );
}

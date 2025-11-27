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
    onNodeClick: 'node-click',
    onNodeHover: 'node-hover',
    onClusterClick: 'cluster-click',
    onClusterHover: 'cluster-hover',
    onBackgroundClick: 'background-click',
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
  onNodeClick?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
  onClusterClick?: (event: CustomEvent<{ clusterId: string }>) => void;
  onClusterHover?: (event: CustomEvent<{ clusterId: string | null }>) => void;
  onBackgroundClick?: (event: CustomEvent) => void;
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
  onNodeClick,
  onNodeHover,
  onClusterClick,
  onClusterHover,
  onBackgroundClick,
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
      onNodeClick={onNodeClick}
      onNodeHover={onNodeHover}
      onClusterClick={onClusterClick}
      onClusterHover={onClusterHover}
      onBackgroundClick={onBackgroundClick}
      {...props}
    />
  );
}

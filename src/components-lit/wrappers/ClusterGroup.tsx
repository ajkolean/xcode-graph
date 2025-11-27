/**
 * React Wrapper for GraphClusterGroup Lit Component (SVG)
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterGroup } from '../graph/cluster-group';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import type { ViewMode } from '@/types/app';

export const LitClusterGroupElement = createComponent({
  tagName: 'graph-cluster-group',
  elementClass: GraphClusterGroup,
  react: React,
  events: {
    onNodeMouseenter: 'node-mouseenter',
    onNodeMouseleave: 'node-mouseleave',
    onNodeMousedown: 'node-mousedown',
    onNodeClick: 'node-click',
    onClusterMouseenter: 'cluster-mouseenter',
    onClusterMouseleave: 'cluster-mouseleave',
    onClusterClick: 'cluster-click',
  },
});

export interface LitClusterGroupProps {
  cluster?: Cluster;
  clusterPosition?: ClusterPosition;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  finalNodePositions?: Map<string, NodePosition>;
  selectedNode?: GraphNode | null;
  hoveredNode?: string | null;
  hoveredClusterId?: string | null;
  searchQuery?: string;
  zoom?: number;
  viewMode?: ViewMode;
  transitiveDeps?: any;
  transitiveDependents?: any;
  onNodeMouseenter?: (event: CustomEvent) => void;
  onNodeMouseleave?: (event: CustomEvent) => void;
  onNodeMousedown?: (event: CustomEvent) => void;
  onNodeClick?: (event: CustomEvent) => void;
  onClusterMouseenter?: (event: CustomEvent) => void;
  onClusterMouseleave?: (event: CustomEvent) => void;
  onClusterClick?: (event: CustomEvent) => void;
}

export function ClusterGroup({
  cluster,
  clusterPosition,
  nodes,
  edges,
  finalNodePositions,
  selectedNode,
  hoveredNode,
  hoveredClusterId,
  searchQuery = '',
  zoom = 1.0,
  viewMode = 'full',
  transitiveDeps,
  transitiveDependents,
  onNodeMouseenter,
  onNodeMouseleave,
  onNodeMousedown,
  onNodeClick,
  onClusterMouseenter,
  onClusterMouseleave,
  onClusterClick,
}: LitClusterGroupProps = {}) {
  return (
    <LitClusterGroupElement
      cluster={cluster}
      clusterPosition={clusterPosition}
      nodes={nodes}
      edges={edges}
      finalNodePositions={finalNodePositions}
      selectedNode={selectedNode}
      hoveredNode={hoveredNode}
      hoveredClusterId={hoveredClusterId}
      search-query={searchQuery}
      zoom={zoom}
      view-mode={viewMode}
      transitiveDeps={transitiveDeps}
      transitiveDependents={transitiveDependents}
      onNodeMouseenter={onNodeMouseenter}
      onNodeMouseleave={onNodeMouseleave}
      onNodeMousedown={onNodeMousedown}
      onNodeClick={onNodeClick}
      onClusterMouseenter={onClusterMouseenter}
      onClusterMouseleave={onClusterMouseleave}
      onClusterClick={onClusterClick}
    />
  );
}

/**
 * React Wrapper for GraphEdges Lit Component (SVG)
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphEdges as GraphEdgesLit } from '../graph/graph-edges';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';
import type { ViewMode } from '@/types/app';
import type { ClusterPosition, NodePosition } from '@/types/simulation';

export const LitGraphEdgesElement = createComponent({
  tagName: 'graph-edges',
  elementClass: GraphEdgesLit,
  react: React,
  events: {},
});

export interface LitGraphEdgesProps {
  edges?: GraphEdge[];
  nodes?: GraphNode[];
  finalNodePositions?: Map<string, NodePosition>;
  clusterPositions?: Map<string, ClusterPosition>;
  selectedNode?: GraphNode | null;
  hoveredNode?: string | null;
  clusterId?: string;
  hoveredClusterId?: string | null;
  viewMode?: ViewMode;
  transitiveDeps?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  transitiveDependents?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  zoom?: number;
}

export function GraphEdges({
  edges,
  nodes,
  finalNodePositions,
  clusterPositions,
  selectedNode,
  hoveredNode,
  clusterId,
  hoveredClusterId,
  viewMode = 'full',
  transitiveDeps,
  transitiveDependents,
  zoom = 1.0,
}: LitGraphEdgesProps = {}) {
  return (
    <LitGraphEdgesElement
      edges={edges}
      nodes={nodes}
      finalNodePositions={finalNodePositions}
      clusterPositions={clusterPositions}
      selectedNode={selectedNode}
      hoveredNode={hoveredNode}
      cluster-id={clusterId}
      hovered-cluster-id={hoveredClusterId}
      view-mode={viewMode}
      transitiveDeps={transitiveDeps}
      transitiveDependents={transitiveDependents}
      zoom={zoom}
    />
  );
}

/**
 * React Wrapper for GraphClusterDetailsPanel Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterDetailsPanel } from '../ui/cluster-details-panel';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';

export const LitClusterDetailsPanelElement = createComponent({
  tagName: 'graph-cluster-details-panel',
  elementClass: GraphClusterDetailsPanel,
  react: React,
  events: {
    onClose: 'close',
    onNodeSelect: 'node-select',
    onNodeHover: 'node-hover',
  },
});

export interface LitClusterDetailsPanelProps extends React.HTMLAttributes<HTMLElement> {
  cluster?: Cluster;
  clusterNodes?: GraphNode[];
  allNodes?: GraphNode[];
  edges?: GraphEdge[];
  filteredEdges?: GraphEdge[];
  zoom?: number;
  onClose?: (event: CustomEvent) => void;
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
}

export function ClusterDetailsPanel({
  cluster,
  clusterNodes,
  allNodes,
  edges,
  filteredEdges,
  zoom = 1.0,
  onClose,
  onNodeSelect,
  onNodeHover,
  ...props
}: LitClusterDetailsPanelProps = {}) {
  return (
    <LitClusterDetailsPanelElement
      cluster={cluster}
      clusterNodes={clusterNodes}
      allNodes={allNodes}
      edges={edges}
      filteredEdges={filteredEdges}
      zoom={zoom}
      onClose={onClose}
      onNodeSelect={onNodeSelect}
      onNodeHover={onNodeHover}
      {...props}
    />
  );
}

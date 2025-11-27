/**
 * React Wrapper for GraphClusterTargetsList Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterTargetsList } from '../ui/cluster-targets-list';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';

export const LitClusterTargetsListElement = createComponent({
  tagName: 'graph-cluster-targets-list',
  elementClass: GraphClusterTargetsList,
  react: React,
  events: {
    onNodeSelect: 'node-select',
    onNodeHover: 'node-hover',
  },
});

export interface LitClusterTargetsListProps extends React.HTMLAttributes<HTMLElement> {
  clusterNodes?: GraphNode[];
  nodesByType?: Record<string, GraphNode[]>;
  filteredTargetsCount?: number;
  totalTargetsCount?: number;
  edges?: GraphEdge[];
  zoom?: number;
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
}

export function ClusterTargetsList({
  clusterNodes = [],
  nodesByType,
  filteredTargetsCount = 0,
  totalTargetsCount = 0,
  edges,
  zoom = 1.0,
  className,
  onNodeSelect,
  onNodeHover,
  ...props
}: LitClusterTargetsListProps) {
  return (
    <LitClusterTargetsListElement
      clusterNodes={clusterNodes}
      nodesByType={nodesByType}
      filteredTargetsCount={filteredTargetsCount}
      totalTargetsCount={totalTargetsCount}
      edges={edges}
      zoom={zoom}
      className={className}
      onNodeSelect={onNodeSelect}
      onNodeHover={onNodeHover}
      {...props}
    />
  );
}

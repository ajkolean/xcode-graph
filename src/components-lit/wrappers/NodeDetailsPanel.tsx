/**
 * React Wrapper for GraphNodeDetailsPanel Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphNodeDetailsPanel } from '../ui/node-details-panel';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';

export const LitNodeDetailsPanelElement = createComponent({
  tagName: 'graph-node-details-panel',
  elementClass: GraphNodeDetailsPanel,
  react: React,
  events: {
    onClose: 'close',
    onNodeSelect: 'node-select',
    onClusterSelect: 'cluster-select',
    onNodeHover: 'node-hover',
    onFocusNode: 'focus-node',
    onShowDependents: 'show-dependents',
    onShowImpact: 'show-impact',
  },
});

export interface LitNodeDetailsPanelProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNode;
  allNodes?: GraphNode[];
  edges?: GraphEdge[];
  filteredEdges?: GraphEdge[];
  viewMode?: string;
  zoom?: number;
  onClose?: (event: CustomEvent) => void;
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onClusterSelect?: (event: CustomEvent<{ clusterId: string }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
  onFocusNode?: (event: CustomEvent) => void;
  onShowDependents?: (event: CustomEvent) => void;
  onShowImpact?: (event: CustomEvent) => void;
}

export function NodeDetailsPanel({
  node,
  allNodes,
  edges,
  filteredEdges,
  viewMode = '',
  zoom = 1.0,
  onClose,
  onNodeSelect,
  onClusterSelect,
  onNodeHover,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  ...props
}: LitNodeDetailsPanelProps = {}) {
  return (
    <LitNodeDetailsPanelElement
      node={node}
      allNodes={allNodes}
      edges={edges}
      filteredEdges={filteredEdges}
      view-mode={viewMode}
      zoom={zoom}
      onClose={onClose}
      onNodeSelect={onNodeSelect}
      onClusterSelect={onClusterSelect}
      onNodeHover={onNodeHover}
      onFocusNode={onFocusNode}
      onShowDependents={onShowDependents}
      onShowImpact={onShowImpact}
      {...props}
    />
  );
}

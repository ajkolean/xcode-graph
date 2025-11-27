/**
 * React Wrapper for GraphRightSidebar Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphRightSidebar } from '../ui/right-sidebar';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';

export const LitRightSidebarElement = createComponent({
  tagName: 'graph-right-sidebar',
  elementClass: GraphRightSidebar,
  react: React,
  events: {},
});

export interface LitRightSidebarProps extends React.HTMLAttributes<HTMLElement> {
  allNodes?: GraphNode[];
  allEdges?: GraphEdge[];
  filteredNodes?: GraphNode[];
  filteredEdges?: GraphEdge[];
  clusters?: Cluster[];
}

export function RightSidebar({
  allNodes,
  allEdges,
  filteredNodes,
  filteredEdges,
  clusters,
  ...props
}: LitRightSidebarProps = {}) {
  return (
    <LitRightSidebarElement
      allNodes={allNodes}
      allEdges={allEdges}
      filteredNodes={filteredNodes}
      filteredEdges={filteredEdges}
      clusters={clusters}
      {...props}
    />
  );
}

/**
 * React Wrapper for GraphTab Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphTab as GraphTabLit } from '../layout/graph-tab';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';

export const LitGraphTabElement = createComponent({
  tagName: 'graph-tab',
  elementClass: GraphTabLit,
  react: React,
  events: {},
});

export interface LitGraphTabProps extends React.HTMLAttributes<HTMLElement> {
  displayNodes?: GraphNode[];
  displayEdges?: GraphEdge[];
  filteredNodes?: GraphNode[];
  filteredEdges?: GraphEdge[];
  allNodes?: GraphNode[];
  allEdges?: GraphEdge[];
  transitiveDeps?: any;
  transitiveDependents?: any;
}

export function GraphTab({
  displayNodes,
  displayEdges,
  filteredNodes,
  filteredEdges,
  allNodes,
  allEdges,
  transitiveDeps,
  transitiveDependents,
  ...props
}: LitGraphTabProps = {}) {
  return (
    <LitGraphTabElement
      displayNodes={displayNodes}
      displayEdges={displayEdges}
      filteredNodes={filteredNodes}
      filteredEdges={filteredEdges}
      allNodes={allNodes}
      allEdges={allEdges}
      transitiveDeps={transitiveDeps}
      transitiveDependents={transitiveDependents}
      {...props}
    />
  );
}

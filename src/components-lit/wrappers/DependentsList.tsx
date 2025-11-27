/**
 * React Wrapper for GraphDependentsList Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphDependentsList } from '../ui/dependents-list';
import type { GraphNode } from '@/data/mockGraphData';

export const LitDependentsListElement = createComponent({
  tagName: 'graph-dependents-list',
  elementClass: GraphDependentsList,
  react: React,
  events: {
    onNodeSelect: 'node-select',
    onNodeHover: 'node-hover',
  },
});

export interface LitDependentsListProps extends React.HTMLAttributes<HTMLElement> {
  dependents?: GraphNode[];
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
}

export function DependentsList({
  dependents = [],
  className,
  onNodeSelect,
  onNodeHover,
  ...props
}: LitDependentsListProps) {
  return (
    <LitDependentsListElement
      dependents={dependents}
      className={className}
      onNodeSelect={onNodeSelect}
      onNodeHover={onNodeHover}
      {...props}
    />
  );
}

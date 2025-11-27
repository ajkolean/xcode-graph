/**
 * React Wrapper for GraphDependenciesList Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphDependenciesList } from '../ui/dependencies-list';
import type { GraphNode } from '@/data/mockGraphData';

export const LitDependenciesListElement = createComponent({
  tagName: 'graph-dependencies-list',
  elementClass: GraphDependenciesList,
  react: React,
  events: {
    onNodeSelect: 'node-select',
    onNodeHover: 'node-hover',
  },
});

export interface LitDependenciesListProps extends React.HTMLAttributes<HTMLElement> {
  dependencies?: GraphNode[];
  onNodeSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onNodeHover?: (event: CustomEvent<{ nodeId: string | null }>) => void;
}

export function DependenciesList({
  dependencies = [],
  className,
  onNodeSelect,
  onNodeHover,
  ...props
}: LitDependenciesListProps) {
  return (
    <LitDependenciesListElement
      dependencies={dependencies}
      className={className}
      onNodeSelect={onNodeSelect}
      onNodeHover={onNodeHover}
      {...props}
    />
  );
}

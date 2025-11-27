/**
 * React Wrapper for GraphNodeActions Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphNodeActions } from '../ui/node-actions';
import type { GraphNode } from '@/data/mockGraphData';

export const LitNodeActionsElement = createComponent({
  tagName: 'graph-node-actions',
  elementClass: GraphNodeActions,
  react: React,
  events: {
    onFocusNode: 'focus-node',
    onShowDependents: 'show-dependents',
    onShowImpact: 'show-impact',
  },
});

export interface LitNodeActionsProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNode;
  viewMode?: string;
  onFocusNode?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onShowDependents?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onShowImpact?: (event: CustomEvent<{ node: GraphNode }>) => void;
}

export function NodeActions({
  node,
  viewMode = '',
  className,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  ...props
}: LitNodeActionsProps) {
  return (
    <LitNodeActionsElement
      node={node}
      viewMode={viewMode}
      className={className}
      onFocusNode={onFocusNode}
      onShowDependents={onShowDependents}
      onShowImpact={onShowImpact}
      {...props}
    />
  );
}

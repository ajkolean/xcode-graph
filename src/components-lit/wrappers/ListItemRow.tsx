/**
 * React Wrapper for GraphListItemRow Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphListItemRow } from '../ui/list-item-row';
import type { GraphNode } from '@/data/mockGraphData';

export const LitListItemRowElement = createComponent({
  tagName: 'graph-list-item-row',
  elementClass: GraphListItemRow,
  react: React,
  events: {
    onRowSelect: 'row-select',
    onRowHover: 'row-hover',
    onRowHoverEnd: 'row-hover-end',
  },
});

export interface LitListItemRowProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNode;
  subtitle?: string;
  zoom?: number;
  isSelected?: boolean;
  onRowSelect?: (event: CustomEvent<{ node: GraphNode }>) => void;
  onRowHover?: (event: CustomEvent<{ nodeId: string }>) => void;
  onRowHoverEnd?: (event: CustomEvent) => void;
}

export function ListItemRow({
  node,
  subtitle = '',
  zoom = 1.0,
  isSelected = false,
  className,
  onRowSelect,
  onRowHover,
  onRowHoverEnd,
  ...props
}: LitListItemRowProps) {
  return (
    <LitListItemRowElement
      node={node}
      subtitle={subtitle}
      zoom={zoom}
      isSelected={isSelected}
      className={className}
      onRowSelect={onRowSelect}
      onRowHover={onRowHover}
      onRowHoverEnd={onRowHoverEnd}
      {...props}
    />
  );
}

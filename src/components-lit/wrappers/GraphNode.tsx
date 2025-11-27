/**
 * React Wrapper for GraphNode Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphNode } from '../graph/graph-node';
import type { GraphNode as GraphNodeType } from '@/data/mockGraphData';

export const LitGraphNodeElement = createComponent({
  tagName: 'graph-node',
  elementClass: GraphNode,
  react: React,
  events: {
    onNodeMouseenter: 'node-mouseenter',
    onNodeMouseleave: 'node-mouseleave',
    onNodeMousedown: 'node-mousedown',
    onNodeClick: 'node-click',
  },
});

export interface LitGraphNodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNodeType;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  isSelected?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  zoom?: number;
  onNodeMouseenter?: (event: CustomEvent) => void;
  onNodeMouseleave?: (event: CustomEvent) => void;
  onNodeMousedown?: (event: CustomEvent) => void;
  onNodeClick?: (event: CustomEvent) => void;
}

export function GraphNode({
  node,
  x = 0,
  y = 0,
  size = 24,
  color = '#8B5CF6',
  isSelected = false,
  isHovered = false,
  isDimmed = false,
  zoom = 1.0,
  onNodeMouseenter,
  onNodeMouseleave,
  onNodeMousedown,
  onNodeClick,
  ...props
}: LitGraphNodeProps) {
  return (
    <LitGraphNodeElement
      node={node}
      x={x}
      y={y}
      size={size}
      color={color}
      isSelected={isSelected}
      isHovered={isHovered}
      isDimmed={isDimmed}
      zoom={zoom}
      onNodeMouseenter={onNodeMouseenter}
      onNodeMouseleave={onNodeMouseleave}
      onNodeMousedown={onNodeMousedown}
      onNodeClick={onNodeClick}
      {...props}
    />
  );
}

/**
 * React Wrapper for GraphEdge Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphEdge } from '../graph/graph-edge';

export const LitGraphEdgeElement = createComponent({
  tagName: 'graph-edge',
  elementClass: GraphEdge,
  react: React,
});

export interface LitGraphEdgeProps extends React.HTMLAttributes<HTMLElement> {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color?: string;
  isHighlighted?: boolean;
  isDependent?: boolean;
  opacity?: number;
  zoom?: number;
  animated?: boolean;
}

export function GraphEdge({
  x1 = 0,
  y1 = 0,
  x2 = 0,
  y2 = 0,
  color = '#8B5CF6',
  isHighlighted = false,
  isDependent = false,
  opacity = 1.0,
  zoom = 1.0,
  animated = false,
  ...props
}: LitGraphEdgeProps) {
  return (
    <LitGraphEdgeElement
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      color={color}
      isHighlighted={isHighlighted}
      isDependent={isDependent}
      opacity={opacity}
      zoom={zoom}
      animated={animated}
      {...props}
    />
  );
}

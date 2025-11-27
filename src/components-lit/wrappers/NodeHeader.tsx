/**
 * React Wrapper for GraphNodeHeader Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphNodeHeader } from '../ui/node-header';
import type { GraphNode } from '@/data/mockGraphData';

export const LitNodeHeaderElement = createComponent({
  tagName: 'graph-node-header',
  elementClass: GraphNodeHeader,
  react: React,
  events: {
    onClose: 'close',
    onClusterClick: 'cluster-click',
  },
});

export interface LitNodeHeaderProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNode;
  zoom?: number;
  showClusterLink?: boolean;
  onClose?: (event: CustomEvent) => void;
  onClusterClick?: (event: CustomEvent<{ clusterId: string }>) => void;
}

export function NodeHeader({
  node,
  zoom = 1.0,
  showClusterLink = true,
  className,
  onClose,
  onClusterClick,
  ...props
}: LitNodeHeaderProps) {
  return (
    <LitNodeHeaderElement
      node={node}
      zoom={zoom}
      showClusterLink={showClusterLink}
      className={className}
      onClose={onClose}
      onClusterClick={onClusterClick}
      {...props}
    />
  );
}

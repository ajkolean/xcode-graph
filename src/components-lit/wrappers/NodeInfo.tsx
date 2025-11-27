/**
 * React Wrapper for GraphNodeInfo Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphNodeInfo } from '../ui/node-info';
import type { GraphNode } from '@/data/mockGraphData';

export const LitNodeInfoElement = createComponent({
  tagName: 'graph-node-info',
  elementClass: GraphNodeInfo,
  react: React,
});

export interface LitNodeInfoProps extends React.HTMLAttributes<HTMLElement> {
  node?: GraphNode;
}

export function NodeInfo({ node, className, ...props }: LitNodeInfoProps) {
  return <LitNodeInfoElement node={node} className={className} {...props} />;
}

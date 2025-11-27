/**
 * React Wrapper for GraphClusterTypeBadge Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterTypeBadge } from '../ui/cluster-type-badge';

/**
 * React wrapper element for graph-cluster-type-badge
 */
export const LitClusterTypeBadgeElement = createComponent({
  tagName: 'graph-cluster-type-badge',
  elementClass: GraphClusterTypeBadge,
  react: React,
  events: {},
});

/**
 * Props interface for the React wrapper
 */
export interface LitClusterTypeBadgeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The type of cluster (package or project)
   */
  clusterType?: 'package' | 'project';

  /**
   * The color to use for the badge (hex or CSS color)
   */
  clusterColor?: string;
}

/**
 * React component wrapper for graph-cluster-type-badge
 *
 * @example
 * ```tsx
 * <LitClusterTypeBadge clusterType="package" clusterColor="#8B5CF6" />
 * <LitClusterTypeBadge clusterType="project" clusterColor="#10B981" />
 * ```
 */
export function LitClusterTypeBadge({
  clusterType = 'package',
  clusterColor = '#8B5CF6',
  className,
  ...props
}: LitClusterTypeBadgeProps) {
  return (
    <LitClusterTypeBadgeElement
      clusterType={clusterType}
      clusterColor={clusterColor}
      className={className}
      {...props}
    />
  );
}

/**
 * React Wrapper for GraphCluster Lit Component
 *
 * SVG cluster container with background, border, and glow effects.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphCluster } from '../graph/graph-cluster';

export const LitGraphClusterElement = createComponent({
  tagName: 'graph-cluster',
  elementClass: GraphCluster,
  react: React,
  events: {
    onClusterMouseEnter: 'cluster-mouseenter',
    onClusterMouseLeave: 'cluster-mouseleave',
    onClusterClick: 'cluster-click',
  },
});

export interface LitGraphClusterProps extends React.SVGAttributes<SVGElement> {
  /**
   * Cluster identifier
   */
  clusterId?: string;

  /**
   * X position (center)
   */
  x?: number;

  /**
   * Y position (center)
   */
  y?: number;

  /**
   * Width of the cluster
   */
  width?: number;

  /**
   * Height of the cluster
   */
  height?: number;

  /**
   * Color for the cluster
   */
  color?: string;

  /**
   * Number of nodes in the cluster
   */
  nodeCount?: number;

  /**
   * Origin type (local or external)
   */
  origin?: 'local' | 'external';

  /**
   * Whether the cluster is hovered
   */
  isHovered?: boolean;

  /**
   * Called when mouse enters the cluster
   */
  onClusterMouseEnter?: (event: CustomEvent) => void;

  /**
   * Called when mouse leaves the cluster
   */
  onClusterMouseLeave?: (event: CustomEvent) => void;

  /**
   * Called when the cluster is clicked
   */
  onClusterClick?: (event: CustomEvent) => void;

  /**
   * Children (nodes, edges)
   */
  children?: React.ReactNode;
}

/**
 * React component wrapper for graph-cluster
 *
 * @example
 * ```tsx
 * <LitGraphCluster
 *   clusterId="MyProject"
 *   x={100}
 *   y={100}
 *   width={200}
 *   height={150}
 *   color="#8B5CF6"
 *   nodeCount={5}
 *   origin="local"
 *   isHovered={false}
 *   onClusterMouseEnter={() => setHovered(true)}
 *   onClusterMouseLeave={() => setHovered(false)}
 * >
 *   {children}
 * </LitGraphCluster>
 * ```
 */
export function LitGraphCluster({
  clusterId = '',
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  color = '#888',
  nodeCount = 0,
  origin = 'local',
  isHovered = false,
  className,
  onClusterMouseEnter,
  onClusterMouseLeave,
  onClusterClick,
  children,
  ...props
}: LitGraphClusterProps) {
  return (
    <LitGraphClusterElement
      clusterId={clusterId}
      x={x}
      y={y}
      width={width}
      height={height}
      color={color}
      nodeCount={nodeCount}
      origin={origin}
      isHovered={isHovered}
      className={className}
      onClusterMouseEnter={onClusterMouseEnter}
      onClusterMouseLeave={onClusterMouseLeave}
      onClusterClick={onClusterClick}
      {...props}
    >
      {children}
    </LitGraphClusterElement>
  );
}

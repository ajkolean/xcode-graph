/**
 * React Wrapper for GraphClusterCard Lit Component (SVG)
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterCard } from '../graph/cluster-card';
import type { Cluster } from '@/types/cluster';

export const LitClusterCardElement = createComponent({
  tagName: 'graph-cluster-card',
  elementClass: GraphClusterCard,
  react: React,
  events: {
    onClusterClick: 'cluster-click',
  },
});

export interface LitClusterCardProps {
  cluster?: Cluster;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isSelected?: boolean;
  zoom?: number;
  clickable?: boolean;
  onClusterClick?: (event: CustomEvent<{ cluster: Cluster }>) => void;
}

export function ClusterCard({
  cluster,
  x = 0,
  y = 0,
  width = 200,
  height = 150,
  isHighlighted = false,
  isDimmed = false,
  isSelected = false,
  zoom = 1.0,
  clickable = false,
  onClusterClick,
}: LitClusterCardProps = {}) {
  return (
    <LitClusterCardElement
      cluster={cluster}
      x={x}
      y={y}
      width={width}
      height={height}
      is-highlighted={isHighlighted}
      is-dimmed={isDimmed}
      is-selected={isSelected}
      zoom={zoom}
      clickable={clickable}
      onClusterClick={onClusterClick}
    />
  );
}

/**
 * React Wrapper for GraphClusterStats Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterStats } from '../ui/cluster-stats';

export const LitClusterStatsElement = createComponent({
  tagName: 'graph-cluster-stats',
  elementClass: GraphClusterStats,
  react: React,
});

export interface LitClusterStatsProps extends React.HTMLAttributes<HTMLElement> {
  filteredDependencies?: number;
  totalDependencies?: number;
  filteredDependents?: number;
  totalDependents?: number;
  platforms?: Set<string>;
}

export function ClusterStats({
  filteredDependencies = 0,
  totalDependencies = 0,
  filteredDependents = 0,
  totalDependents = 0,
  platforms = new Set(),
  className,
  ...props
}: LitClusterStatsProps) {
  return (
    <LitClusterStatsElement
      filteredDependencies={filteredDependencies}
      totalDependencies={totalDependencies}
      filteredDependents={filteredDependents}
      totalDependents={totalDependents}
      platforms={platforms}
      className={className}
      {...props}
    />
  );
}

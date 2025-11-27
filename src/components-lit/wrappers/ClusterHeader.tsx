/**
 * React Wrapper for GraphClusterHeader Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClusterHeader } from '../ui/cluster-header';

export const LitClusterHeaderElement = createComponent({
  tagName: 'graph-cluster-header',
  elementClass: GraphClusterHeader,
  react: React,
  events: {
    onBack: 'back',
  },
});

export interface LitClusterHeaderProps extends React.HTMLAttributes<HTMLElement> {
  clusterName?: string;
  clusterType?: 'package' | 'project';
  clusterColor?: string;
  isExternal?: boolean;
  onBack?: (event: CustomEvent) => void;
}

export function ClusterHeader({
  clusterName = '',
  clusterType = 'package',
  clusterColor = '#8B5CF6',
  isExternal = false,
  className,
  onBack,
  ...props
}: LitClusterHeaderProps) {
  return (
    <LitClusterHeaderElement
      clusterName={clusterName}
      clusterType={clusterType}
      clusterColor={clusterColor}
      isExternal={isExternal}
      className={className}
      onBack={onBack}
      {...props}
    />
  );
}

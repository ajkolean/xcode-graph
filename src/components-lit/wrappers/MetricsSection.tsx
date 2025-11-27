/**
 * React Wrapper for GraphMetricsSection Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphMetricsSection } from '../ui/metrics-section';

export const LitMetricsSectionElement = createComponent({
  tagName: 'graph-metrics-section',
  elementClass: GraphMetricsSection,
  react: React,
});

export interface LitMetricsSectionProps extends React.HTMLAttributes<HTMLElement> {
  dependenciesCount?: number;
  dependentsCount?: number;
  totalDependenciesCount?: number;
  totalDependentsCount?: number;
  isHighFanIn?: boolean;
  isHighFanOut?: boolean;
}

export function MetricsSection({
  dependenciesCount = 0,
  dependentsCount = 0,
  totalDependenciesCount = 0,
  totalDependentsCount = 0,
  isHighFanIn = false,
  isHighFanOut = false,
  className,
  ...props
}: LitMetricsSectionProps) {
  return (
    <LitMetricsSectionElement
      dependenciesCount={dependenciesCount}
      dependentsCount={dependentsCount}
      totalDependenciesCount={totalDependenciesCount}
      totalDependentsCount={totalDependentsCount}
      isHighFanIn={isHighFanIn}
      isHighFanOut={isHighFanOut}
      className={className}
      {...props}
    />
  );
}

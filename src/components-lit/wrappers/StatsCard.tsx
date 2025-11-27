/**
 * React Wrapper for GraphStatsCard Lit Component
 *
 * Allows React components to use the Lit StatsCard component seamlessly.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphStatsCard } from '../ui/stats-card';

/**
 * React wrapper element for graph-stats-card
 */
export const LitStatsCardElement = createComponent({
  tagName: 'graph-stats-card',
  elementClass: GraphStatsCard,
  react: React,
  events: {},
});

/**
 * Props interface for the React wrapper
 */
export interface LitStatsCardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The label text displayed above the value
   */
  label?: string;

  /**
   * The value to display (can be string or number)
   */
  value?: string | number;

  /**
   * Whether to highlight the value with accent color
   */
  highlighted?: boolean;
}

/**
 * React component wrapper for graph-stats-card
 *
 * @example
 * ```tsx
 * <LitStatsCard label="Total Nodes" value="42" />
 * <LitStatsCard label="Selected" value={10} highlighted />
 * ```
 */
export function LitStatsCard({
  label = '',
  value = '',
  highlighted = false,
  className,
  ...props
}: LitStatsCardProps) {
  return (
    <LitStatsCardElement
      label={label}
      value={value}
      highlighted={highlighted}
      className={className}
      {...props}
    />
  );
}

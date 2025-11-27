/**
 * React Wrapper for GraphEmptyState Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphEmptyState } from '../ui/empty-state';

export const LitEmptyStateElement = createComponent({
  tagName: 'graph-empty-state',
  elementClass: GraphEmptyState,
  react: React,
  events: {
    onClearFilters: 'clear-filters',
  },
});

export interface LitEmptyStateProps extends React.HTMLAttributes<HTMLElement> {
  hasActiveFilters?: boolean;
  onClearFilters?: (event: CustomEvent) => void;
}

export function EmptyState({
  hasActiveFilters = false,
  className,
  onClearFilters,
  ...props
}: LitEmptyStateProps) {
  return (
    <LitEmptyStateElement
      hasActiveFilters={hasActiveFilters}
      className={className}
      onClearFilters={onClearFilters}
      {...props}
    />
  );
}

// Alias for backwards compatibility
export const LitEmptyState = EmptyState;

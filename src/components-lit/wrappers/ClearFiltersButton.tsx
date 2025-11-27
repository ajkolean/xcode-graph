/**
 * React Wrapper for GraphClearFiltersButton Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphClearFiltersButton } from '../ui/clear-filters-button';

/**
 * React wrapper element for graph-clear-filters-button
 */
export const LitClearFiltersButtonElement = createComponent({
  tagName: 'graph-clear-filters-button',
  elementClass: GraphClearFiltersButton,
  react: React,
  events: {
    onClearFilters: 'clear-filters',
  },
});

/**
 * Props interface for the React wrapper
 */
export interface LitClearFiltersButtonProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Whether the button is active (has filters to clear)
   */
  isActive?: boolean;

  /**
   * Event handler for clear-filters event
   */
  onClearFilters?: (event: CustomEvent) => void;
}

/**
 * React component wrapper for graph-clear-filters-button
 *
 * @example
 * ```tsx
 * <LitClearFiltersButton
 *   isActive={hasActiveFilters}
 *   onClearFilters={() => clearAllFilters()}
 * />
 * ```
 */
export function LitClearFiltersButton({
  isActive = false,
  className,
  onClearFilters,
  ...props
}: LitClearFiltersButtonProps) {
  return (
    <LitClearFiltersButtonElement
      isActive={isActive}
      className={className}
      onClearFilters={onClearFilters}
      {...props}
    />
  );
}

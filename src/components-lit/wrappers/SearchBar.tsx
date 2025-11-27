/**
 * React Wrapper for GraphSearchBar Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphSearchBar } from '../ui/search-bar';

export const LitSearchBarElement = createComponent({
  tagName: 'graph-search-bar',
  elementClass: GraphSearchBar,
  react: React,
  events: {
    onSearchChange: 'search-change',
    onSearchClear: 'search-clear',
  },
});

export interface LitSearchBarProps extends React.HTMLAttributes<HTMLElement> {
  searchQuery?: string;
  onSearchChange?: (event: CustomEvent<{ query: string }>) => void;
  onSearchClear?: (event: CustomEvent) => void;
}

export function SearchBar({
  searchQuery = '',
  className,
  onSearchChange,
  onSearchClear,
  ...props
}: LitSearchBarProps = {}) {
  return (
    <LitSearchBarElement
      searchQuery={searchQuery}
      className={className}
      onSearchChange={onSearchChange}
      onSearchClear={onSearchClear}
      {...props}
    />
  );
}

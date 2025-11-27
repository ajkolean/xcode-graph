/**
 * React Wrapper for GraphFilterView Lit Component
 *
 * Complete filter interface with stats, search, and filter sections.
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphFilterView, type FilterItem } from '../ui/filter-view';
import type { FilterState } from '@/types/app';

export const LitFilterViewElement = createComponent({
  tagName: 'graph-filter-view',
  elementClass: GraphFilterView,
  react: React,
  events: {
    onFiltersChange: 'filters-change',
    onSearchChange: 'search-change',
    onSectionToggle: 'section-toggle',
    onPreviewChange: 'preview-change',
    onClearFilters: 'clear-filters',
  },
});

export interface LitFilterViewProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Count of filtered nodes
   */
  filteredNodesCount?: number;

  /**
   * Total count of nodes
   */
  totalNodesCount?: number;

  /**
   * Count of filtered edges
   */
  filteredEdgesCount?: number;

  /**
   * Total count of edges
   */
  totalEdgesCount?: number;

  /**
   * Current filter state
   */
  filters?: FilterState;

  /**
   * Current search query
   */
  searchQuery?: string;

  /**
   * Node type filter items
   */
  nodeTypeItems?: FilterItem[];

  /**
   * Platform filter items
   */
  platformItems?: FilterItem[];

  /**
   * Project filter items
   */
  projectItems?: FilterItem[];

  /**
   * Package filter items
   */
  packageItems?: FilterItem[];

  /**
   * Current zoom level
   */
  zoom?: number;

  /**
   * Called when filter state changes
   */
  onFiltersChange?: (event: CustomEvent<{ filters: FilterState }>) => void;

  /**
   * Called when search query changes
   */
  onSearchChange?: (event: CustomEvent<{ query: string }>) => void;

  /**
   * Called when a section is toggled
   */
  onSectionToggle?: (event: CustomEvent<{ section: string }>) => void;

  /**
   * Called when preview filter changes on hover
   */
  onPreviewChange?: (event: CustomEvent<{ type: string; value: string } | null>) => void;

  /**
   * Called when clear filters button is clicked
   */
  onClearFilters?: (event: CustomEvent) => void;
}

/**
 * React component wrapper for graph-filter-view
 *
 * @example
 * ```tsx
 * <LitFilterView
 *   filteredNodesCount={10}
 *   totalNodesCount={100}
 *   filteredEdgesCount={25}
 *   totalEdgesCount={200}
 *   filters={filterState}
 *   searchQuery=""
 *   nodeTypeItems={nodeTypes}
 *   platformItems={platforms}
 *   projectItems={projects}
 *   packageItems={packages}
 *   zoom={1.0}
 *   onFiltersChange={(e) => setFilters(e.detail.filters)}
 *   onSearchChange={(e) => setSearch(e.detail.query)}
 * />
 * ```
 */
export function LitFilterView({
  filteredNodesCount = 0,
  totalNodesCount = 0,
  filteredEdgesCount = 0,
  totalEdgesCount = 0,
  filters = {
    nodeTypes: new Set(),
    platforms: new Set(),
    projects: new Set(),
    packages: new Set(),
  },
  searchQuery = '',
  nodeTypeItems = [],
  platformItems = [],
  projectItems = [],
  packageItems = [],
  zoom = 1.0,
  className,
  onFiltersChange,
  onSearchChange,
  onSectionToggle,
  onPreviewChange,
  onClearFilters,
  ...props
}: LitFilterViewProps) {
  return (
    <LitFilterViewElement
      filteredNodesCount={filteredNodesCount}
      totalNodesCount={totalNodesCount}
      filteredEdgesCount={filteredEdgesCount}
      totalEdgesCount={totalEdgesCount}
      filters={filters}
      searchQuery={searchQuery}
      nodeTypeItems={nodeTypeItems}
      platformItems={platformItems}
      projectItems={projectItems}
      packageItems={packageItems}
      zoom={zoom}
      className={className}
      onFiltersChange={onFiltersChange}
      onSearchChange={onSearchChange}
      onSectionToggle={onSectionToggle}
      onPreviewChange={onPreviewChange}
      onClearFilters={onClearFilters}
      {...props}
    />
  );
}

export type { FilterItem };

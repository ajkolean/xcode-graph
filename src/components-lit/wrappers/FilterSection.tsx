/**
 * React Wrapper for GraphFilterSection Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphFilterSection, type FilterType, type FilterItem } from '../ui/filter-section';

export const LitFilterSectionElement = createComponent({
  tagName: 'graph-filter-section',
  elementClass: GraphFilterSection,
  react: React,
  events: {
    onSectionToggle: 'section-toggle',
    onItemToggle: 'item-toggle',
    onPreviewChange: 'preview-change',
  },
});

export interface LitFilterSectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  title?: string;
  iconName?: string;
  icon?: React.ReactNode; // For passing React icon element
  isExpanded?: boolean;
  items?: FilterItem[];
  selectedItems?: Set<string>;
  filterType?: FilterType;
  zoom?: number;
  onSectionToggle?: (event: CustomEvent) => void;
  onItemToggle?: (event: CustomEvent<{ key: string; checked: boolean }>) => void;
  onPreviewChange?: (event: CustomEvent<{ type: FilterType; value: string } | null>) => void;
}

export function FilterSection({
  id = '',
  title = '',
  iconName,
  icon,
  isExpanded = false,
  items = [],
  selectedItems = new Set(),
  filterType = 'nodeType',
  zoom = 1.0,
  className,
  onSectionToggle,
  onItemToggle,
  onPreviewChange,
  ...props
}: LitFilterSectionProps) {
  return (
    <LitFilterSectionElement
      id={id}
      title={title}
      iconName={iconName}
      isExpanded={isExpanded}
      items={items}
      selectedItems={selectedItems}
      filterType={filterType}
      zoom={zoom}
      className={className}
      onSectionToggle={onSectionToggle}
      onItemToggle={onItemToggle}
      onPreviewChange={onPreviewChange}
      {...props}
    >
      {icon && <div slot="icon">{icon}</div>}
    </LitFilterSectionElement>
  );
}

export type { FilterType, FilterItem };

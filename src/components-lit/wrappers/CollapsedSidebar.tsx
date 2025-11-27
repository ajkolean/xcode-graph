/**
 * React Wrapper for GraphCollapsedSidebar Lit Component
 */

import React from 'react';
import { createComponent } from '@lit/react';
import { GraphCollapsedSidebar } from '../ui/collapsed-sidebar';
import type { GraphNode, GraphEdge } from '@/data/mockGraphData';

export const LitCollapsedSidebarElement = createComponent({
  tagName: 'graph-collapsed-sidebar',
  elementClass: GraphCollapsedSidebar,
  react: React,
  events: {
    onExpandToSection: 'expand-to-section',
  },
});

export interface LitCollapsedSidebarProps extends React.HTMLAttributes<HTMLElement> {
  filteredNodes?: GraphNode[];
  filteredEdges?: GraphEdge[];
  typeCounts?: Map<string, number>;
  platformCounts?: Map<string, number>;
  nodeTypesFilterSize?: number;
  platformsFilterSize?: number;
  projectsFilterSize?: number;
  packagesFilterSize?: number;
  onExpandToSection?: (event: CustomEvent<{ section: string }>) => void;
}

export function CollapsedSidebar({
  filteredNodes,
  filteredEdges,
  typeCounts,
  platformCounts,
  nodeTypesFilterSize = 0,
  platformsFilterSize = 0,
  projectsFilterSize = 0,
  packagesFilterSize = 0,
  onExpandToSection,
  ...props
}: LitCollapsedSidebarProps = {}) {
  return (
    <LitCollapsedSidebarElement
      filteredNodes={filteredNodes}
      filteredEdges={filteredEdges}
      typeCounts={typeCounts}
      platformCounts={platformCounts}
      node-types-filter-size={nodeTypesFilterSize}
      platforms-filter-size={platformsFilterSize}
      projects-filter-size={projectsFilterSize}
      packages-filter-size={packagesFilterSize}
      onExpandToSection={onExpandToSection}
      {...props}
    />
  );
}

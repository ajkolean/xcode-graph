/**
 * Right sidebar component - main orchestrator
 * Refactored for better modularity and maintainability
 * All styling uses design system CSS variables
 */

import { useState } from 'react';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { useFilters } from '../hooks/useFilters';
import type { FilterState } from '../types/app';
import type { Cluster } from '../types/cluster';
import { generateColorMap, getNodeTypeColor } from '../utils/filterHelpers';
import { PLATFORM_COLOR } from '../utils/platformIcons';
import { ClusterDetailsPanel } from './ClusterDetailsPanel';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { CollapsedSidebar } from './sidebar/CollapsedSidebar';
import { FilterView } from './sidebar/FilterView';
import { RightSidebarHeader } from './sidebar/RightSidebarHeader';

interface RightSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  onNodeSelect: (node: GraphNode | null) => void;
  onClusterSelect: (clusterId: string | null) => void;
  onNodeHover: (nodeId: string | null) => void;
  onClose?: () => void;
  onFocusNode: (node: GraphNode) => void;
  onShowDependents: (node: GraphNode) => void;
  onShowImpact: (node: GraphNode) => void;
  viewMode?: string;
  clusters?: Cluster[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  zoom: number;
  previewFilter: {
    type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
    value: string;
  } | null;
  onPreviewFilterChange: (
    preview: {
      type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
      value: string;
    } | null,
  ) => void;
}

export function RightSidebar({
  filters,
  onFiltersChange,
  allNodes,
  allEdges,
  filteredNodes,
  filteredEdges,
  selectedNode,
  selectedCluster,
  onNodeSelect,
  onClusterSelect,
  onNodeHover,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  viewMode,
  clusters,
  searchQuery,
  onSearchChange,
  zoom,
  previewFilter,
  onPreviewFilterChange,
}: RightSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    productTypes: true,
    platforms: true,
    projects: true,
    packages: true,
  });

  // Use custom hook for filter logic
  const {
    typeCounts,
    platformCounts,
    projectCounts,
    packageCounts,
    hasActiveFilters,
    createClearFilters,
  } = useFilters(allNodes);

  const isFiltersActive = hasActiveFilters(filters);
  const clearAllFilters = createClearFilters(onFiltersChange);

  // Generate color maps
  const projectColors = generateColorMap(projectCounts.keys(), 'project');
  const packageColors = generateColorMap(packageCounts.keys(), 'package');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const expandToSection = (section: string) => {
    // Clear any node/cluster selection first
    if (selectedNode) onNodeSelect(null);
    if (selectedCluster) onClusterSelect(null);

    setIsCollapsed(false);
    setExpandedSections((prev) => ({ ...prev, [section]: true }));

    // Small delay to allow sidebar to expand before scrolling
    setTimeout(() => {
      const element = document.getElementById(`filter-section-${section}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Prepare filter items for FilterSection component
  const nodeTypeItems = Array.from(typeCounts.entries()).map(([type, count]) => ({
    key: type,
    count,
    color: getNodeTypeColor(type),
  }));

  const platformItems = Array.from(platformCounts.entries()).map(([platform, count]) => ({
    key: platform,
    count,
    color: PLATFORM_COLOR,
  }));

  const projectItems = Array.from(projectCounts.entries()).map(([project, count]) => ({
    key: project,
    count,
    color: projectColors.get(project) || '#6F2CFF',
  }));

  const packageItems = Array.from(packageCounts.entries()).map(([packageName, count]) => ({
    key: packageName,
    count,
    color: packageColors.get(packageName) || '#FF9800',
  }));

  // Determine header title
  const headerTitle = selectedNode
    ? 'Node Details'
    : selectedCluster
      ? 'Cluster Details'
      : 'Project Overview';

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden transition-smooth panel-shadow-lg"
      style={{
        width: isCollapsed ? '56px' : '320px',
        backgroundColor: 'var(--color-sidebar)',
        borderLeft: '1px solid var(--color-sidebar-border)',
      }}
    >
      {/* Unified Header */}
      <RightSidebarHeader
        title={headerTitle}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Collapsed State */}
      {isCollapsed && (
        <CollapsedSidebar
          filteredNodes={filteredNodes}
          filteredEdges={filteredEdges}
          typeCounts={typeCounts}
          platformCounts={platformCounts}
          projectCounts={projectCounts}
          packageCounts={packageCounts}
          nodeTypesFilterSize={filters.nodeTypes.size}
          platformsFilterSize={filters.platforms.size}
          projectsFilterSize={filters.projects.size}
          packagesFilterSize={filters.packages.size}
          onExpandToSection={expandToSection}
        />
      )}

      {/* Content Area - hidden when collapsed */}
      {!isCollapsed &&
        (selectedNode ? (
          // Node Details Content
          <div
            className="flex-1 overflow-y-auto"
            style={{
              animation: 'slideInRight 0.25s ease-out',
            }}
          >
            <NodeDetailsPanel
              node={selectedNode}
              allNodes={allNodes}
              edges={allEdges}
              filteredEdges={filteredEdges}
              clusters={clusters}
              onClose={() => onNodeSelect(null)}
              onNodeSelect={onNodeSelect}
              onClusterSelect={onClusterSelect}
              onNodeHover={onNodeHover}
              onFocusNode={onFocusNode}
              onShowDependents={onShowDependents}
              onShowImpact={onShowImpact}
              viewMode={viewMode}
              zoom={zoom}
            />
          </div>
        ) : selectedCluster ? (
          // Cluster Details Content
          <div
            className="flex-1 overflow-y-auto"
            style={{
              animation: 'slideInRight 0.25s ease-out',
            }}
          >
            <ClusterDetailsPanel
              cluster={(() => {
                // Find cluster data from allNodes based on cluster ID
                const clusterNodes = allNodes.filter(
                  (n) =>
                    (n.project === selectedCluster && n.type !== 'package') ||
                    (n.type === 'package' && n.name === selectedCluster),
                );

                const firstNode = clusterNodes[0];
                const clusterType = firstNode?.type === 'package' ? 'package' : 'project';
                const clusterOrigin = clusterNodes.some((n) => n.origin === 'external')
                  ? 'external'
                  : 'local';

                return {
                  id: selectedCluster,
                  name: selectedCluster,
                  type: clusterType,
                  origin: clusterOrigin,
                  nodes: clusterNodes,
                } as Cluster;
              })()}
              clusterNodes={allNodes.filter(
                (n) =>
                  (n.project === selectedCluster && n.type !== 'package') ||
                  (n.type === 'package' && n.name === selectedCluster),
              )}
              allNodes={allNodes}
              edges={allEdges}
              filteredEdges={filteredEdges}
              onClose={() => onClusterSelect(null)}
              onNodeSelect={onNodeSelect}
              onNodeHover={onNodeHover}
              zoom={zoom}
            />
          </div>
        ) : (
          // Project Overview Content - Filter View
          <FilterView
            filteredNodesCount={filteredNodes.length}
            totalNodesCount={allNodes.length}
            filteredEdgesCount={filteredEdges.length}
            totalEdgesCount={allEdges.length}
            filters={filters}
            onFiltersChange={onFiltersChange}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            nodeTypeItems={nodeTypeItems}
            platformItems={platformItems}
            projectItems={projectItems}
            packageItems={packageItems}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            isFiltersActive={isFiltersActive}
            onClearFilters={clearAllFilters}
            zoom={zoom}
            onPreviewChange={onPreviewFilterChange}
          />
        ))}
    </aside>
  );
}

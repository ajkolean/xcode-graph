/**
 * Right sidebar component - main orchestrator
 * Refactored for better modularity and maintainability
 * All styling uses design system CSS variables
 * Reads state from Zustand stores
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { useFilters } from '../hooks/useFilters';
import { type SidebarSection, useSidebarMachine } from '../hooks/useSidebarMachine';
import { useGraphStore } from '../stores/graphStore';
import { useFilterStore } from '../stores/filterStore';
import { useUIStore } from '../stores/uiStore';
import type { Cluster } from '../types/cluster';
import { generateColorMap, getNodeTypeColor } from '../utils/filterHelpers';
import { PLATFORM_COLOR } from '../utils/platformIcons';
import { ClusterDetailsPanel } from './ClusterDetailsPanel';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { CollapsedSidebar } from './sidebar/CollapsedSidebar';
import { FilterView } from './sidebar/FilterView';
import { RightSidebarHeader } from './sidebar/RightSidebarHeader';

interface RightSidebarProps {
  // Data - still passed as props
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  clusters?: Cluster[];
}

export function RightSidebar({
  allNodes,
  allEdges,
  filteredNodes,
  filteredEdges,
  clusters,
}: RightSidebarProps) {
  // Graph store
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedCluster = useGraphStore((s) => s.selectedCluster);
  const viewMode = useGraphStore((s) => s.viewMode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const selectCluster = useGraphStore((s) => s.selectCluster);
  const setHoveredNode = useGraphStore((s) => s.setHoveredNode);
  const focusNode = useGraphStore((s) => s.focusNode);
  const showDependents = useGraphStore((s) => s.showDependents);
  const showImpact = useGraphStore((s) => s.showImpact);

  // Filter store
  const filters = useFilterStore((s) => s.filters);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setFilters = useFilterStore((s) => s.setFilters);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  // UI store
  const zoom = useUIStore((s) => s.zoom);
  const setPreviewFilter = useUIStore((s) => s.setPreviewFilter);

  // Use sidebar state machine (Zag)
  const {
    isCollapsed,
    expandedSections,
    toggle: toggleSidebar,
    toggleSection: toggleSectionMachine,
    expandToSection: expandToSectionMachine,
  } = useSidebarMachine();

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
  const clearAllFilters = createClearFilters(setFilters);

  // Generate color maps
  const projectColors = generateColorMap(projectCounts.keys(), 'project');
  const packageColors = generateColorMap(packageCounts.keys(), 'package');

  const toggleSection = (section: string) => {
    toggleSectionMachine(section as SidebarSection);
  };

  const expandToSection = (section: string) => {
    // Clear any node/cluster selection first
    if (selectedNode) selectNode(null);
    if (selectedCluster) selectCluster(null);

    // Use machine to expand to section
    expandToSectionMachine(section as SidebarSection);

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
        onToggleCollapse={toggleSidebar}
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
              onClose={() => selectNode(null)}
              onNodeSelect={selectNode}
              onClusterSelect={selectCluster}
              onNodeHover={setHoveredNode}
              onFocusNode={focusNode}
              onShowDependents={showDependents}
              onShowImpact={showImpact}
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
              onClose={() => selectCluster(null)}
              onNodeSelect={selectNode}
              onNodeHover={setHoveredNode}
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
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            nodeTypeItems={nodeTypeItems}
            platformItems={platformItems}
            projectItems={projectItems}
            packageItems={packageItems}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            isFiltersActive={isFiltersActive}
            onClearFilters={clearAllFilters}
            zoom={zoom}
            onPreviewChange={setPreviewFilter}
          />
        ))}
    </aside>
  );
}

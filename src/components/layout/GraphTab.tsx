/**
 * Graph tab content component
 * Extracted from App.tsx for better modularity
 * Uses design system CSS variables
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import type { FilterState, ViewMode } from '../../types/app';
import { GraphVisualization } from '../GraphVisualization';
import { RightSidebar } from '../RightSidebar';
import { Toolbar } from './Toolbar';

interface GraphTabProps {
  // Data
  displayNodes: GraphNode[];
  displayEdges: GraphEdge[];
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  allNodes: GraphNode[];
  allEdges: GraphEdge[];

  // State
  selectedNode: GraphNode | null;
  selectedCluster: string | null;
  hoveredNode: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  zoom: number;
  filters: FilterState;

  // Handlers
  onNodeSelect: (node: GraphNode | null) => void;
  onClusterSelect: (clusterId: string | null) => void;
  onNodeHover: (nodeId: string | null) => void;
  onFocusNode: (node: GraphNode) => void;
  onShowDependents: (node: GraphNode) => void;
  onShowImpact: (node: GraphNode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFiltersChange: (filters: FilterState) => void;
  onSearchChange: (query: string) => void;

  // Depth information for edge opacity
  transitiveDeps: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  transitiveDependents: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };

  // Animation
  enableAnimation: boolean;
  onToggleAnimation: (enabled: boolean) => void;

  // Filter preview
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

export function GraphTab({
  displayNodes,
  displayEdges,
  filteredNodes,
  filteredEdges,
  allNodes,
  allEdges,
  selectedNode,
  selectedCluster,
  hoveredNode,
  searchQuery,
  viewMode,
  zoom,
  filters,
  onNodeSelect,
  onClusterSelect,
  onNodeHover,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFiltersChange,
  onSearchChange,
  transitiveDeps,
  transitiveDependents,
  enableAnimation,
  onToggleAnimation,
  previewFilter,
  onPreviewFilterChange,
}: GraphTabProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onZoomReset={onZoomReset}
          nodeCount={filteredNodes.length}
          edgeCount={filteredEdges.length}
        />

        {/* Graph + Right Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Graph Visualization */}
          <div className="flex-1 relative">
            <GraphVisualization
              nodes={displayNodes}
              edges={displayEdges}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
              onClusterSelect={onClusterSelect}
              searchQuery={searchQuery}
              viewMode={viewMode}
              zoom={zoom}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onZoomReset={onZoomReset}
              transitiveDeps={transitiveDeps}
              transitiveDependents={transitiveDependents}
              enableAnimation={enableAnimation}
              onToggleAnimation={onToggleAnimation}
              selectedCluster={selectedCluster}
              hoveredNode={hoveredNode}
              onNodeHover={onNodeHover}
              previewFilter={previewFilter}
            />
          </div>

          {/* Right Sidebar with Filters and Node/Cluster Details */}
          <RightSidebar
            filters={filters}
            onFiltersChange={onFiltersChange}
            allNodes={allNodes}
            allEdges={allEdges}
            filteredNodes={filteredNodes}
            filteredEdges={filteredEdges}
            selectedNode={selectedNode}
            selectedCluster={selectedCluster}
            onNodeSelect={onNodeSelect}
            onClusterSelect={onClusterSelect}
            onNodeHover={onNodeHover}
            onFocusNode={onFocusNode}
            onShowDependents={onShowDependents}
            onShowImpact={onShowImpact}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            zoom={zoom}
            previewFilter={previewFilter}
            onPreviewFilterChange={onPreviewFilterChange}
          />
        </div>
      </div>
    </div>
  );
}

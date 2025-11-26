/**
 * Graph tab content component
 * Extracted from App.tsx for better modularity
 * Uses design system CSS variables
 * Reads state from Zustand stores
 */

import type { GraphEdge, GraphNode } from '../../data/mockGraphData';
import { useGraphStore } from '../../stores/graphStore';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import { GraphVisualization } from '../GraphVisualization';
import { RightSidebar } from '../RightSidebar';
import { Toolbar } from './Toolbar';

interface GraphTabProps {
  // Data - still passed as props (computed in App)
  displayNodes: GraphNode[];
  displayEdges: GraphEdge[];
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  allNodes: GraphNode[];
  allEdges: GraphEdge[];

  // Depth information for edge opacity (computed in App)
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
}

export function GraphTab({
  displayNodes,
  displayEdges,
  filteredNodes,
  filteredEdges,
  allNodes,
  allEdges,
  transitiveDeps,
  transitiveDependents,
}: GraphTabProps) {
  // Graph store - only what GraphVisualization needs
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedCluster = useGraphStore((s) => s.selectedCluster);
  const hoveredNode = useGraphStore((s) => s.hoveredNode);
  const viewMode = useGraphStore((s) => s.viewMode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const selectCluster = useGraphStore((s) => s.selectCluster);
  const setHoveredNode = useGraphStore((s) => s.setHoveredNode);

  // Filter store - only searchQuery for GraphVisualization
  const searchQuery = useFilterStore((s) => s.searchQuery);

  // UI store - for Toolbar and GraphVisualization
  const zoom = useUIStore((s) => s.zoom);
  const enableAnimation = useUIStore((s) => s.enableAnimation);
  const previewFilter = useUIStore((s) => s.previewFilter);
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const resetZoom = useUIStore((s) => s.resetZoom);
  const setEnableAnimation = useUIStore((s) => s.setEnableAnimation);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={resetZoom}
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
              onNodeSelect={selectNode}
              onClusterSelect={selectCluster}
              searchQuery={searchQuery}
              viewMode={viewMode}
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onZoomReset={resetZoom}
              transitiveDeps={transitiveDeps}
              transitiveDependents={transitiveDependents}
              enableAnimation={enableAnimation}
              onToggleAnimation={setEnableAnimation}
              selectedCluster={selectedCluster}
              hoveredNode={hoveredNode}
              onNodeHover={setHoveredNode}
              previewFilter={previewFilter}
            />
          </div>

          {/* Right Sidebar with Filters and Node/Cluster Details */}
          <RightSidebar
            allNodes={allNodes}
            allEdges={allEdges}
            filteredNodes={filteredNodes}
            filteredEdges={filteredEdges}
          />
        </div>
      </div>
    </div>
  );
}

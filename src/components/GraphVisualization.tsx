/**
 * Main graph visualization component
 * Refactored to use modular sub-components and custom hooks
 */

import { useRef, useState, useMemo, useCallback } from 'react';
import { GraphNode as GraphNodeType, GraphEdge } from '../data/mockGraphData';
import { ViewMode } from '../types/app';
import { useDeterministicLayout } from './graph/useDeterministicLayout';
import { useAnimatedLayout } from './graph/useAnimatedLayout';
import { useGraphInteraction } from './graph/useGraphInteraction';
import { GraphSVGDefs } from './graph/GraphSVGDefs';
import { GraphEdges } from './graph/GraphEdges';
import { ClusterGroup } from './graph/ClusterGroup';
import { GraphControls, GraphInstructions, GraphEmptyState, GraphBackground } from './graph/GraphOverlays';

interface GraphVisualizationProps {
  nodes: GraphNodeType[];
  edges: GraphEdge[];
  selectedNode: GraphNodeType | null;
  onNodeSelect: (node: GraphNodeType | null) => void;
  onClusterSelect: (clusterId: string | null) => void;
  searchQuery: string;
  viewMode: ViewMode;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
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
  enableAnimation: boolean;
  onToggleAnimation: (enabled: boolean) => void;
  selectedCluster?: string | null;
  hoveredNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
  previewFilter?: { type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster', value: string } | null;
}

export function GraphVisualization({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onClusterSelect,
  searchQuery,
  viewMode,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  transitiveDeps,
  transitiveDependents,
  enableAnimation,
  onToggleAnimation,
  selectedCluster = null,
  hoveredNode,
  onNodeHover,
  previewFilter
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // Choose layout based on animation toggle
  const deterministicLayout = useDeterministicLayout(nodes, edges, {
    enableRelaxation: true,
    relaxationIterations: 30
  });

  const animatedLayout = useAnimatedLayout(nodes, edges, {
    enableAnimation,
    animationTicks: 30
  });

  // Use animated layout when enabled, otherwise deterministic
  const { nodePositions, clusterPositions, clusters } = enableAnimation ? animatedLayout : deterministicLayout;

  // Interaction handling (pan, zoom, drag)
  const {
    pan,
    isDragging,
    manualNodePositions,
    hasMoved,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeMouseDown
  } = useGraphInteraction({
    svgRef,
    zoom,
    finalNodePositions: nodePositions,
    clusterPositions
  });

  // Merge manual positions with calculated positions
  const finalNodePositions = useMemo(() => {
    const merged = new Map(nodePositions);
    manualNodePositions.forEach((pos, id) => {
      const nodePos = merged.get(id);
      if (nodePos) {
        nodePos.x = pos.x;
        nodePos.y = pos.y;
      }
    });
    return merged;
  }, [nodePositions, manualNodePositions]);

  // Map clusters by ID for easy lookup
  const clustersById = useMemo(() => {
    const map = new Map();
    clusters.forEach(cluster => {
      map.set(cluster.id, cluster);
    });
    return map;
  }, [clusters]);

  // Node click handler (memoized to prevent event listener re-attachment)
  const handleNodeClick = useCallback((node: GraphNodeType, e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelect(node);
  }, [onNodeSelect]);

  // Canvas click handler - deselect node when clicking on background
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't deselect if we were panning (dragging the canvas)
    if (hasMoved) {
      return;
    }
    
    // Only deselect if clicking directly on the SVG background (not on nodes/clusters)
    if (e.target === e.currentTarget || (e.target as Element).closest('g.graph-background')) {
      onNodeSelect(null);
      onClusterSelect(null);
    }
  }, [hasMoved, onNodeSelect, onClusterSelect]);

  // Wheel handler for zoom (memoized to prevent event listener re-attachment)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only zoom if Ctrl/Cmd key is pressed (also captures trackpad pinch)
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }
    
    e.preventDefault();
    
    // Determine zoom direction (negative deltaY = scroll up = zoom in)
    if (e.deltaY < 0) {
      onZoomIn();
    } else {
      onZoomOut();
    }
  }, [onZoomIn, onZoomOut]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        fontFamily: 'Inter, sans-serif'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background grid */}
      <GraphBackground />

      {/* Main SVG canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onClick={handleCanvasClick}
      >
        <GraphSVGDefs />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Cross-cluster edges */}
          <g className="cluster-edges">
            <GraphEdges
              edges={edges}
              nodes={nodes}
              finalNodePositions={finalNodePositions}
              clusterPositions={clusterPositions}
              selectedNode={selectedNode}
              hoveredNode={hoveredNode}
              hoveredClusterId={hoveredCluster}
              viewMode={viewMode}
              transitiveDeps={transitiveDeps}
              transitiveDependents={transitiveDependents}
              zoom={zoom}
            />
          </g>

          {/* Clusters with their nodes and internal edges */}
          {Array.from(clusterPositions.entries()).map(([clusterId, clusterPos]) => {
            const cluster = clustersById.get(clusterId);
            if (!cluster) return null;

            return (
              <ClusterGroup
                key={clusterId}
                cluster={cluster}
                clusterPosition={clusterPos}
                nodes={nodes}
                edges={edges}
                finalNodePositions={finalNodePositions}
                selectedNode={selectedNode}
                hoveredNode={hoveredNode}
                hoveredClusterId={hoveredCluster}
                searchQuery={searchQuery}
                zoom={zoom}
                onNodeMouseEnter={onNodeHover}
                onNodeMouseLeave={() => onNodeHover(null)}
                onClusterMouseEnter={() => setHoveredCluster(clusterId)}
                onClusterMouseLeave={() => setHoveredCluster(null)}
                onNodeMouseDown={handleNodeMouseDown}
                onNodeClick={handleNodeClick}
                onClusterClick={() => onClusterSelect(clusterId)}
                viewMode={viewMode}
                transitiveDeps={transitiveDeps}
                transitiveDependents={transitiveDependents}
                isSelected={selectedCluster === clusterId}
                previewFilter={previewFilter}
              />
            );
          })}
        </g>
      </svg>

      {/* Overlays */}
      <GraphControls 
        zoom={zoom} 
        nodeCount={nodes.length} 
        edgeCount={edges.length}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        enableAnimation={enableAnimation}
        onToggleAnimation={onToggleAnimation}
      />
      
      {/* Empty state */}
      {nodes.length === 0 && <GraphEmptyState />}
    </div>
  );
}
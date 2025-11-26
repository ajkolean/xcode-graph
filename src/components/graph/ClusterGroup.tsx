/**
 * Renders a single cluster with its card, edges, and nodes
 * Extracted from GraphVisualization for better modularity
 */

import { useMemo, useState } from 'react';
import { GraphNode as GraphNodeType, GraphEdge } from '../../data/mockGraphData';
import { Cluster } from '../../types/cluster';
import { NodePosition, ClusterPosition } from '../../types/simulation';
import { GraphNode } from './GraphNode';
import { GraphEdges } from './GraphEdges';
import { ClusterCard } from './ClusterCard';
import { getNodeSize, getNodeTypeColor, getConnectedNodes } from './graphUtils';
import { ViewMode } from '../../types/app';

interface ClusterGroupProps {
  cluster: Cluster;
  clusterPosition: ClusterPosition;
  nodes: GraphNodeType[];
  edges: GraphEdge[];
  finalNodePositions: Map<string, NodePosition>;
  selectedNode: GraphNodeType | null;
  hoveredNode: string | null;
  hoveredClusterId?: string | null;
  searchQuery: string;
  zoom: number;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onClusterMouseEnter: () => void;
  onClusterMouseLeave: () => void;
  onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onNodeClick: (node: GraphNodeType, e: React.MouseEvent) => void;
  onClusterClick: () => void;
  viewMode?: ViewMode;
  transitiveDeps?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  transitiveDependents?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  isSelected?: boolean;
  previewFilter?: { type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster', value: string } | null;
}

export function ClusterGroup({
  cluster,
  clusterPosition,
  nodes,
  edges,
  finalNodePositions,
  selectedNode,
  hoveredNode,
  hoveredClusterId,
  searchQuery,
  zoom,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onClusterMouseEnter,
  onClusterMouseLeave,
  onNodeMouseDown,
  onNodeClick,
  onClusterClick,
  viewMode = 'full',
  transitiveDeps,
  transitiveDependents,
  isSelected = false,
  previewFilter
}: ClusterGroupProps) {
  const [isClusterHovered, setIsClusterHovered] = useState(false);
  
  const connectedNodes = useMemo(
    () => selectedNode ? getConnectedNodes(selectedNode.id, edges) : new Set(),
    [selectedNode, edges]
  );

  const clusterNodes = cluster.nodes;

  return (
    <g
      onMouseEnter={() => {
        setIsClusterHovered(true);
        onClusterMouseEnter();
      }}
      onMouseLeave={() => {
        setIsClusterHovered(false);
        onClusterMouseLeave();
      }}
    >
      {/* Cluster card background */}
      <ClusterCard
        cluster={cluster}
        x={clusterPosition.x - clusterPosition.width / 2}
        y={clusterPosition.y - clusterPosition.height / 2}
        width={clusterPosition.width}
        height={clusterPosition.height}
        isHighlighted={isClusterHovered}
        isSelected={isSelected}
        zoom={zoom}
        onClick={onClusterClick}
      />

      {/* Internal edges */}
      <g className="internal-edges">
        <GraphEdges
          edges={edges}
          nodes={nodes}
          finalNodePositions={finalNodePositions}
          clusterPositions={new Map([[cluster.id, clusterPosition]])}
          selectedNode={selectedNode}
          hoveredNode={hoveredNode}
          clusterId={cluster.id}
          hoveredClusterId={hoveredClusterId}
          viewMode={viewMode}
          transitiveDeps={transitiveDeps}
          transitiveDependents={transitiveDependents}
          zoom={zoom}
        />
      </g>

      {/* Nodes */}
      <g className="nodes">
        {clusterNodes.map(node => {
          const pos = finalNodePositions.get(node.id);
          if (!pos) return null;

          const isSelectedNode = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedNode && connectedNodes.has(node.id);
          const isSearchMatch = searchQuery &&
            node.name.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Check if node matches the preview filter
          const matchesPreview = !previewFilter || 
            (previewFilter.type === 'nodeType' && node.type === previewFilter.value) ||
            (previewFilter.type === 'platform' && node.platform === previewFilter.value) ||
            (previewFilter.type === 'origin' && node.origin === previewFilter.value) ||
            (previewFilter.type === 'project' && node.project === previewFilter.value) ||
            (previewFilter.type === 'package' && node.type === 'package' && node.name === previewFilter.value);
          
          const isDimmed = (searchQuery && !isSearchMatch) || 
                          (selectedNode && !isSelectedNode && !isConnected) ||
                          (previewFilter && !matchesPreview);

          const size = getNodeSize(node, edges);
          const color = getNodeTypeColor(node.type);
          
          const x = clusterPosition.x + pos.x;
          const y = clusterPosition.y + pos.y;

          return (
            <GraphNode
              key={node.id}
              node={node}
              x={x}
              y={y}
              size={size}
              color={color}
              isSelected={isSelectedNode}
              isHovered={isHovered}
              isDimmed={isDimmed}
              zoom={zoom}
              onMouseEnter={() => onNodeMouseEnter(node.id)}
              onMouseLeave={onNodeMouseLeave}
              onMouseDown={(e) => onNodeMouseDown(node.id, e)}
              onClick={(e) => onNodeClick(node, e)}
            />
          );
        })}
      </g>
    </g>
  );
}
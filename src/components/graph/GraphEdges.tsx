/**
 * Graph edge rendering - handles both cross-cluster and intra-cluster edges
 * Extracted from GraphVisualization for better organization
 * Now supports depth-based opacity for dependency chains
 * Edge colors match the target node's product type for clearer visual flow
 */

import { GraphNode, GraphEdge as GraphEdgeType } from '../../data/mockGraphData';
import { NodePosition, ClusterPosition } from '../../types/simulation';
import { getNodeTypeColor } from './graphUtils';
import { ViewMode } from '../../types/app';
import { GraphEdge } from './GraphEdge';

interface GraphEdgesProps {
  edges: GraphEdgeType[];
  nodes: GraphNode[];
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  selectedNode: GraphNode | null;
  hoveredNode: string | null;
  clusterId?: string; // If provided, only render edges within this cluster
  hoveredClusterId?: string | null; // If provided, dims edges NOT connected to this cluster
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
  zoom?: number;
}

export function GraphEdges({
  edges,
  nodes,
  finalNodePositions,
  clusterPositions,
  selectedNode,
  hoveredNode,
  clusterId,
  hoveredClusterId = null,
  viewMode = 'full',
  transitiveDeps,
  transitiveDependents,
  zoom = 1.0
}: GraphEdgesProps) {
  // Calculate opacity based on depth
  const getEdgeOpacity = (edge: GraphEdgeType): number => {
    const edgeKey = `${edge.source}->${edge.target}`;
    
    // Check if this edge is in the dependency chain
    const inDepsChain = transitiveDeps?.edges.has(edgeKey);
    const inDependentsChain = transitiveDependents?.edges.has(edgeKey);
    
    if (viewMode === 'focused' && inDepsChain && transitiveDeps) {
      const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDeps.maxDepth || 1;
      // Opacity ranges from 1.0 (depth 0) to 0.3 (max depth)
      return 1.0 - (depth / maxDepth) * 0.7;
    }
    
    if (viewMode === 'dependents' && inDependentsChain && transitiveDependents) {
      const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDependents.maxDepth || 1;
      // Opacity ranges from 1.0 (depth 0) to 0.3 (max depth)
      return 1.0 - (depth / maxDepth) * 0.7;
    }
    
    if (viewMode === 'both' && (inDepsChain || inDependentsChain)) {
      // In "both" mode, use the depth from whichever chain this edge belongs to
      if (inDepsChain && transitiveDeps) {
        const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
        const maxDepth = transitiveDeps.maxDepth || 1;
        return 1.0 - (depth / maxDepth) * 0.7;
      }
      if (inDependentsChain && transitiveDependents) {
        const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
        const maxDepth = transitiveDependents.maxDepth || 1;
        return 1.0 - (depth / maxDepth) * 0.7;
      }
    }
    
    // Default opacity for non-chain edges
    return 1.0;
  };

  return (
    <>
      {edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;
        
        const sourceClusterId = sourceNode.project || 'External';
        const targetClusterId = targetNode.project || 'External';
        
        // Filter based on whether we're rendering cross-cluster or intra-cluster
        if (clusterId) {
          // Intra-cluster: only show edges within this cluster
          if (sourceClusterId !== clusterId || targetClusterId !== clusterId) return null;
        } else {
          // Cross-cluster: only show edges between different clusters
          if (sourceClusterId === targetClusterId) return null;
        }
        
        const sourcePos = finalNodePositions.get(edge.source);
        const targetPos = finalNodePositions.get(edge.target);
        const sourceCluster = clusterPositions.get(sourceClusterId);
        const targetCluster = clusterPositions.get(targetClusterId);
        
        if (!sourcePos || !targetPos || !sourceCluster || !targetCluster) return null;
        
        const x1 = sourceCluster.x + sourcePos.x;
        const y1 = sourceCluster.y + sourcePos.y;
        const x2 = targetCluster.x + targetPos.x;
        const y2 = targetCluster.y + targetPos.y;
        
        const isHighlighted = selectedNode &&
          (edge.source === selectedNode.id || edge.target === selectedNode.id);
        const isFocused = hoveredNode === edge.source || hoveredNode === edge.target;
        
        // Check if this edge connects to the hovered cluster
        const isConnectedToHoveredCluster = hoveredClusterId && 
          (sourceClusterId === hoveredClusterId || targetClusterId === hoveredClusterId);
        
        // If a cluster is hovered and this edge is NOT connected to it, dim it way down
        const shouldDim = hoveredClusterId && !isConnectedToHoveredCluster;
        
        const edgeColor = getNodeTypeColor(targetNode.type);
        
        // Use dashed lines for cross-cluster edges (between different projects)
        // Use solid lines for intra-cluster edges (within same project)
        const isCrossCluster = !clusterId; // If no clusterId, we're rendering cross-cluster edges
        
        // Only animate on hover or when node is selected and edge is connected
        const shouldAnimate = isFocused || isHighlighted;
        
        return (
          <GraphEdge
            key={`${edge.source}-${edge.target}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            color={edgeColor}
            isHighlighted={isHighlighted || isFocused}
            isDependent={isCrossCluster}
            opacity={shouldDim ? getEdgeOpacity(edge) * 0.08 : getEdgeOpacity(edge)}
            zoom={zoom}
            animated={shouldAnimate}
          />
        );
      })}
    </>
  );
}
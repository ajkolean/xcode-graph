/**
 * Cluster Details Panel - main orchestrator
 * Refactored to use modular sub-components
 * All styling uses design system CSS variables
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { useClusterStats } from '../hooks/useClusterStats';
import type { Cluster } from '../types/cluster';
import { generateColor } from '../utils/colorGenerator';
import { adjustColorForZoom } from '../utils/zoomColorUtils';
import { ClusterHeader } from './clusterDetails/ClusterHeader';
import { ClusterStats } from './clusterDetails/ClusterStats';
import { ClusterTargetsList } from './clusterDetails/ClusterTargetsList';
import { ClusterTypeBadge } from './clusterDetails/ClusterTypeBadge';

interface ClusterDetailsPanelProps {
  cluster: Cluster;
  clusterNodes: GraphNode[];
  allNodes: GraphNode[];
  edges: GraphEdge[];
  filteredEdges?: GraphEdge[];
  onClose: () => void;
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover: (nodeId: string | null) => void;
  zoom: number;
}

export function ClusterDetailsPanel({
  cluster,
  clusterNodes,
  allNodes: _allNodes,
  edges,
  filteredEdges,
  onClose,
  onNodeSelect,
  onNodeHover,
  zoom,
}: ClusterDetailsPanelProps) {
  const baseClusterColor = generateColor(cluster.name, cluster.type);
  const clusterColor = adjustColorForZoom(baseClusterColor, zoom);
  const isExternal = cluster.origin === 'external';

  // Calculate stats using custom hook
  const {
    filteredDependencies,
    totalDependencies,
    filteredDependents,
    totalDependents,
    filteredTargetsCount,
    platforms,
  } = useClusterStats(clusterNodes, edges, filteredEdges);

  // Group nodes by type
  const nodesByType = clusterNodes.reduce(
    (acc, node) => {
      const type = node.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(node);
      return acc;
    },
    {} as Record<string, GraphNode[]>,
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <ClusterHeader
        clusterName={cluster.name}
        clusterType={cluster.type}
        clusterColor={clusterColor}
        isExternal={isExternal}
        onBack={onClose}
      />

      {/* Cluster Type Badge */}
      <ClusterTypeBadge clusterType={cluster.type} clusterColor={clusterColor} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Grid */}
        <ClusterStats
          filteredDependencies={filteredDependencies}
          totalDependencies={totalDependencies}
          filteredDependents={filteredDependents}
          totalDependents={totalDependents}
          platforms={platforms}
        />

        {/* Targets by Type */}
        <ClusterTargetsList
          nodesByType={nodesByType}
          filteredTargetsCount={filteredTargetsCount}
          totalTargetsCount={clusterNodes.length}
          edges={edges}
          onNodeSelect={onNodeSelect}
          onNodeHover={onNodeHover}
          zoom={zoom}
        />
      </div>
    </div>
  );
}

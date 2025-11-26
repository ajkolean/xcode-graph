import { GraphNode, GraphEdge } from '../data/mockGraphData';
import { Cluster } from '../types/cluster';
import { NodeHeader } from './nodeDetails/NodeHeader';
import { NodeActions } from './nodeDetails/NodeActions';
import { MetricsSection } from './nodeDetails/MetricsSection';
import { DependenciesList } from './nodeDetails/DependenciesList';
import { DependentsList } from './nodeDetails/DependentsList';
import { NodeInfo } from './nodeDetails/NodeInfo';
import { useNodeDependencies } from '../hooks/useNodeDependencies';

interface NodeDetailsPanelProps {
  node: GraphNode;
  allNodes: GraphNode[];
  edges: GraphEdge[];
  filteredEdges?: GraphEdge[];
  clusters?: Cluster[];
  onClose: () => void;
  onNodeSelect: (node: GraphNode) => void;
  onClusterSelect?: (clusterId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  onFocusNode: (node: GraphNode) => void;
  onShowDependents: (node: GraphNode) => void;
  onShowImpact: (node: GraphNode) => void;
  viewMode?: string;
  zoom: number;
}

export function NodeDetailsPanel({
  node,
  allNodes,
  edges,
  filteredEdges,
  clusters,
  onClose,
  onNodeSelect,
  onClusterSelect,
  onNodeHover,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  viewMode,
  zoom
}: NodeDetailsPanelProps) {
  const { dependencies, dependents, metrics } = useNodeDependencies(node, allNodes, edges, filteredEdges);

  return (
    <>
      {/* Node Card Header */}
      <NodeHeader 
        node={node} 
        onClose={onClose}
        onClusterClick={onClusterSelect}
        clusters={clusters}
        zoom={zoom}
      />
      
      <MetricsSection
        dependenciesCount={metrics.dependencyCount}
        dependentsCount={metrics.dependentCount}
        totalDependenciesCount={metrics.totalDependencyCount}
        totalDependentsCount={metrics.totalDependentCount}
        isHighFanIn={metrics.isHighFanIn}
        isHighFanOut={metrics.isHighFanOut}
      />

      <NodeActions
        node={node}
        viewMode={viewMode}
        onFocusNode={onFocusNode}
        onShowDependents={onShowDependents}
        onShowImpact={onShowImpact}
      />

      <DependenciesList
        dependencies={dependencies}
        onNodeSelect={onNodeSelect}
        onNodeHover={onNodeHover}
      />
      
      <DependentsList
        dependents={dependents}
        onNodeSelect={onNodeSelect}
        onNodeHover={onNodeHover}
      />
      
      {/* Node Info at bottom */}
      <NodeInfo node={node} />
    </>
  );
}
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { useNodeDependencies } from '../hooks/useNodeDependencies';
import { NodeHeader } from '../components-lit/wrappers/NodeHeader';
import { NodeInfo } from '../components-lit/wrappers/NodeInfo';
import { NodeActions } from '../components-lit/wrappers/NodeActions';
import { DependenciesList } from '../components-lit/wrappers/DependenciesList';
import { DependentsList } from '../components-lit/wrappers/DependentsList';
import { MetricsSection } from '../components-lit/wrappers/MetricsSection';

interface NodeDetailsPanelProps {
  node: GraphNode;
  allNodes: GraphNode[];
  edges: GraphEdge[];
  filteredEdges?: GraphEdge[];
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
  onClose,
  onNodeSelect,
  onClusterSelect,
  onNodeHover,
  onFocusNode,
  onShowDependents,
  onShowImpact,
  viewMode,
  zoom,
}: NodeDetailsPanelProps) {
  const { dependencies, dependents, metrics } = useNodeDependencies(
    node,
    allNodes,
    edges,
    filteredEdges,
  );

  return (
    <>
      {/* Node Card Header */}
      <NodeHeader
        node={node}
        zoom={zoom}
        onClose={onClose}
        onClusterClick={(e) => onClusterSelect?.(e.detail.clusterId)}
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
        onFocusNode={(e) => onFocusNode(e.detail.node)}
        onShowDependents={(e) => onShowDependents(e.detail.node)}
        onShowImpact={(e) => onShowImpact(e.detail.node)}
      />

      <DependenciesList
        dependencies={dependencies}
        onNodeSelect={(e) => onNodeSelect(e.detail.node)}
        onNodeHover={(e) => onNodeHover(e.detail.nodeId)}
      />

      <DependentsList
        dependents={dependents}
        onNodeSelect={(e) => onNodeSelect(e.detail.node)}
        onNodeHover={(e) => onNodeHover(e.detail.nodeId)}
      />

      {/* Node Info at bottom */}
      <NodeInfo node={node} />
    </>
  );
}

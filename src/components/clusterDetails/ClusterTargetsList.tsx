/**
 * Cluster targets list - grouped by node type
 * All styling uses design system CSS variables
 */

import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { getNodeTypeLabel } from '../../utils/nodeIcons';
import { ListItemRow } from '../shared/ListItemRow';

interface ClusterTargetsListProps {
  nodesByType: Record<string, GraphNode[]>;
  filteredTargetsCount: number;
  totalTargetsCount: number;
  edges: GraphEdge[];
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover: (nodeId: string | null) => void;
  zoom: number;
}

export function ClusterTargetsList({
  nodesByType,
  filteredTargetsCount,
  totalTargetsCount,
  edges,
  onNodeSelect,
  onNodeHover,
  zoom
}: ClusterTargetsListProps) {
  // Helper function to calculate dependencies and dependents for a node
  const getNodeStats = (nodeId: string) => {
    const dependencies = edges.filter(e => e.target === nodeId).length;
    const dependents = edges.filter(e => e.source === nodeId).length;
    return { dependencies, dependents };
  };

  return (
    <div className="px-4 py-4">
      <h3
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-foreground)',
          marginBottom: 'var(--spacing-md)'
        }}
      >
        Targets ({filteredTargetsCount}/{totalTargetsCount})
      </h3>

      <div className="space-y-3">
        {Object.entries(nodesByType).map(([type, nodes]) => (
          <div key={type}>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'var(--text-small)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-muted-foreground)',
                marginBottom: 'var(--spacing-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {getNodeTypeLabel(type)} ({nodes.length})
            </div>

            <div className="space-y-1">
              {nodes.map(node => {
                const stats = getNodeStats(node.id);
                const parts = [];
                
                if (stats.dependencies > 0) {
                  parts.push(`${stats.dependencies} dep${stats.dependencies !== 1 ? 's' : ''}`);
                }
                if (stats.dependents > 0) {
                  parts.push(`${stats.dependents} dependent${stats.dependents !== 1 ? 's' : ''}`);
                }
                
                const subtitle = parts.length > 0 ? parts.join(' · ') : undefined;

                return (
                  <ListItemRow
                    key={node.id}
                    node={node}
                    subtitle={subtitle}
                    onSelect={onNodeSelect}
                    onHover={onNodeHover}
                    zoom={zoom}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

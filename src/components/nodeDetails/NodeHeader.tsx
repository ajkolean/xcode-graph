/**
 * Node details panel header component
 */

import { ChevronLeft } from 'lucide-react';
import type { GraphNode } from '../../data/mockGraphData';
import type { Cluster } from '../../types/cluster';
import { generateColor } from '../../utils/colorGenerator';
import { getNodeTypeColor } from '../../utils/filterHelpers';
import { getNodeIconPath, getNodeTypeLabel } from '../../utils/nodeIcons';
import { adjustColorForZoom } from '../../utils/zoomColorUtils';

interface NodeHeaderProps {
  node: GraphNode;
  onClose: () => void;
  onClusterClick?: (clusterId: string) => void;
  clusters?: Cluster[];
  zoom: number;
}

export function NodeHeader({ node, onClose, onClusterClick, clusters: _clusters, zoom }: NodeHeaderProps) {
  // Get icon path based on node type
  const iconPath = getNodeIconPath(node.type, node.type === 'app' ? node.platform : undefined);

  // Node type color for icon and type label
  const nodeTypeColor = getNodeTypeColor(node.type);
  const nodeDisplayColor = adjustColorForZoom(nodeTypeColor, zoom);

  // Cluster/project color for PROJECT badge
  let clusterColor: string;
  if (node.type === 'package') {
    clusterColor = generateColor(node.name, 'package');
  } else if (node.project) {
    clusterColor = generateColor(node.project, 'project');
  } else {
    clusterColor = nodeTypeColor; // Fallback to node type color
  }
  const clusterDisplayColor = adjustColorForZoom(clusterColor, zoom);

  // Handle back navigation - go to parent cluster
  const handleBack = () => {
    if (onClusterClick) {
      const clusterId = node.type === 'package' ? node.name : node.project;
      if (clusterId) {
        onClusterClick(clusterId);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-start gap-3 mb-3">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="size-6 rounded flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors mt-3"
          style={{
            color: 'var(--color-muted-foreground)',
          }}
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon - uses node type color */}
          <div
            className="size-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${nodeDisplayColor}15`,
              boxShadow: `0 0 20px ${nodeDisplayColor}30, 0 0 40px ${nodeDisplayColor}15`,
            }}
          >
            <svg width="24" height="24" viewBox="-18 -18 36 36">
              <path
                d={iconPath}
                fill="rgba(15, 15, 20, 0.95)"
                stroke={nodeDisplayColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Node Name and Cluster - vertical stack */}
          <div className="flex-1 min-w-0">
            <h2
              className="truncate"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-foreground)',
              }}
            >
              {node.name}
            </h2>

            {/* Cluster/Project name subtitle */}
            {(node.project || node.type === 'package') && (
              <div
                className="truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                {node.type === 'package' ? node.name : node.project}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pill tags row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Project/Package pill - uses cluster color */}
        {(node.project || node.type === 'package') && (
          <div
            className="inline-flex items-center px-2.5 py-1 rounded-full cursor-default transition-all"
            style={{
              backgroundColor: `${clusterDisplayColor}20`,
              border: `1px solid ${clusterDisplayColor}40`,
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              lineHeight: '14px',
              fontWeight: 'var(--font-weight-medium)',
              color: clusterDisplayColor,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${clusterDisplayColor}30`;
              e.currentTarget.style.borderColor = `${clusterDisplayColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${clusterDisplayColor}20`;
              e.currentTarget.style.borderColor = `${clusterDisplayColor}40`;
            }}
          >
            {node.type === 'package' ? 'Package' : 'Project'}
          </div>
        )}

        {/* Node type pill - uses node type color */}
        <div
          className="inline-flex items-center px-2.5 py-1 rounded-full cursor-default transition-all"
          style={{
            backgroundColor: `${nodeDisplayColor}20`,
            border: `1px solid ${nodeDisplayColor}40`,
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            lineHeight: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: nodeDisplayColor,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${nodeDisplayColor}30`;
            e.currentTarget.style.borderColor = `${nodeDisplayColor}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${nodeDisplayColor}20`;
            e.currentTarget.style.borderColor = `${nodeDisplayColor}40`;
          }}
        >
          {getNodeTypeLabel(node.type)}
        </div>
      </div>
    </div>
  );
}

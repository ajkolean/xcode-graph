/**
 * Shared ListItemRow component
 * Used for displaying nodes in cluster targets, dependencies, and dependents lists
 * Navigation-style rows with proper state gradient: Normal → Hover → Selected
 */

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { GraphNode } from '../../data/mockGraphData';
import { getNodeTypeColor } from '../../utils/graph/nodeColors';
import { getNodeIconPath } from '../../utils/nodeIcons';
import { adjustColorForZoom } from '../../utils/zoomColorUtils';

interface ListItemRowProps {
  node: GraphNode;
  subtitle?: string; // e.g., "Framework", "2 deps · 3 dependents"
  onSelect: (node: GraphNode) => void;
  onHover: (nodeId: string | null) => void;
  zoom?: number;
  isSelected?: boolean; // For selected/active state
}

export function ListItemRow({
  node,
  subtitle,
  onSelect,
  onHover,
  zoom = 1,
  isSelected = false,
}: ListItemRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Use node type color (same as used throughout the app)
  const nodeColor = adjustColorForZoom(getNodeTypeColor(node.type), zoom);

  return (
    <button
      onClick={() => onSelect(node)}
      onMouseEnter={() => {
        onHover(node.id);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        onHover(null);
        setIsHovered(false);
      }}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left group"
      style={{
        borderRadius: 'var(--radius)',
        backgroundColor: isSelected
          ? 'rgba(255, 255, 255, 0.08)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.03)',
        transition: 'background-color 0.15s ease-out',
      }}
    >
      {/* Node Icon - colored shape with stronger glow */}
      <div className="shrink-0 flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="-18 -18 36 36"
          style={{
            filter: `drop-shadow(0 0 6px ${nodeColor}80)`,
          }}
        >
          <path
            d={getNodeIconPath(node.type, node.platform)}
            fill="rgba(15, 15, 20, 0.95)"
            stroke={nodeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.95 }}
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-label)',
            color: 'var(--color-foreground)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {node.name}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: 'var(--color-muted-foreground)',
              marginTop: '1px',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <ChevronRight
        className="size-4 shrink-0 transition-opacity"
        style={{
          color: 'var(--color-muted-foreground)',
          marginLeft: '-4px',
          opacity: isHovered ? 0.7 : 0.4,
        }}
      />
    </button>
  );
}

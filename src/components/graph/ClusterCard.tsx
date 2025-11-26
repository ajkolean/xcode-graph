import type { Cluster } from '../../types/cluster';
import { generateColor } from '../../utils/colorGenerator';
import { adjustColorForZoom, adjustOpacityForZoom } from '../../utils/zoomColorUtils';

interface ClusterCardProps {
  cluster: Cluster;
  x: number;
  y: number;
  width: number;
  height: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isSelected?: boolean;
  zoom?: number;
  onClick?: () => void;
}

export function ClusterCard({
  cluster,
  x,
  y,
  width,
  height,
  isHighlighted = false,
  isDimmed = false,
  isSelected = false,
  zoom = 1.0,
  onClick,
}: ClusterCardProps) {
  // Generate color based on cluster type and name to match sidebar filters
  const clusterColor = generateColor(cluster.name, cluster.type);

  // Adjust colors based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(clusterColor, zoom);
  const borderOpacity = adjustOpacityForZoom(0.5, zoom);

  // Pre-compute common conditional values to reduce complexity
  const isActive = isHighlighted || isSelected;
  const cursorStyle = onClick ? 'pointer' : 'default';
  const strokeDasharray = cluster.type === 'project' ? '8 8' : '3 8';
  const fillAlpha = isActive ? '08' : '18';
  const textOpacity = isActive ? 1.0 : 0.6;
  const fontWeight = isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)';
  const textShadow = isActive
    ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
    : 'none';

  const labelStyle = {
    fontWeight,
    pointerEvents: 'none' as const,
    opacity: textOpacity,
    textShadow,
    transition:
      'opacity 0.2s ease-in-out, font-weight 0.2s ease-in-out, text-shadow 0.2s ease-in-out',
  };

  return (
    <g opacity={isDimmed ? 0.3 : 1}>
      {/* Background fill */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={`${zoomAdjustedColor}${fillAlpha}`}
        stroke="none"
        onClick={onClick}
        style={{ transition: 'fill 0.2s ease-in-out', cursor: cursorStyle }}
      />

      {/* Border with type-specific pattern */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="none"
        stroke={zoomAdjustedColor}
        strokeWidth={3.5}
        strokeOpacity={isActive ? 0.9 : borderOpacity}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        onClick={onClick}
        style={{
          transition: 'stroke-opacity 0.2s ease-in-out',
          cursor: cursorStyle,
          animation: isSelected ? 'marchingAnts 0.8s linear infinite' : undefined,
        }}
      />

      {/* Cluster label */}
      <text
        x={x + 12}
        y={y + 20}
        fill={zoomAdjustedColor}
        style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', ...labelStyle }}
      >
        {cluster.name}
      </text>

      {/* Node count badge */}
      <text
        x={x + width - 12}
        y={y + 20}
        textAnchor="end"
        fill={zoomAdjustedColor}
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', ...labelStyle }}
      >
        {cluster.nodes.length} targets
      </text>
    </g>
  );
}

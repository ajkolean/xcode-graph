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
  const _isExternal = cluster.origin === 'external';

  // Generate color based on cluster type and name to match sidebar filters
  const clusterColor = generateColor(cluster.name, cluster.type);

  // Adjust colors based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(clusterColor, zoom);
  const borderOpacity = adjustOpacityForZoom(0.5, zoom); // Moderate opacity for clean borders

  // Use zoom-adjusted colors
  const borderColor = zoomAdjustedColor;
  const labelColor = zoomAdjustedColor;

  // Different stroke patterns for project vs package clusters
  // Longer dashes with bigger gaps for cleaner look - matching reference design
  // Project clusters: dashed line (8px dash, 8px gap)
  // Package clusters: dotted line (3px dot, 8px gap)
  const strokeDasharray = cluster.type === 'project' ? '8 8' : '3 8';

  return (
    <g opacity={isDimmed ? 0.3 : 1}>
      {/* Background fill - visible by default, becomes MORE transparent on hover/selected */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={`${zoomAdjustedColor}${isHighlighted || isSelected ? '08' : '18'}`}
        stroke="none"
        onClick={onClick}
        style={{
          transition: 'fill 0.2s ease-in-out',
          cursor: onClick ? 'pointer' : 'default',
        }}
      />

      {/* Border with type-specific pattern, pulse on hover, marching ants on selected */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="none"
        stroke={borderColor}
        strokeWidth={3.5}
        strokeOpacity={isHighlighted || isSelected ? 0.9 : borderOpacity}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        onClick={onClick}
        style={{
          transition: 'stroke-opacity 0.2s ease-in-out',
          cursor: onClick ? 'pointer' : 'default',
          animation: isSelected ? 'marchingAnts 0.8s linear infinite' : undefined,
        }}
      />

      {/* Cluster label at top */}
      <text
        x={x + 12}
        y={y + 20}
        fill={labelColor}
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight:
            isHighlighted || isSelected
              ? 'var(--font-weight-semibold)'
              : 'var(--font-weight-medium)',
          pointerEvents: 'none',
          opacity: isHighlighted || isSelected ? 1.0 : 0.6,
          textShadow:
            isHighlighted || isSelected
              ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
              : 'none',
          transition:
            'opacity 0.2s ease-in-out, font-weight 0.2s ease-in-out, text-shadow 0.2s ease-in-out',
        }}
      >
        {cluster.name}
      </text>

      {/* Node count badge */}
      <text
        x={x + width - 12}
        y={y + 20}
        textAnchor="end"
        fill={labelColor}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight:
            isHighlighted || isSelected
              ? 'var(--font-weight-semibold)'
              : 'var(--font-weight-medium)',
          pointerEvents: 'none',
          opacity: isHighlighted || isSelected ? 1.0 : 0.6,
          textShadow:
            isHighlighted || isSelected
              ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
              : 'none',
          transition:
            'opacity 0.2s ease-in-out, font-weight 0.2s ease-in-out, text-shadow 0.2s ease-in-out',
        }}
      >
        {cluster.nodes.length} targets
      </text>
    </g>
  );
}

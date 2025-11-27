import type { ReactNode } from 'react';

interface GraphClusterProps {
  clusterId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  nodeCount: number;
  origin: 'local' | 'external';
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: ReactNode;
}

export function GraphCluster({
  clusterId,
  x,
  y,
  width,
  height,
  color,
  nodeCount,
  origin,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  children,
}: GraphClusterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMouseEnter();
    }
  };

  return (
    <g
      role="group"
      aria-label={`${clusterId} cluster, ${nodeCount} targets, ${origin === 'external' ? 'external' : 'local'}`}
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Hover glow with smooth transition */}
      {isHovered && (
        <rect
          x={x - width / 2 - 3}
          y={y - height / 2 - 3}
          width={width + 6}
          height={height + 6}
          fill="none"
          stroke={color}
          strokeWidth={3}
          rx={14}
          opacity={0.6}
          filter="url(#glow-strong)"
          style={{ transition: 'opacity 0.3s ease, stroke-width 0.3s ease' }}
        />
      )}

      {/* Cluster background with subtle gradient */}
      <defs>
        <radialGradient id={`cluster-bg-${clusterId}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0.03} />
        </radialGradient>
        <linearGradient id={`cluster-inner-shadow-${clusterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0, 0, 0, 0.2)" />
          <stop offset="50%" stopColor="rgba(0, 0, 0, 0)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.1)" />
        </linearGradient>
      </defs>

      {/* Background with gradient */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill={`url(#cluster-bg-${clusterId})`}
        stroke="none"
        rx={12}
        opacity={isHovered ? 0.9 : 0.7}
        style={{ transition: 'opacity 0.3s ease' }}
      />

      {/* Inner shadow for depth */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill={`url(#cluster-inner-shadow-${clusterId})`}
        stroke="none"
        rx={12}
        opacity={0.3}
        pointerEvents="none"
      />

      {/* Cluster border - softer and more subtle */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? 2.5 : 2}
        strokeDasharray="6,6"
        rx={12}
        opacity={isHovered ? 0.85 : 0.5}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Cluster label */}
      <text
        x={x}
        y={y - height / 2 - 8}
        fill={color}
        textAnchor="middle"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          filter: isHovered ? 'url(#glow)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        {clusterId}
      </text>
      <text
        x={x}
        y={y - height / 2 + 7}
        fill={color}
        textAnchor="middle"
        opacity={isHovered ? 0.8 : 0.5}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          transition: 'opacity 0.3s ease',
        }}
      >
        {origin === 'external' ? 'EXTERNAL' : 'LOCAL'} · {nodeCount} targets
      </text>

      {/* Content (edges and nodes) */}
      {children}
    </g>
  );
}

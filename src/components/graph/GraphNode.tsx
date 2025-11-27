import type { GraphNode as GraphNodeType } from '../../data/mockGraphData';
import { getNodeIconPath } from '../../utils/nodeIcons';
import { adjustColorForZoom, adjustOpacityForZoom } from '../../utils/zoomColorUtils';

interface GraphNodeProps {
  node: GraphNodeType;
  x: number;
  y: number;
  size: number;
  color: string;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  zoom: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function GraphNode({
  node,
  x,
  y,
  size,
  color,
  isSelected,
  isHovered,
  isDimmed,
  zoom,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onClick,
}: GraphNodeProps) {
  const iconPath = getNodeIconPath(node.type, node.platform);
  const _r = size;

  // Adjust color based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);
  const glowOpacity = adjustOpacityForZoom(0.3, zoom);

  // Scale effect on hover or selected - keep larger size when selected
  const scale = isHovered || isSelected ? 1.05 : 1;

  // Truncate label if too long
  const maxLabelLength = 20;
  const displayName =
    node.name.length > maxLabelLength ? `${node.name.substring(0, maxLabelLength)}...` : node.name;

  // Show full name on hover
  const showTooltip = isHovered && node.name.length > maxLabelLength;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'opacity 0.3s ease, transform 0.2s ease',
      }}
      opacity={isDimmed ? 0.3 : 1}
      transform={`scale(${scale})`}
      transformOrigin={`${x}px ${y}px`}
    >
      {/* Sonar pulse rings for selected node */}
      {isSelected && (
        <>
          {/* First pulse ring */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill="none"
            stroke={zoomAdjustedColor}
            strokeWidth={2}
            opacity={0}
          >
            <animate
              attributeName="r"
              from={size}
              to={size * 4}
              dur="3.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.3;0"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Second pulse ring (delayed) */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill="none"
            stroke={zoomAdjustedColor}
            strokeWidth={2}
            opacity={0}
          >
            <animate
              attributeName="r"
              from={size}
              to={size * 4}
              dur="3.5s"
              begin="0.875s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.3;0"
              dur="3.5s"
              begin="0.875s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Third pulse ring (more delayed) */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill="none"
            stroke={zoomAdjustedColor}
            strokeWidth={2}
            opacity={0}
          >
            <animate
              attributeName="r"
              from={size}
              to={size * 4}
              dur="3.5s"
              begin="1.75s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.3;0"
              dur="3.5s"
              begin="1.75s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Fourth pulse ring (most delayed) */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill="none"
            stroke={zoomAdjustedColor}
            strokeWidth={2}
            opacity={0}
          >
            <animate
              attributeName="r"
              from={size}
              to={size * 4}
              dur="3.5s"
              begin="2.625s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.3;0"
              dur="3.5s"
              begin="2.625s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* Outer glow ring */}
      {(isSelected || isHovered) && (
        <circle
          cx={x}
          cy={y}
          r={size + 8}
          fill="none"
          stroke={zoomAdjustedColor}
          strokeWidth={2}
          opacity={glowOpacity}
          filter="url(#glow-strong)"
        />
      )}

      {/* Icon shape (no background) */}
      <g
        transform={`translate(${x}, ${y})`}
        filter={isSelected || isHovered ? 'url(#glow)' : undefined}
      >
        <path
          d={iconPath}
          fill="rgba(15, 15, 20, 0.95)"
          stroke={zoomAdjustedColor}
          strokeWidth={isSelected ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'all' }}
        />
      </g>

      {/* Label with background pill for readability */}
      {zoom >= 0.5 && (
        <g>
          {/* Label text with glow for readability */}
          <text
            x={x}
            y={y + size + 22}
            fill={zoomAdjustedColor}
            textAnchor="middle"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              pointerEvents: 'none',
              filter: `drop-shadow(0 0 8px rgba(15, 15, 20, 0.9)) drop-shadow(0 0 4px rgba(15, 15, 20, 1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))`,
            }}
          >
            {displayName}
          </text>

          {/* Tooltip for truncated names */}
          {showTooltip && (
            <>
              <rect
                x={x - node.name.length * 3.5}
                y={y - size - 35}
                width={node.name.length * 7}
                height={22}
                rx={4}
                fill="rgba(15, 15, 20, 0.95)"
                stroke={zoomAdjustedColor}
                strokeWidth={1}
                filter="url(#glow)"
              />
              <text
                x={x}
                y={y - size - 20}
                fill={zoomAdjustedColor}
                textAnchor="middle"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-normal)',
                  pointerEvents: 'none',
                }}
              >
                {node.name}
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}

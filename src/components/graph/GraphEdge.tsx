import { adjustColorForZoom, adjustOpacityForZoom } from '../../utils/zoomColorUtils';

interface GraphEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  isHighlighted: boolean;
  isDependent?: boolean; // true = dashed line (cross-cluster)
  opacity?: number;
  zoom?: number;
  animated?: boolean; // true = show flow animation
}

export function GraphEdge({
  x1,
  y1,
  x2,
  y2,
  color,
  isHighlighted,
  isDependent = false,
  opacity = 1.0,
  zoom = 1.0,
  animated = false,
}: GraphEdgeProps) {
  // Calculate distance to determine if we should use bezier curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const useBezier = distance > 150; // Use bezier for long edges

  // Adjust color based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);

  // Base opacity: highlighted (0.8), normal (0.3)
  const baseOpacity = isHighlighted ? 0.8 : 0.3;
  const zoomOpacity = adjustOpacityForZoom(baseOpacity, zoom);
  const finalOpacity = zoomOpacity * opacity;

  // Cross-cluster = long dashes "8,4", Intra-cluster = short dashes "4,2"
  const dashPattern = isDependent ? '8,4' : '4,2';

  // Generate path (bezier curve or straight line)
  const path = useBezier ? generateBezierPath(x1, y1, x2, y2) : `M ${x1},${y1} L ${x2},${y2}`;

  return (
    <g className="graph-edge" style={{ transition: 'opacity 0.3s ease' }}>
      {/* Glow layer for highlighted edges */}
      {isHighlighted && (
        <path
          d={path}
          stroke={zoomAdjustedColor}
          strokeWidth={3}
          fill="none"
          opacity={adjustOpacityForZoom(0.3, zoom) * opacity}
          filter="url(#glow-strong)"
          strokeDasharray={dashPattern}
          className={animated ? 'flow-animation' : undefined}
          shapeRendering="geometricPrecision"
        />
      )}
      {/* Main edge */}
      <path
        d={path}
        stroke={zoomAdjustedColor}
        strokeWidth={isHighlighted ? 2 : 1}
        fill="none"
        opacity={finalOpacity}
        strokeDasharray={dashPattern}
        className={animated ? 'flow-animation' : undefined}
        shapeRendering="geometricPrecision"
        style={{
          transition: 'opacity 0.3s ease, stroke-width 0.2s ease',
        }}
      />
    </g>
  );
}

/**
 * Generate a smooth bezier curve path for long edges
 */
function generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Control point offset (creates gentle curve)
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;

  // Control points for smooth S-curve
  const cx1 = x1 + offset;
  const cy1 = y1;
  const cx2 = x2 - offset;
  const cy2 = y2;

  return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
}

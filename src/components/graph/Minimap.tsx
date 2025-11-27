/**
 * DEAD CODE - MARKED FOR DELETION
 *
 * Minimap component - not used anywhere in the codebase.
 * Analysis date: 2025-11-26
 *
 * Can be safely deleted after verification that:
 * 1. `pnpm dev` works correctly
 * 2. `pnpm build` passes
 * 3. No hidden dependencies exist
 *
 * If you need this component, remove this comment and update the analysis.
 */

import type { GraphNode } from '../../data/mockGraphData';
import type { ClusterPosition, NodePosition } from '../../types/simulation';

interface MinimapProps {
  nodes: GraphNode[];
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  onViewportClick: (x: number, y: number) => void;
}

const MINIMAP_SIZE = 200;
const _MINIMAP_PADDING = 20;

export function Minimap({
  nodes,
  nodePositions,
  clusterPositions,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  zoom,
  onViewportClick,
}: MinimapProps) {
  // Calculate bounds of entire graph
  const bounds = calculateGraphBounds(nodePositions, clusterPositions);

  if (!bounds) return null;

  // Calculate scale to fit graph in minimap
  const scaleX = MINIMAP_SIZE / bounds.width;
  const scaleY = MINIMAP_SIZE / bounds.height;
  const scale = Math.min(scaleX, scaleY, 1) * 0.85; // 85% to add padding

  // Transform coordinates
  const transform = (x: number, y: number) => ({
    x: (x - bounds.minX) * scale + MINIMAP_SIZE / 2 - (bounds.width * scale) / 2,
    y: (y - bounds.minY) * scale + MINIMAP_SIZE / 2 - (bounds.height * scale) / 2,
  });

  // Viewport rectangle in minimap coordinates
  const viewportRect = {
    x: (viewportX - bounds.minX) * scale + MINIMAP_SIZE / 2 - (bounds.width * scale) / 2,
    y: (viewportY - bounds.minY) * scale + MINIMAP_SIZE / 2 - (bounds.height * scale) / 2,
    width: (viewportWidth * scale) / zoom,
    height: (viewportHeight * scale) / zoom,
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Transform click back to graph coordinates
    const graphX = (clickX - MINIMAP_SIZE / 2 + (bounds.width * scale) / 2) / scale + bounds.minX;
    const graphY = (clickY - MINIMAP_SIZE / 2 + (bounds.height * scale) / 2) / scale + bounds.minY;

    onViewportClick(graphX, graphY);
  };

  return (
    <div
      className="absolute bottom-6 right-6 rounded-lg overflow-hidden shadow-2xl border"
      style={{
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        borderColor: 'var(--color-border-primary)',
        zIndex: 50,
      }}
    >
      <svg
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Clusters */}
        {Array.from(clusterPositions.entries()).map(([clusterId, pos]) => {
          const t = transform(pos.x, pos.y);
          return (
            <rect
              key={`cluster-${clusterId}`}
              x={t.x - (pos.width * scale) / 2}
              y={t.y - (pos.height * scale) / 2}
              width={pos.width * scale}
              height={pos.height * scale}
              fill="rgba(139, 92, 246, 0.15)"
              stroke="rgba(139, 92, 246, 0.5)"
              strokeWidth={1}
              rx={2}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const t = transform(pos.x, pos.y);
          return <circle key={node.id} cx={t.x} cy={t.y} r={2} fill="rgba(139, 92, 246, 0.7)" />;
        })}

        {/* Viewport indicator */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fill="none"
          stroke="rgba(167, 139, 250, 0.9)"
          strokeWidth={2}
          rx={2}
          pointerEvents="none"
        />

        {/* Crosshair at viewport center */}
        <g pointerEvents="none">
          <line
            x1={viewportRect.x + viewportRect.width / 2 - 4}
            y1={viewportRect.y + viewportRect.height / 2}
            x2={viewportRect.x + viewportRect.width / 2 + 4}
            y2={viewportRect.y + viewportRect.height / 2}
            stroke="rgba(167, 139, 250, 0.9)"
            strokeWidth={1}
          />
          <line
            x1={viewportRect.x + viewportRect.width / 2}
            y1={viewportRect.y + viewportRect.height / 2 - 4}
            x2={viewportRect.x + viewportRect.width / 2}
            y2={viewportRect.y + viewportRect.height / 2 + 4}
            stroke="rgba(167, 139, 250, 0.9)"
            strokeWidth={1}
          />
        </g>
      </svg>

      {/* Zoom level indicator */}
      <div
        className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: 'rgba(15, 15, 20, 0.9)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-xs)',
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

function calculateGraphBounds(
  nodePositions: Map<string, NodePosition>,
  clusterPositions: Map<string, ClusterPosition>,
) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // Include cluster bounds
  clusterPositions.forEach((pos) => {
    const halfWidth = pos.width / 2;
    const halfHeight = pos.height / 2;
    minX = Math.min(minX, pos.x - halfWidth);
    maxX = Math.max(maxX, pos.x + halfWidth);
    minY = Math.min(minY, pos.y - halfHeight);
    maxY = Math.max(maxY, pos.y + halfHeight);
  });

  // Include node positions
  nodePositions.forEach((pos) => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });

  if (!Number.isFinite(minX)) return null;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

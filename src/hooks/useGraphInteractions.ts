/**
 * Custom hook for graph pan, zoom, and drag interactions
 */

import { useRef, useState } from 'react';
import type { NodePosition } from '../types/simulation';

interface UseGraphInteractionsProps {
  zoom: number;
  nodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, { x: number; y: number }>;
  setNodePositions: (fn: (prev: Map<string, NodePosition>) => Map<string, NodePosition>) => void;
}

export function useGraphInteractions({
  zoom,
  nodePositions,
  clusterPositions,
  setNodePositions,
}: UseGraphInteractionsProps) {
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggedNode) {
      // Pan the canvas
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggedNode) {
      // Drag a node
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const node = nodePositions.get(draggedNode);
      if (!node) return;

      const cluster = clusterPositions.get(node.clusterId);
      if (!cluster) return;

      const x = (e.clientX - rect.left - pan.x) / zoom - cluster.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - cluster.y;

      setNodePositions((prev) => {
        const next = new Map(prev);
        const nodePos = next.get(draggedNode);
        if (nodePos) {
          nodePos.x = x;
          nodePos.y = y;
          nodePos.vx = 0;
          nodePos.vy = 0;
        }
        return next;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
  };

  return {
    pan,
    setPan,
    isDragging,
    draggedNode,
    svgRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeDragStart,
  };
}

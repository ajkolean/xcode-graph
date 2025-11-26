/**
 * Custom hook for graph pan, zoom, and node dragging interactions
 * Extracted from GraphVisualization for cleaner separation of concerns
 */

import { useState, useCallback, RefObject } from 'react';
import { NodePosition, ClusterPosition } from '../../types/simulation';

interface UseGraphInteractionProps {
  svgRef: RefObject<SVGSVGElement>;
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
}

export function useGraphInteraction({
  svgRef,
  zoom,
  finalNodePositions,
  clusterPositions
}: UseGraphInteractionProps) {
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [manualNodePositions, setManualNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hasMoved, setHasMoved] = useState(false); // Track if mouse moved during drag

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setHasMoved(false); // Reset on new drag
    }
  }, [pan.x, pan.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !draggedNode) {
      // Pan mode
      setHasMoved(true); // Mark that we've moved
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNode) {
      // Node drag mode
      setHasMoved(true); // Mark that we've moved
      const svg = svgRef.current;
      if (!svg) return;
      
      const rect = svg.getBoundingClientRect();
      const node = finalNodePositions.get(draggedNode);
      if (!node) return;
      
      const cluster = clusterPositions.get(node.clusterId);
      if (!cluster) return;
      
      const x = (e.clientX - rect.left - pan.x) / zoom - cluster.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - cluster.y;
      
      setManualNodePositions(prev => {
        const next = new Map(prev);
        const nodePos = next.get(draggedNode);
        if (nodePos) {
          nodePos.x = x;
          nodePos.y = y;
        } else {
          next.set(draggedNode, { x, y });
        }
        return next;
      });
    }
  }, [isDragging, draggedNode, dragStart, pan, zoom, svgRef, finalNodePositions, clusterPositions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
    // Don't reset hasMoved here - it will be used by onClick handler
  }, []);

  // Node drag handlers
  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
  }, []);

  return {
    pan,
    isDragging,
    draggedNode,
    manualNodePositions,
    hasMoved,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeMouseDown
  };
}
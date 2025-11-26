/**
 * Custom hook for graph pan and zoom interactions
 * Extracts pan/zoom state and handlers from GraphVisualization
 */

import { useCallback, useRef, useState } from 'react';

interface UseGraphPanZoomProps {
  zoom: number;
  onZoomChange?: (zoom: number) => void;
}

interface UseGraphPanZoomResult {
  pan: { x: number; y: number };
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent) => void;
}

export function useGraphPanZoom({
  zoom,
  onZoomChange,
}: UseGraphPanZoomProps): UseGraphPanZoomResult {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start dragging on canvas background (not on nodes)
      if (
        (e.target as HTMLElement).tagName === 'svg' ||
        (e.target as HTMLElement).tagName === 'rect'
      ) {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        lastPanRef.current = pan;
      }
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      setPan({
        x: lastPanRef.current.x + dx,
        y: lastPanRef.current.y + dy,
      });
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(2, Math.max(0.2, zoom + delta));

      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    },
    [zoom, onZoomChange],
  );

  return {
    pan,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
}

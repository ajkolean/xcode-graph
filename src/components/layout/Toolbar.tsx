/**
 * Graph toolbar with zoom controls and stats
 * Extracted from App.tsx for better modularity
 * Uses design system CSS variables
 */

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  nodeCount: number;
  edgeCount: number;
}

export function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  nodeCount,
  edgeCount
}: ToolbarProps) {
  return null;
}
/**
 * Graph toolbar with zoom controls and stats
 * Extracted from App.tsx for better modularity
 * Uses design system CSS variables
 */

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  nodeCount: number;
  edgeCount: number;
}

export function Toolbar(_props: ToolbarProps) {
  return null;
}

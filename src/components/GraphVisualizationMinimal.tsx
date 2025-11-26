/**
 * Minimal graph visualization for testing
 */

import { useRef } from 'react';
import type { GraphEdge, GraphNode as GraphNodeType } from '../data/mockGraphData';
import type { ViewMode } from '../types/app';

interface GraphVisualizationMinimalProps {
  nodes: GraphNodeType[];
  edges: GraphEdge[];
  selectedNode: GraphNodeType | null;
  onNodeSelect: (node: GraphNodeType | null) => void;
  searchQuery: string;
  viewMode: ViewMode;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  transitiveDeps: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  transitiveDependents: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
}

export function GraphVisualizationMinimal(props: GraphVisualizationMinimalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ fontSize: 'var(--text-lg)' }}>
          Minimal Graph - Testing ({props.nodes.length} nodes, {props.edges.length} edges)
        </div>
      </div>
    </div>
  );
}

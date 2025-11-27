/**
 * DEAD CODE - MARKED FOR DELETION
 *
 * Stub component for testing GraphTab - not used anywhere in the codebase.
 * Analysis date: 2025-11-26
 *
 * Can be safely deleted after verification that:
 * 1. `pnpm dev` works correctly
 * 2. `pnpm build` passes
 * 3. No hidden dependencies exist
 *
 * If you need this component, remove this comment and update the analysis.
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';

interface GraphVisualizationStubProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
  searchQuery: string;
  viewMode: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  transitiveDeps: Set<string>;
  transitiveDependents: Set<string>;
}

export function GraphVisualizationStub(_props: GraphVisualizationStubProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ fontSize: 'var(--text-lg)' }}>Graph Visualization Loading...</div>
    </div>
  );
}

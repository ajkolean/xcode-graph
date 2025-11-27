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
import type { FilterState } from '../types/app';

interface RightSidebarStubProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
  onFocusNode: (node: GraphNode) => void;
  onShowDependents: (node: GraphNode) => void;
  onShowImpact: (node: GraphNode) => void;
  viewMode: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  zoom: number;
}

export function RightSidebarStub(_props: RightSidebarStubProps) {
  return (
    <div
      className="w-80 h-full shrink-0"
      style={{
        backgroundColor: 'var(--color-sidebar)',
        borderLeft: '1px solid var(--color-border)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif',
        padding: 'var(--space-4, 16px)',
      }}
    >
      <div style={{ fontSize: 'var(--text-base)' }}>Right Sidebar</div>
    </div>
  );
}

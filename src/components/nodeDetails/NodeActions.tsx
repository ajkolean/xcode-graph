/**
 * Node action buttons component
 */

import { Eye, EyeOff, Focus } from 'lucide-react';
import type { GraphNode } from '../../data/mockGraphData';

interface NodeActionsProps {
  node: GraphNode;
  viewMode?: string;
  onFocusNode: (node: GraphNode) => void;
  onShowDependents: (node: GraphNode) => void;
  onShowImpact: (node: GraphNode) => void;
}

export function NodeActions({
  node,
  viewMode,
  onFocusNode,
  onShowDependents,
  onShowImpact,
}: NodeActionsProps) {
  const isDependencyChainActive = viewMode === 'focused' || viewMode === 'both';
  const isDependentsChainActive = viewMode === 'dependents' || viewMode === 'both';

  return (
    <div
      className="p-4 shrink-0 flex flex-col gap-2"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Dependency Chain Button - Purple when active */}
      <button
        onClick={() => onFocusNode(node)}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-all"
        style={{
          backgroundColor: isDependencyChainActive
            ? viewMode === 'both'
              ? 'color-mix(in srgb, var(--primary) 80%, transparent)'
              : 'var(--primary)'
            : 'color-mix(in srgb, var(--primary) 10%, transparent)',
          border: `1px solid ${
            isDependencyChainActive
              ? 'var(--primary)'
              : 'color-mix(in srgb, var(--primary) 30%, transparent)'
          }`,
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 'var(--font-weight-medium)',
          lineHeight: '18px',
          color: isDependencyChainActive
            ? 'var(--primary-foreground)'
            : 'color-mix(in srgb, var(--primary) 120%, white)',
        }}
      >
        {isDependencyChainActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {isDependencyChainActive ? 'Hide Dependency Chain' : 'Show Dependency Chain'}
      </button>

      {/* Dependents Chain Button - Green when active */}
      <button
        onClick={() => onShowDependents(node)}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-all"
        style={{
          backgroundColor: isDependentsChainActive
            ? viewMode === 'both'
              ? 'color-mix(in srgb, var(--chart-3) 80%, transparent)'
              : 'color-mix(in srgb, var(--chart-3) 20%, transparent)'
            : 'color-mix(in srgb, var(--chart-3) 10%, transparent)',
          border: `1px solid ${
            isDependentsChainActive
              ? viewMode === 'both'
                ? 'color-mix(in srgb, var(--chart-3) 60%, transparent)'
                : 'color-mix(in srgb, var(--chart-3) 50%, transparent)'
              : 'color-mix(in srgb, var(--chart-3) 30%, transparent)'
          }`,
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 'var(--font-weight-medium)',
          lineHeight: '18px',
          color: isDependentsChainActive
            ? viewMode === 'both'
              ? 'var(--primary-foreground)'
              : 'var(--chart-3)'
            : 'var(--chart-3)',
        }}
      >
        <Focus className="size-4" style={{ transform: 'rotate(180deg)' }} />
        {isDependentsChainActive ? 'Hide Dependents Chain' : 'Show Dependents Chain'}
      </button>
    </div>
  );
}

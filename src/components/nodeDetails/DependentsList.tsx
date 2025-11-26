/**
 * Dependents list component
 */

import type { GraphNode } from '../../data/mockGraphData';
import { ListItemRow } from '../shared/ListItemRow';

interface DependentsListProps {
  dependents: GraphNode[];
  onNodeSelect: (node: GraphNode) => void;
  onNodeHover: (nodeId: string | null) => void;
}

export function DependentsList({ dependents, onNodeSelect, onNodeHover }: DependentsListProps) {
  return (
    <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-small)',
            color: 'var(--color-muted-foreground)',
          }}
        >
          Dependents
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: 'var(--color-foreground)',
            opacity: 0.3,
          }}
        >
          {dependents.length} direct
        </div>
      </div>

      {dependents.length === 0 ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'var(--text-small)',
            color: 'var(--color-muted-foreground)',
            fontStyle: 'italic',
          }}
        >
          No dependents
        </div>
      ) : (
        <div className="space-y-1">
          {dependents.map((dep) => {
            const subtitle =
              dep.origin === 'external'
                ? `External ${dep.type.charAt(0).toUpperCase() + dep.type.slice(1)}`
                : dep.type.charAt(0).toUpperCase() + dep.type.slice(1);

            return (
              <ListItemRow
                key={dep.id}
                node={dep}
                subtitle={subtitle}
                onSelect={onNodeSelect}
                onHover={onNodeHover}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Node info section component - displays key-value pairs about the node
 */

import type { GraphNode } from '../../data/mockGraphData';
import { getNodeTypeLabel } from '../../utils/nodeIcons';

interface NodeInfoProps {
  node: GraphNode;
}

export function NodeInfo({ node }: NodeInfoProps) {
  return (
    <div className="p-4 mt-auto">
      {/* Section Title */}
      <div
        className="mb-3"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'var(--text-label)',
          color: 'var(--color-muted-foreground)',
        }}
      >
        Node Info
      </div>

      {/* Info Rows */}
      <div className="flex flex-col gap-2">
        {/* Platform */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-muted-foreground)',
            }}
          >
            Platform:
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-foreground)',
            }}
          >
            {node.platform}
          </span>
        </div>

        {/* Origin */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-muted-foreground)',
            }}
          >
            Origin:
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-foreground)',
            }}
          >
            {node.origin === 'local' ? 'Local Project' : 'External Package'}
          </span>
        </div>

        {/* Type */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-muted-foreground)',
            }}
          >
            Type:
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-label)',
              color: 'var(--color-foreground)',
            }}
          >
            {getNodeTypeLabel(node.type)}
          </span>
        </div>
      </div>
    </div>
  );
}

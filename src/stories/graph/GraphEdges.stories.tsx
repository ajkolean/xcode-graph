/**
 * GraphEdges Component Stories - Container for all edges
 */

import type { Meta } from '@storybook/react';

const meta = {
  title: 'Graph/GraphEdges',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => (
    <div style={{ padding: '32px', color: '#94A3B8' }}>
      GraphEdges is a container component. See GraphEdge for individual edge rendering.
    </div>
  ),
};

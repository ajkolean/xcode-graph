/**
 * ClusterGroup Component Stories - Container for clustered nodes
 */

import type { Meta } from '@storybook/react';

const meta = {
  title: 'Graph/ClusterGroup',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => (
    <div style={{ padding: '32px', color: '#94A3B8' }}>
      ClusterGroup is a complex orchestrator component. See GraphVisualization for full examples.
    </div>
  ),
};

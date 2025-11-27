/**
 * GraphCluster Component - Note: This component may not have a standalone wrapper.
 * Skipping for now as it's typically used within ClusterGroup.
 */

import type { Meta } from '@storybook/react';

const meta = {
  title: 'Graph Visualization/GraphCluster',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => (
    <div style={{ padding: '32px', color: '#94A3B8' }}>
      GraphCluster is used internally by ClusterGroup. See ClusterCard and ClusterGroup stories.
    </div>
  ),
};

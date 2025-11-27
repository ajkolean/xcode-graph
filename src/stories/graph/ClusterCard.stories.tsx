/**
 * ClusterCard Component Stories - Cluster background card (SVG)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ClusterCard } from '../../components-lit/wrappers/ClusterCard';

const meta = {
  title: 'Graph/ClusterCard',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const mockCluster = {
  id: 'feature-kit',
  name: 'FeatureKit',
  type: 'project' as const,
  nodes: Array(12).fill(null).map((_, i) => ({ id: `node-${i}` })),
};

export const Default: Story = {
  render: () => (
    <div style={{ width: '600px', height: '400px', background: '#0a0a0f', borderRadius: '8px' }}>
      <svg width="600" height="400">
        <ClusterCard cluster={mockCluster} x={50} y={50} width={500} height={300} zoom={1.0} />
      </svg>
    </div>
  ),
};

export const Package: Story = {
  render: () => (
    <div style={{ width: '600px', height: '400px', background: '#0a0a0f', borderRadius: '8px' }}>
      <svg width="600" height="400">
        <ClusterCard
          cluster={{ ...mockCluster, name: 'Alamofire', type: 'package' }}
          x={50}
          y={50}
          width={500}
          height={300}
          zoom={1.0}
        />
      </svg>
    </div>
  ),
};

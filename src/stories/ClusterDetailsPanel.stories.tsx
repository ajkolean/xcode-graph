/**
 * ClusterDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ClusterDetailsPanel } from '../components-lit/wrappers/ClusterDetailsPanel';
import { mockGraphNodes, getNodesForProject } from './fixtures/mockNodes';
import { mockGraphEdges } from './fixtures/mockEdges';

const meta = {
  title: 'Containers/ClusterDetailsPanel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const mockCluster = {
  id: 'feature-kit',
  name: 'FeatureKit',
  type: 'project' as const,
  nodes: getNodesForProject('FeatureKit'),
};

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <ClusterDetailsPanel
        cluster={mockCluster}
        clusterNodes={mockCluster.nodes}
        allNodes={mockGraphNodes}
        edges={mockGraphEdges}
        zoom={1.0}
      />
    </div>
  ),
};

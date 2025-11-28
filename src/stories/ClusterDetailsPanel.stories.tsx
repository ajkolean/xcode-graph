/**
 * ClusterDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../components-lit/ui/cluster-details-panel';
import { mockGraphEdges } from './fixtures/mockEdges';
import { getNodesForProject, mockGraphNodes } from './fixtures/mockNodes';

const meta = {
  title: 'Panels & Views/ClusterDetailsPanel',
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
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-cluster-details-panel
        .cluster=${mockCluster}
        .clusterNodes=${mockCluster.nodes}
        .allNodes=${mockGraphNodes}
        .edges=${mockGraphEdges}
        zoom="1.0"
      ></graph-cluster-details-panel>
    </div>
  `,
};

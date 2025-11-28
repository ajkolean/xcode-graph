/**
 * ClusterDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../components-lit/ui/cluster-details-panel';
import {
  mockClusterLarge,
  mockClusterMedium,
  mockClusterPackage,
  mockClusterSmall,
} from './fixtures/mockClusters';
import { mockGraphEdges } from './fixtures/mockEdges';
import { mockGraphNodes } from './fixtures/mockNodes';

const clusterPresets = {
  'Small Project': mockClusterSmall,
  'Medium Project': mockClusterMedium,
  'Large Project': mockClusterLarge,
  Package: mockClusterPackage,
};

const meta = {
  title: 'Panels & Views/ClusterDetailsPanel',
  component: 'graph-cluster-details-panel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    clusterPreset: {
      control: 'select',
      options: Object.keys(clusterPresets),
      mapping: clusterPresets,
      description: 'Cluster configuration',
    },
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Zoom level',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clusterPreset: 'Medium Project',
    zoom: 1.0,
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-cluster-details-panel
        .cluster=${args.clusterPreset}
        .clusterNodes=${args.clusterPreset.nodes}
        .allNodes=${mockGraphNodes}
        .edges=${mockGraphEdges}
        zoom=${args.zoom}
      ></graph-cluster-details-panel>
    </div>
  `,
};

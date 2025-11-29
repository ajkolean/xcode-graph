/**
 * ClusterDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import './cluster-details-panel';
import type { Cluster } from '@shared/schemas';
import {
  mockClusterLarge,
  mockClusterMedium,
  mockClusterPackage,
  mockClusterSmall,
  mockGraphEdges,
  mockGraphNodes,
} from '@/fixtures';

const clusterPresets = {
  'Small Project': mockClusterSmall,
  'Medium Project': mockClusterMedium,
  'Large Project': mockClusterLarge,
  Package: mockClusterPackage,
};

interface Args {
  clusterPreset: Cluster;
  zoom: number;
}

const meta: Meta<Args> = {
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
      control: { type: 'range', min: 0.25, max: 2, step: 0.25 },
      description: 'Zoom level',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    clusterPreset: clusterPresets['Medium Project'],
    zoom: 1,
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
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify cluster details panel exists', async () => {
      const panel = canvasElement.querySelector('graph-cluster-details-panel');
      await expect(panel).toBeTruthy();
    });

    await step('Verify panel has shadow root content', async () => {
      const panel = canvasElement.querySelector('graph-cluster-details-panel');
      const shadowRoot = panel?.shadowRoot;
      await expect(shadowRoot).toBeTruthy();
    });

    await step('Verify header component exists', async () => {
      const panel = canvasElement.querySelector('graph-cluster-details-panel');
      const header = panel?.shadowRoot?.querySelector('graph-cluster-header');
      await expect(header).toBeTruthy();
    });
  },
};

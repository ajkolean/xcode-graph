/**
 * ClusterDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import '../components/ui/cluster-details-panel';
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
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify cluster header is present', async () => {
      // The cluster should have a header with its name
      const clusterHeader = await canvas.findByShadowText('Project');
      await expect(clusterHeader).toBeTruthy();
    });

    await step('Verify cluster type badge exists', async () => {
      const typeBadge = await canvas.findByShadowText('project');
      await expect(typeBadge).toBeTruthy();
    });

    await step('Verify targets section exists', async () => {
      const targetsSection = await canvas.findByShadowText('Targets');
      await expect(targetsSection).toBeTruthy();
    });

    await step('Verify metrics section exists', async () => {
      const metricsSection = await canvas.findByShadowText('Metrics');
      await expect(metricsSection).toBeTruthy();
    });

    await step('Hover over a target item if present', async () => {
      try {
        const listItems = await canvas.findAllByShadowRole('listitem');
        if (listItems.length > 0) {
          await userEvent.hover(listItems[0]);
          await new Promise((resolve) => setTimeout(resolve, 100));
          await userEvent.unhover(listItems[0]);
        }
      } catch {
        // No list items, skip this step
      }
    });
  },
};

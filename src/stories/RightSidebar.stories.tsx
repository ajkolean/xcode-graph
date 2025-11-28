/**
 * RightSidebar Component Stories - Main sidebar orchestrator
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import '../components/ui/right-sidebar';
import { mockGraphEdges } from './fixtures/mockEdges';
import { mockGraphNodes } from './fixtures/mockNodes';

const graphSizePresets = {
  'Small (8 nodes)': {
    nodes: mockGraphNodes.slice(0, 8),
    edges: mockGraphEdges.slice(0, 10),
  },
  'Full Graph': {
    nodes: mockGraphNodes,
    edges: mockGraphEdges,
  },
};

const meta = {
  title: 'Panels & Views/RightSidebar',
  component: 'graph-right-sidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    graphSize: {
      control: 'select',
      options: Object.keys(graphSizePresets),
      mapping: graphSizePresets,
      description: 'Graph data size',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    graphSize: 'Full Graph',
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px">
      <graph-right-sidebar
        .allNodes=${mockGraphNodes}
        .allEdges=${mockGraphEdges}
        .filteredNodes=${args.graphSize.nodes}
        .filteredEdges=${args.graphSize.edges}
      ></graph-right-sidebar>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify sidebar header is present', async () => {
      const header = await canvas.findByShadowText('Filters');
      await expect(header).toBeTruthy();
    });

    await step('Verify stats cards display', async () => {
      const nodesLabel = await canvas.findByShadowText('Nodes');
      await expect(nodesLabel).toBeTruthy();
    });

    await step('Verify filter sections are present', async () => {
      const productTypes = await canvas.findByShadowText('Product Types');
      await expect(productTypes).toBeTruthy();
    });
  },
};

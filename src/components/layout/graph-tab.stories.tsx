/**
 * GraphTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import '../../components/layout/graph-tab';
import { mockGraphEdges, mockGraphNodes } from '@/fixtures';

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
  title: 'Panels & Views/GraphTab',
  component: 'graph-tab',
  parameters: { layout: 'fullscreen' },
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
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-tab
        .displayNodes=${args.graphSize.nodes}
        .displayEdges=${args.graphSize.edges}
        .filteredNodes=${args.graphSize.nodes}
        .filteredEdges=${args.graphSize.edges}
        .allNodes=${mockGraphNodes}
        .allEdges=${mockGraphEdges}
      ></graph-tab>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for graph tab to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    await step('Verify graph tab element exists', async () => {
      const graphTab = canvasElement.querySelector('graph-tab');
      await expect(graphTab).toBeTruthy();
    });

    await step('Verify graph visualization is rendered', async () => {
      const graphTab = canvasElement.querySelector('graph-tab');
      const graphViz = graphTab?.shadowRoot?.querySelector('graph-visualization');
      await expect(graphViz).toBeTruthy();
    });

    await step('Verify right sidebar is rendered', async () => {
      const graphTab = canvasElement.querySelector('graph-tab');
      const sidebar = graphTab?.shadowRoot?.querySelector('graph-right-sidebar');
      await expect(sidebar).toBeTruthy();
    });
  },
};

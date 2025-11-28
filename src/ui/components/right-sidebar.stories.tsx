/**
 * RightSidebar Component Stories - Main sidebar orchestrator
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import './right-sidebar';
import type { GraphEdge, GraphNode } from '@shared/schemas';
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

interface Args {
  graphSize: { nodes: GraphNode[]; edges: GraphEdge[] };
}

const meta: Meta<Args> = {
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
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    graphSize: graphSizePresets['Full Graph'],
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
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify right sidebar element exists', async () => {
      const sidebar = canvasElement.querySelector('graph-right-sidebar');
      await expect(sidebar).toBeTruthy();
    });

    await step('Verify sidebar has shadow root content', async () => {
      const sidebar = canvasElement.querySelector('graph-right-sidebar');
      const shadowRoot = sidebar?.shadowRoot;
      await expect(shadowRoot).toBeTruthy();
    });

    await step('Verify header component exists', async () => {
      const sidebar = canvasElement.querySelector('graph-right-sidebar');
      const header = sidebar?.shadowRoot?.querySelector('graph-right-sidebar-header');
      await expect(header).toBeTruthy();
    });
  },
};

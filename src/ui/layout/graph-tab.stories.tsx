/**
 * GraphTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import './graph-tab';
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
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    graphSize: graphSizePresets['Full Graph'],
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
    // Helper to wait for element with polling
    const waitForElement = async (
      getElement: () => Element | null | undefined,
      timeout = 2000,
    ): Promise<Element | null> => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const element = getElement();
        if (element) return element;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return getElement();
    };

    await step('Verify graph tab element exists', async () => {
      const graphTab = await waitForElement(() => canvasElement.querySelector('graph-tab'));
      await expect(graphTab).toBeTruthy();
    });

    await step('Verify graph canvas is rendered', async () => {
      const graphTab = canvasElement.querySelector('graph-tab');
      const graphCanvas = await waitForElement(
        () => graphTab?.shadowRoot?.querySelector('graph-canvas'),
        3000,
      );
      await expect(graphCanvas).toBeTruthy();
    });

    await step('Verify right sidebar is rendered', async () => {
      const graphTab = canvasElement.querySelector('graph-tab');
      const sidebar = await waitForElement(() =>
        graphTab?.shadowRoot?.querySelector('graph-right-sidebar'),
      );
      await expect(sidebar).toBeTruthy();
    });
  },
};

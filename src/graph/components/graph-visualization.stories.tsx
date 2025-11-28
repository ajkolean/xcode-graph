/**
 * GraphVisualization Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import './graph-visualization';
import type { GraphEdge, GraphNode } from '@shared/schemas';
import { mockGraphEdges, mockGraphNodes } from '@/fixtures';

const graphSizePresets = {
  'Small (8 nodes)': {
    nodes: mockGraphNodes.slice(0, 8),
    edges: mockGraphEdges.slice(0, 10),
  },
  'Medium (12 nodes)': {
    nodes: mockGraphNodes.slice(0, 12),
    edges: mockGraphEdges.slice(0, 20),
  },
  'Full Graph': {
    nodes: mockGraphNodes,
    edges: mockGraphEdges,
  },
};

interface Args {
  graphSize: { nodes: GraphNode[]; edges: GraphEdge[] };
  searchQuery: string;
  zoom: number;
  enableAnimation: boolean;
}

const meta: Meta<Args> = {
  title: 'Panels & Views/GraphVisualization',
  component: 'graph-visualization',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    graphSize: {
      control: 'select',
      options: Object.keys(graphSizePresets),
      mapping: graphSizePresets,
      description: 'Graph data size',
    },
    searchQuery: {
      control: 'text',
      description: 'Search query to filter nodes',
    },
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Zoom level',
    },
    enableAnimation: {
      control: 'boolean',
      description: 'Enable transitions and animations',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

export const SimpleGraph: Story = {
  args: {
    graphSize: graphSizePresets['Small (8 nodes)'],
    searchQuery: '',
    zoom: 1.0,
    enableAnimation: false,
  },
  render: (args) => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-visualization
        .nodes=${args.graphSize.nodes}
        .edges=${args.graphSize.edges}
        search-query=${args.searchQuery}
        zoom=${args.zoom}
        ?enable-animation=${args.enableAnimation}
      ></graph-visualization>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for graph to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    await step('Verify graph visualization element exists', async () => {
      const graphViz = canvasElement.querySelector('graph-visualization');
      await expect(graphViz).toBeTruthy();
    });

    await step('Verify SVG canvas exists', async () => {
      const graphViz = canvasElement.querySelector('graph-visualization');
      const svg = graphViz?.shadowRoot?.querySelector('svg');
      await expect(svg).toBeTruthy();
    });
  },
};

export const FullGraph: Story = {
  args: {
    graphSize: graphSizePresets['Full Graph'],
    searchQuery: '',
    zoom: 1.0,
    enableAnimation: false,
  },
  render: (args) => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-visualization
        .nodes=${args.graphSize.nodes}
        .edges=${args.graphSize.edges}
        search-query=${args.searchQuery}
        zoom=${args.zoom}
        ?enable-animation=${args.enableAnimation}
      ></graph-visualization>
    </div>
  `,
};

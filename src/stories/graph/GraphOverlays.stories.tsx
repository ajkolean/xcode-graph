/**
 * GraphOverlays Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/graph/graph-overlays';

const meta = {
  title: 'Graph Visualization/GraphOverlays',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Background: Story = {
  tags: ['showcase'],
  render: () => html`
    <div style="width: 600px; height: 400px; position: relative">
      <graph-background></graph-background>
    </div>
  `,
};

const controlsMeta = {
  component: 'graph-controls',
  argTypes: {
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Zoom level',
    },
    nodeCount: {
      control: { type: 'number', min: 0, max: 200 },
      description: 'Number of nodes in graph',
    },
    edgeCount: {
      control: { type: 'number', min: 0, max: 500 },
      description: 'Number of edges in graph',
    },
    enableAnimation: {
      control: 'boolean',
      description: 'Enable animations',
    },
  },
};

export const Controls: Story = {
  ...controlsMeta,
  args: {
    zoom: 1.0,
    nodeCount: 52,
    edgeCount: 89,
    enableAnimation: true,
  },
  render: (args) => html`
    <div style="width: 600px; height: 400px; background: #0a0a0f; position: relative">
      <graph-controls
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
        ?enable-animation=${args.enableAnimation}
      ></graph-controls>
    </div>
  `,
};

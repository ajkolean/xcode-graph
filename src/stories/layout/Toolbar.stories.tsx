/**
 * Toolbar Component Stories
 *
 * Graph toolbar with zoom controls and stats display.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/toolbar';

const meta = {
  title: 'Layout/Toolbar',
  component: 'graph-toolbar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Current zoom level',
    },
    nodeCount: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Number of nodes in the graph',
    },
    edgeCount: {
      control: { type: 'number', min: 0, max: 2000 },
      description: 'Number of edges in the graph',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    zoom: 1.0,
    nodeCount: 42,
    edgeCount: 128,
  },
  render: (args) => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
        @zoom-in=${() => console.log('Zoom in')}
        @zoom-out=${() => console.log('Zoom out')}
        @zoom-reset=${() => console.log('Zoom reset')}
      ></graph-toolbar>
    </div>
  `,
};

export const ZoomedIn: Story = {
  args: {
    zoom: 1.5,
    nodeCount: 100,
    edgeCount: 250,
  },
  render: (args) => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
      ></graph-toolbar>
    </div>
  `,
};

export const ZoomedOut: Story = {
  args: {
    zoom: 0.5,
    nodeCount: 15,
    edgeCount: 30,
  },
  render: (args) => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
      ></graph-toolbar>
    </div>
  `,
};

export const MaxZoom: Story = {
  args: {
    zoom: 2.0,
    nodeCount: 200,
    edgeCount: 500,
  },
  render: (args) => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
      ></graph-toolbar>
    </div>
  `,
};

export const MinZoom: Story = {
  args: {
    zoom: 0.25,
    nodeCount: 5,
    edgeCount: 10,
  },
  render: (args) => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar
        zoom=${args.zoom}
        node-count=${args.nodeCount}
        edge-count=${args.edgeCount}
      ></graph-toolbar>
    </div>
  `,
};

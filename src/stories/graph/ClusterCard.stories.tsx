/**
 * ClusterCard Component Stories - Cluster background card (SVG)
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { renderClusterCard } from '../../components-lit/graph/svg-renderers';

const meta = {
  title: 'Graph Visualization/ClusterCard',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    clusterName: {
      control: 'text',
      description: 'Cluster name',
    },
    clusterType: {
      control: 'radio',
      options: ['project', 'package'],
      description: 'Cluster type',
    },
    nodeCount: {
      control: { type: 'number', min: 0, max: 50 },
      description: 'Number of nodes in cluster',
    },
    x: {
      control: { type: 'number', min: 0, max: 600 },
      description: 'X position of cluster card',
    },
    y: {
      control: { type: 'number', min: 0, max: 400 },
      description: 'Y position of cluster card',
    },
    width: {
      control: { type: 'range', min: 100, max: 600, step: 50 },
      description: 'Card width',
    },
    height: {
      control: { type: 'range', min: 100, max: 400, step: 50 },
      description: 'Card height',
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
    clusterName: 'FeatureKit',
    clusterType: 'project',
    nodeCount: 12,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
  },
  render: (args) => {
    const cluster = {
      id: args.clusterName.toLowerCase().replace(/\s+/g, '-'),
      name: args.clusterName,
      type: args.clusterType as 'project' | 'package',
      nodes: Array(args.nodeCount)
        .fill(null)
        .map((_, i) => ({ id: `node-${i}` })),
    };

    return html`
      <div style="width: 600px; height: 400px; background: #0a0a0f; border-radius: 8px;">
        <svg width="600" height="400">
          ${renderClusterCard({
            cluster,
            x: args.x,
            y: args.y,
            width: args.width,
            height: args.height,
            zoom: args.zoom,
          })}
        </svg>
      </div>
    `;
  },
};

export const Package: Story = {
  args: {
    clusterName: 'Alamofire',
    clusterType: 'package',
    nodeCount: 8,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
  },
  render: (args) => {
    const cluster = {
      id: args.clusterName.toLowerCase().replace(/\s+/g, '-'),
      name: args.clusterName,
      type: args.clusterType as 'project' | 'package',
      nodes: Array(args.nodeCount)
        .fill(null)
        .map((_, i) => ({ id: `node-${i}` })),
    };

    return html`
      <div style="width: 600px; height: 400px; background: #0a0a0f; border-radius: 8px;">
        <svg width="600" height="400">
          ${renderClusterCard({
            cluster,
            x: args.x,
            y: args.y,
            width: args.width,
            height: args.height,
            zoom: args.zoom,
          })}
        </svg>
      </div>
    `;
  },
};

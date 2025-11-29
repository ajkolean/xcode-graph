/**
 * ClusterCard Component Stories - Cluster background card (SVG)
 */

import { type Cluster, ClusterType, NodeType, Origin, Platform } from '@shared/schemas';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import { renderClusterCard } from './svg-renderers';

/** Create a minimal cluster for stories */
function createStoryCluster(name: string, type: ClusterType, nodeCount: number): Cluster {
  return {
    id: name.toLowerCase().replaceAll(/\s+/g, '-'),
    name,
    type,
    origin: type === ClusterType.Package ? Origin.External : Origin.Local,
    nodes: new Array(nodeCount).fill(null).map((_, i) => ({
      id: `node-${i}`,
      name: `Node${i}`,
      type: NodeType.Framework,
      platform: Platform.iOS,
      origin: Origin.Local,
    })),
    anchors: ['node-0'],
    metadata: new Map(),
  };
}

interface StoryArgs {
  clusterName: string;
  clusterType: ClusterType;
  nodeCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  isHighlighted: boolean;
  isDimmed: boolean;
  isSelected: boolean;
}

const meta: Meta<StoryArgs> = {
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
      options: Object.values(ClusterType),
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
    isHighlighted: {
      control: 'boolean',
      description: 'Whether the cluster card is highlighted (on hover)',
    },
    isDimmed: {
      control: 'boolean',
      description: 'Whether the cluster card is dimmed (not focused)',
    },
    isSelected: {
      control: 'boolean',
      description: 'Whether the cluster card is selected',
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {
    clusterName: 'FeatureKit',
    clusterType: ClusterType.Project,
    nodeCount: 12,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
    isHighlighted: false,
    isDimmed: false,
    isSelected: false,
  },
  render: (args) => {
    const cluster = createStoryCluster(args.clusterName, args.clusterType, args.nodeCount);

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
            isHighlighted: args.isHighlighted,
            isDimmed: args.isDimmed,
            isSelected: args.isSelected,
          })}
        </svg>
      </div>
    `;
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for SVG to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify SVG exists', async () => {
      const svg = canvasElement.querySelector('svg');
      await expect(svg).toBeTruthy();
    });

    await step('Verify cluster label is rendered', async () => {
      const svg = canvasElement.querySelector('svg');
      const labels = svg?.querySelectorAll('text');
      const labelTexts = Array.from(labels || []).map((t) => t.textContent);
      await expect(labelTexts.join(' ')).toContain('FeatureKit');
    });

    await step('Hover over cluster card', async () => {
      const svg = canvasElement.querySelector('svg');
      const rect = svg?.querySelector('rect');
      if (rect) {
        await userEvent.hover(rect);
        await new Promise((resolve) => setTimeout(resolve, 150));
        await userEvent.unhover(rect);
      }
    });
  },
};

export const Package: Story = {
  args: {
    clusterName: 'Alamofire',
    clusterType: ClusterType.Package,
    nodeCount: 8,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
    isHighlighted: false,
    isDimmed: false,
    isSelected: false,
  },
  render: (args) => {
    const cluster = createStoryCluster(args.clusterName, args.clusterType, args.nodeCount);

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
            isHighlighted: args.isHighlighted,
            isDimmed: args.isDimmed,
            isSelected: args.isSelected,
          })}
        </svg>
      </div>
    `;
  },
};

export const Highlighted: Story = {
  args: {
    clusterName: 'FeatureKit',
    clusterType: ClusterType.Project,
    nodeCount: 12,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
    isHighlighted: true,
    isDimmed: false,
    isSelected: false,
  },
  render: (args) => {
    const cluster = createStoryCluster(args.clusterName, args.clusterType, args.nodeCount);

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
            isHighlighted: args.isHighlighted,
            isDimmed: args.isDimmed,
            isSelected: args.isSelected,
          })}
        </svg>
      </div>
    `;
  },
};

export const Selected: Story = {
  args: {
    clusterName: 'FeatureKit',
    clusterType: ClusterType.Project,
    nodeCount: 12,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
    isHighlighted: false,
    isDimmed: false,
    isSelected: true,
  },
  render: (args) => {
    const cluster = createStoryCluster(args.clusterName, args.clusterType, args.nodeCount);

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
            isHighlighted: args.isHighlighted,
            isDimmed: args.isDimmed,
            isSelected: args.isSelected,
          })}
        </svg>
      </div>
    `;
  },
};

export const Dimmed: Story = {
  args: {
    clusterName: 'FeatureKit',
    clusterType: ClusterType.Project,
    nodeCount: 12,
    x: 50,
    y: 50,
    width: 500,
    height: 300,
    zoom: 1.0,
    isHighlighted: false,
    isDimmed: true,
    isSelected: false,
  },
  render: (args) => {
    const cluster = createStoryCluster(args.clusterName, args.clusterType, args.nodeCount);

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
            isHighlighted: args.isHighlighted,
            isDimmed: args.isDimmed,
            isSelected: args.isSelected,
          })}
        </svg>
      </div>
    `;
  },
};

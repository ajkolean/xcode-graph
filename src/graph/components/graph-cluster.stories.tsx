/**
 * GraphCluster Component Stories
 *
 * SVG cluster container with background, border, and glow effects.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html, svg } from 'lit';
import { expect, userEvent } from 'storybook/test';
import './graph-cluster';

const meta = {
  title: 'Graph Visualization/GraphCluster',
  component: 'graph-cluster',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    clusterId: {
      control: 'text',
      description: 'Unique cluster identifier',
    },
    x: {
      control: { type: 'number', min: 0, max: 600 },
      description: 'X coordinate of cluster center',
    },
    y: {
      control: { type: 'number', min: 0, max: 400 },
      description: 'Y coordinate of cluster center',
    },
    width: {
      control: { type: 'range', min: 80, max: 400, step: 20 },
      description: 'Width of cluster bounds',
    },
    height: {
      control: { type: 'range', min: 60, max: 300, step: 20 },
      description: 'Height of cluster bounds',
    },
    color: {
      control: 'color',
      description: 'Cluster border and label color',
    },
    nodeCount: {
      control: { type: 'number', min: 0, max: 50 },
      description: 'Number of targets in cluster',
    },
    origin: {
      control: 'select',
      options: ['local', 'external'],
      description: 'Cluster origin type',
    },
    isHovered: {
      control: 'boolean',
      description: 'Whether cluster is in hover state',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// SVG wrapper with required defs
const svgDefs = svg`
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
`;

export const Default: Story = {
  args: {
    clusterId: 'MainApp',
    x: 200,
    y: 150,
    width: 180,
    height: 120,
    color: '#8B5CF6',
    nodeCount: 5,
    origin: 'local',
    isHovered: false,
  },
  render: (args) => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id=${args.clusterId}
        x=${args.x}
        y=${args.y}
        width=${args.width}
        height=${args.height}
        color=${args.color}
        node-count=${args.nodeCount}
        origin=${args.origin}
        ?is-hovered=${args.isHovered}
      ></graph-cluster>
    </svg>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify cluster element exists', async () => {
      const cluster = canvasElement.querySelector('graph-cluster');
      await expect(cluster).toBeTruthy();
    });

    await step('Verify cluster has expected attributes', async () => {
      const cluster = canvasElement.querySelector('graph-cluster');
      await expect(cluster?.getAttribute('cluster-id')).toBe('MainApp');
      await expect(cluster?.getAttribute('origin')).toBe('local');
    });
  },
};

export const Hovered: Story = {
  args: {
    clusterId: 'CoreLib',
    x: 200,
    y: 150,
    width: 180,
    height: 120,
    color: '#06B6D4',
    nodeCount: 8,
    origin: 'local',
    isHovered: true,
  },
  render: (args) => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id=${args.clusterId}
        x=${args.x}
        y=${args.y}
        width=${args.width}
        height=${args.height}
        color=${args.color}
        node-count=${args.nodeCount}
        origin=${args.origin}
        ?is-hovered=${args.isHovered}
      ></graph-cluster>
    </svg>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify cluster is in hovered state', async () => {
      const cluster = canvasElement.querySelector('graph-cluster');
      await expect(cluster).toBeTruthy();
      await expect(cluster?.hasAttribute('is-hovered')).toBe(true);
    });

    await step('Verify cluster has expected attributes', async () => {
      const cluster = canvasElement.querySelector('graph-cluster');
      await expect(cluster?.getAttribute('cluster-id')).toBe('CoreLib');
      await expect(cluster?.getAttribute('origin')).toBe('local');
    });
  },
};

export const ExternalOrigin: Story = {
  args: {
    clusterId: 'Alamofire',
    x: 200,
    y: 150,
    width: 180,
    height: 120,
    color: '#F59E0B',
    nodeCount: 3,
    origin: 'external',
    isHovered: false,
  },
  render: (args) => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id=${args.clusterId}
        x=${args.x}
        y=${args.y}
        width=${args.width}
        height=${args.height}
        color=${args.color}
        node-count=${args.nodeCount}
        origin=${args.origin}
        ?is-hovered=${args.isHovered}
      ></graph-cluster>
    </svg>
  `,
};

export const LargeCluster: Story = {
  args: {
    clusterId: 'NetworkingModule',
    x: 200,
    y: 150,
    width: 280,
    height: 180,
    color: '#10B981',
    nodeCount: 15,
    origin: 'local',
    isHovered: false,
  },
  render: (args) => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id=${args.clusterId}
        x=${args.x}
        y=${args.y}
        width=${args.width}
        height=${args.height}
        color=${args.color}
        node-count=${args.nodeCount}
        origin=${args.origin}
        ?is-hovered=${args.isHovered}
      ></graph-cluster>
    </svg>
  `,
};

export const SmallCluster: Story = {
  args: {
    clusterId: 'Utils',
    x: 200,
    y: 150,
    width: 100,
    height: 80,
    color: '#EC4899',
    nodeCount: 2,
    origin: 'local',
    isHovered: false,
  },
  render: (args) => html`
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style="background: #0a0a0f; border-radius: 8px"
    >
      ${svgDefs}
      <graph-cluster
        cluster-id=${args.clusterId}
        x=${args.x}
        y=${args.y}
        width=${args.width}
        height=${args.height}
        color=${args.color}
        node-count=${args.nodeCount}
        origin=${args.origin}
        ?is-hovered=${args.isHovered}
      ></graph-cluster>
    </svg>
  `,
};

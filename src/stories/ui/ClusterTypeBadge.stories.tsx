/**
 * ClusterTypeBadge Component Stories
 *
 * Badge component displaying cluster type (package or project).
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/cluster-type-badge';

const meta = {
  title: 'Design System/UI/ClusterTypeBadge',
  component: 'graph-cluster-type-badge',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    clusterType: {
      control: 'radio',
      options: ['package', 'project'],
      description: 'The type of cluster (package or project)',
    },
    clusterColor: {
      control: 'color',
      description: 'The color to use for the badge (hex or CSS color)',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Package: Story = {
  args: {
    clusterType: 'package',
    clusterColor: '#8b5cf6',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-cluster-type-badge
        cluster-type=${args.clusterType}
        cluster-color=${args.clusterColor}
      ></graph-cluster-type-badge>
    </div>
  `,
};

export const Project: Story = {
  args: {
    clusterType: 'project',
    clusterColor: '#3b82f6',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-cluster-type-badge
        cluster-type=${args.clusterType}
        cluster-color=${args.clusterColor}
      ></graph-cluster-type-badge>
    </div>
  `,
};

export const CustomColors: Story = {
  tags: ['showcase'],
  name: '🎨 Custom Colors',
  render: () => html`
    <div
      style="display: flex; gap: 16px; padding: 48px; background: #0a0a0f; flex-wrap: wrap"
    >
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#8b5cf6"
      ></graph-cluster-type-badge>
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#ef4444"
      ></graph-cluster-type-badge>
      <graph-cluster-type-badge
        cluster-type="package"
        cluster-color="#10b981"
      ></graph-cluster-type-badge>
      <graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#3b82f6"
      ></graph-cluster-type-badge>
      <graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#f59e0b"
      ></graph-cluster-type-badge>
      <graph-cluster-type-badge
        cluster-type="project"
        cluster-color="#ec4899"
      ></graph-cluster-type-badge>
    </div>
  `,
};

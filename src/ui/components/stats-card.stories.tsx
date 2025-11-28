/**
 * StatsCard Component Stories
 *
 * Reusable stats card component for displaying metrics.
 * Used across all right sidebar panels for consistent metric display.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './stats-card';

interface Args {
  label: string;
  value: string;
  highlighted: boolean;
}

const meta: Meta<Args> = {
  title: 'Design System/UI/StatsCard',
  component: 'graph-stats-card',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text displayed above the value',
    },
    value: {
      control: 'text',
      description: 'The value to display (can be string or number)',
    },
    highlighted: {
      control: 'boolean',
      description: 'Whether to highlight the value with accent color',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Default: Story = {
  args: {
    label: 'Total',
    value: '42',
    highlighted: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 200px">
      <graph-stats-card
        label=${args.label}
        value=${args.value}
        ?highlighted=${args.highlighted}
      ></graph-stats-card>
    </div>
  `,
};

export const Highlighted: Story = {
  args: {
    label: 'Selected',
    value: '10',
    highlighted: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 200px">
      <graph-stats-card
        label=${args.label}
        value=${args.value}
        ?highlighted=${args.highlighted}
      ></graph-stats-card>
    </div>
  `,
};

export const LargeNumber: Story = {
  args: {
    label: 'Dependencies',
    value: '1,234',
    highlighted: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 200px">
      <graph-stats-card
        label=${args.label}
        value=${args.value}
        ?highlighted=${args.highlighted}
      ></graph-stats-card>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const AllVariants: Story = {
  tags: ['showcase'],
  name: '📚 All Variants',
  render: () => html`
    <div
      style="display: flex; gap: 16px; padding: 48px; background: #0a0a0f; flex-wrap: wrap"
    >
      <div style="width: 200px">
        <graph-stats-card label="Total" value="42"></graph-stats-card>
      </div>
      <div style="width: 200px">
        <graph-stats-card
          label="Selected"
          value="10"
          highlighted
        ></graph-stats-card>
      </div>
      <div style="width: 200px">
        <graph-stats-card label="Dependencies" value="1,234"></graph-stats-card>
      </div>
      <div style="width: 200px">
        <graph-stats-card
          label="Active"
          value="8"
          highlighted
        ></graph-stats-card>
      </div>
    </div>
  `,
};

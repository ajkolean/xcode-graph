/**
 * InfoRow Component Stories
 *
 * A key-value pair display component for metadata sections.
 * Used as a building block in node-info and other detail panels.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './info-row';

const meta = {
  title: 'Design System/UI/InfoRow',
  component: 'graph-info-row',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text (left side)',
    },
    value: {
      control: 'text',
      description: 'The value text (right side)',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Default: Story = {
  args: {
    label: 'Platform',
    value: 'iOS',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 300px;">
      <graph-info-row
        label=${args.label}
        value=${args.value}
      ></graph-info-row>
    </div>
  `,
};

export const WithLongValue: Story = {
  args: {
    label: 'Path',
    value: '/Users/developer/project/Sources/Core',
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f; width: 400px;">
      <graph-info-row
        label=${args.label}
        value=${args.value}
      ></graph-info-row>
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
    <div style="padding: 48px; background: #0a0a0f; width: 350px;">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <graph-info-row label="Platform" value="iOS"></graph-info-row>
        <graph-info-row label="Origin" value="External Package"></graph-info-row>
        <graph-info-row label="Type" value="Framework"></graph-info-row>
        <graph-info-row label="Version" value="1.2.3"></graph-info-row>
      </div>
    </div>
  `,
};

export const WithSlottedContent: Story = {
  name: '🔌 Slotted Content',
  render: () => html`
    <div style="padding: 48px; background: #0a0a0f; width: 350px;">
      <graph-info-row label="Status">
        <span style="color: #4ade80;">● Active</span>
      </graph-info-row>
    </div>
  `,
};

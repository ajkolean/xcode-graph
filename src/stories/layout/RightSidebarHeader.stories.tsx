/**
 * RightSidebarHeader Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RightSidebarHeader } from '../../components-lit/wrappers/RightSidebarHeader';

const meta = {
  title: 'Layout/RightSidebarHeader',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <RightSidebarHeader title="Filters" />
    </div>
  ),
};

export const NodeDetails: Story = {
  render: () => (
    <div style={{ width: '320px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
      <RightSidebarHeader title="Node Details" />
    </div>
  ),
};

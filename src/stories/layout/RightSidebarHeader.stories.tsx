/**
 * RightSidebarHeader Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/right-sidebar-header';

const meta = {
  title: 'Layout/RightSidebarHeader',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 320px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-right-sidebar-header title="Filters"></graph-right-sidebar-header>
    </div>
  `,
};

export const NodeDetails: Story = {
  render: () => html`
    <div style="width: 320px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-right-sidebar-header title="Node Details"></graph-right-sidebar-header>
    </div>
  `,
};

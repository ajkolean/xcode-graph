/**
 * RightSidebarHeader Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/ui/right-sidebar-header';

const meta = {
  title: 'Layout/RightSidebarHeader',
  component: 'graph-right-sidebar-header',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Header title text',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the sidebar is in collapsed state',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Filters',
    isCollapsed: false,
  },
  render: (args) => html`
    <div style="width: 320px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-right-sidebar-header
        title=${args.title}
        ?is-collapsed=${args.isCollapsed}
      ></graph-right-sidebar-header>
    </div>
  `,
};

export const NodeDetails: Story = {
  args: {
    title: 'Node Details',
    isCollapsed: false,
  },
  render: (args) => html`
    <div style="width: 320px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-right-sidebar-header
        title=${args.title}
        ?is-collapsed=${args.isCollapsed}
      ></graph-right-sidebar-header>
    </div>
  `,
};

export const Collapsed: Story = {
  args: {
    title: 'Filters',
    isCollapsed: true,
  },
  render: (args) => html`
    <div style="width: 320px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-right-sidebar-header
        title=${args.title}
        ?is-collapsed=${args.isCollapsed}
      ></graph-right-sidebar-header>
    </div>
  `,
};

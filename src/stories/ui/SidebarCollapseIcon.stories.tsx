/**
 * SidebarCollapseIcon Component Stories
 *
 * Animated icon for toggling sidebar collapse state.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/sidebar-collapse-icon';

const meta = {
  title: 'Design System/Icons/SidebarCollapseIcon',
  component: 'graph-sidebar-collapse-icon',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the sidebar is collapsed',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Interactive Stories with Controls
// ========================================

export const Expanded: Story = {
  args: {
    isCollapsed: false,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-sidebar-collapse-icon
        ?is-collapsed=${args.isCollapsed}
      ></graph-sidebar-collapse-icon>
    </div>
  `,
};

export const Collapsed: Story = {
  args: {
    isCollapsed: true,
  },
  render: (args) => html`
    <div style="padding: 32px; background: #0a0a0f">
      <graph-sidebar-collapse-icon
        ?is-collapsed=${args.isCollapsed}
      ></graph-sidebar-collapse-icon>
    </div>
  `,
};

// ========================================
// Showcase Stories
// ========================================

export const BothStates: Story = {
  tags: ['showcase'],
  name: '📚 Both States',
  render: () => html`
    <div
      style="display: flex; gap: 48px; padding: 48px; background: #0a0a0f; align-items: center"
    >
      <div style="text-align: center">
        <graph-sidebar-collapse-icon is-collapsed=${false}></graph-sidebar-collapse-icon>
        <div style="margin-top: 16px; font-size: 12px; color: #94A3B8">Expanded</div>
      </div>
      <div style="text-align: center">
        <graph-sidebar-collapse-icon is-collapsed=${true}></graph-sidebar-collapse-icon>
        <div style="margin-top: 16px; font-size: 12px; color: #94A3B8">Collapsed</div>
      </div>
    </div>
  `,
};

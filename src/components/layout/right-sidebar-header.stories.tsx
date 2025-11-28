/**
 * RightSidebarHeader Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
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
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify title is displayed', async () => {
      const title = await canvas.findByShadowText('Filters');
      await expect(title).toBeTruthy();
    });

    await step('Verify collapse button is present', async () => {
      const collapseButton = await canvas.findByShadowRole('button', { name: /collapse sidebar/i });
      await expect(collapseButton).toBeTruthy();
    });

    await step('Click collapse button', async () => {
      const collapseButton = await canvas.findByShadowRole('button', { name: /collapse sidebar/i });
      await userEvent.click(collapseButton);
    });

    await step('Hover over collapse button', async () => {
      const collapseButton = await canvas.findByShadowRole('button', { name: /collapse sidebar/i });
      await userEvent.hover(collapseButton);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await userEvent.unhover(collapseButton);
    });
  },
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
  play: async ({ canvas, canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify title is NOT displayed when collapsed', async () => {
      const header = canvasElement.querySelector('graph-right-sidebar-header');
      const titleEl = header?.shadowRoot?.querySelector('.title');
      await expect(titleEl).toBeNull();
    });

    await step('Verify expand button is present', async () => {
      const expandButton = await canvas.findByShadowRole('button', { name: /expand sidebar/i });
      await expect(expandButton).toBeTruthy();
    });

    await step('Click expand button', async () => {
      const expandButton = await canvas.findByShadowRole('button', { name: /expand sidebar/i });
      await userEvent.click(expandButton);
    });
  },
};

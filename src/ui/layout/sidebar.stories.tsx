/**
 * Sidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import './sidebar';

const meta = {
  title: 'Layout/Sidebar',
  component: 'graph-sidebar',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'showcase'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 240px; height: 600px; background: #0a0a0f">
      <graph-sidebar></graph-sidebar>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify sidebar element exists', async () => {
      const sidebar = canvasElement.querySelector('graph-sidebar');
      await expect(sidebar).toBeTruthy();
    });

    await step('Verify sidebar has content', async () => {
      const sidebar = canvasElement.querySelector('graph-sidebar');
      const shadowRoot = sidebar?.shadowRoot;
      await expect(shadowRoot).toBeTruthy();
    });
  },
};

/**
 * Header Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect } from 'storybook/test';
import '../../components/layout/header';

const meta = {
  title: 'Layout/Header',
  component: 'graph-header',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'showcase'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 100%; background: #0a0a0f">
      <graph-header></graph-header>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify header element exists', async () => {
      const header = canvasElement.querySelector('graph-header');
      await expect(header).toBeTruthy();
    });

    await step('Verify header has content', async () => {
      const header = canvasElement.querySelector('graph-header');
      const shadowRoot = header?.shadowRoot;
      await expect(shadowRoot).toBeTruthy();
    });
  },
};

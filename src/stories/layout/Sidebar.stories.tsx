/**
 * Sidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/sidebar';

const meta = {
  title: 'Layout/Sidebar',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 240px; height: 600px; background: #0a0a0f">
      <graph-sidebar></graph-sidebar>
    </div>
  `,
};

/**
 * PlaceholderTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/placeholder-tab';

const meta = {
  title: 'Layout/PlaceholderTab',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; background: #0a0a0f; border-radius: 8px">
      <graph-placeholder-tab></graph-placeholder-tab>
    </div>
  `,
};

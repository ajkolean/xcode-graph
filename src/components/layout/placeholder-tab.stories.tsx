/**
 * PlaceholderTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/layout/placeholder-tab';

const meta = {
  title: 'Layout/PlaceholderTab',
  component: 'graph-placeholder-tab',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Tab section title',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Resources',
  },
  render: (args) => html`
    <div style="width: 600px; height: 400px; background: #0a0a0f; border-radius: 8px">
      <graph-placeholder-tab title=${args.title}></graph-placeholder-tab>
    </div>
  `,
};

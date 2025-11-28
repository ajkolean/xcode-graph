/**
 * Header Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/header';

const meta = {
  title: 'Layout/Header',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 100%; background: #0a0a0f">
      <graph-header></graph-header>
    </div>
  `,
};

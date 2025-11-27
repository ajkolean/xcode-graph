/**
 * Header Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../../components-lit/wrappers/Header';

const meta = {
  title: 'Layout/Header',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', background: '#0a0a0f' }}>
      <Header />
    </div>
  ),
};

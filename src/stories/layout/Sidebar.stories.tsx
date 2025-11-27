/**
 * Sidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '../../components-lit/wrappers/Sidebar';

const meta = {
  title: 'Layout/Sidebar',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '240px', height: '600px', background: '#0a0a0f' }}>
      <Sidebar />
    </div>
  ),
};

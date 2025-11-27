/**
 * PlaceholderTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PlaceholderTab } from '../../components-lit/wrappers/PlaceholderTab';

const meta = {
  title: 'Layout/PlaceholderTab',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '600px', height: '400px', background: '#0a0a0f', borderRadius: '8px' }}>
      <PlaceholderTab />
    </div>
  ),
};

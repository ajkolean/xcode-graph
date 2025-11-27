/**
 * Toolbar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar as ReactToolbar } from '../../components/layout/Toolbar';

const meta = {
  title: 'Layout/Toolbar',
  component: ReactToolbar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ReactToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '16px', borderRadius: '8px' }}>
      <ReactToolbar />
    </div>
  ),
};

/**
 * KeyboardShortcuts Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KeyboardShortcuts as ReactKeyboardShortcuts } from '../components/KeyboardShortcuts';

const meta = {
  title: 'Utilities/KeyboardShortcuts',
  component: ReactKeyboardShortcuts,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ReactKeyboardShortcuts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ background: '#0a0a0f', padding: '32px' }}>
      <ReactKeyboardShortcuts />
    </div>
  ),
};

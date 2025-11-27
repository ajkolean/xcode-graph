/**
 * FilterView Component Stories - Complete filter interface
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FilterView as ReactFilterView } from '../../components/sidebar/FilterView';

const meta = {
  title: 'Features/Filters/FilterView',
  component: ReactFilterView,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ReactFilterView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px' }}>
      <ReactFilterView />
    </div>
  ),
};

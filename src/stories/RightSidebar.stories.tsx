/**
 * RightSidebar Component Stories - Main sidebar orchestrator
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RightSidebar } from '../components-lit/wrappers/RightSidebar';
import { mockGraphNodes } from './fixtures/mockNodes';
import { mockGraphEdges } from './fixtures/mockEdges';

const meta = {
  title: 'Containers/RightSidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px' }}>
      <RightSidebar
        allNodes={mockGraphNodes}
        allEdges={mockGraphEdges}
        filteredNodes={mockGraphNodes}
        filteredEdges={mockGraphEdges}
      />
    </div>
  ),
};

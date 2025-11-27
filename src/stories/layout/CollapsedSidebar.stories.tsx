/**
 * CollapsedSidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CollapsedSidebar } from '../../components-lit/wrappers/CollapsedSidebar';
import { mockGraphNodes } from '../fixtures/mockNodes';
import { mockGraphEdges } from '../fixtures/mockEdges';

const meta = {
  title: 'Layout/CollapsedSidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '56px', height: '600px', background: '#0f0f14', borderRadius: '8px' }}>
      <CollapsedSidebar
        filteredNodes={mockGraphNodes}
        filteredEdges={mockGraphEdges}
        nodeTypesFilterSize={3}
        platformsFilterSize={2}
      />
    </div>
  ),
};

/**
 * GraphTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphTab } from '../../components-lit/wrappers/GraphTab';
import { mockGraphNodes } from '../fixtures/mockNodes';
import { mockGraphEdges } from '../fixtures/mockEdges';

const meta = {
  title: 'Complex/GraphTab',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '600px', background: '#0a0a0f' }}>
      <GraphTab
        displayNodes={mockGraphNodes}
        displayEdges={mockGraphEdges}
        filteredNodes={mockGraphNodes}
        filteredEdges={mockGraphEdges}
        allNodes={mockGraphNodes}
        allEdges={mockGraphEdges}
      />
    </div>
  ),
};

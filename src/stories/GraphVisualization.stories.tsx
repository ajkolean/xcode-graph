/**
 * GraphVisualization Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphVisualization } from '../components-lit/wrappers/GraphVisualization';
import { mockGraphNodes } from './fixtures/mockNodes';
import { mockGraphEdges } from './fixtures/mockEdges';

const meta = {
  title: 'Complex/GraphVisualization',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SimpleGraph: Story = {
  render: () => (
    <div style={{ width: '100%', height: '600px', background: '#0a0a0f' }}>
      <GraphVisualization
        nodes={mockGraphNodes.slice(0, 8)}
        edges={mockGraphEdges.slice(0, 10)}
        zoom={1.0}
        enableAnimation={false}
      />
    </div>
  ),
};

export const FullGraph: Story = {
  render: () => (
    <div style={{ width: '100%', height: '600px', background: '#0a0a0f' }}>
      <GraphVisualization
        nodes={mockGraphNodes}
        edges={mockGraphEdges}
        zoom={1.0}
        enableAnimation={false}
      />
    </div>
  ),
};

/**
 * GraphOverlays Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphBackground, GraphControls } from '../../components-lit/wrappers/GraphOverlays';

const meta = {
  title: 'Graph Visualization/GraphOverlays',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Background: Story = {
  render: () => (
    <div style={{ width: '600px', height: '400px', position: 'relative' }}>
      <GraphBackground />
    </div>
  ),
};

export const Controls: Story = {
  render: () => (
    <div style={{ width: '600px', height: '400px', background: '#0a0a0f', position: 'relative' }}>
      <GraphControls zoom={1.0} nodeCount={52} edgeCount={89} enableAnimation={true} />
    </div>
  ),
};

/**
 * GraphSVGDefs Component Stories
 *
 * SVG definitions (gradients, patterns, filters) for graph visualization.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GraphSVGDefs } from '../../components-lit/wrappers/GraphSVGDefs';

const meta = {
  title: 'Graph Visualization/GraphSVGDefs',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllDefinitions: Story = {
  name: 'All Definitions',
  render: () => (
    <div style={{ width: '800px', height: '400px', background: '#0a0a0f', borderRadius: '8px' }}>
      <svg width="800" height="400">
        <GraphSVGDefs />
        <text x="400" y="200" fill="#94A3B8" textAnchor="middle" fontSize="14">
          SVG Defs loaded (used internally by graph components)
        </text>
      </svg>
    </div>
  ),
};

/**
 * GraphSVGDefs Component Stories
 *
 * SVG definitions (gradients, patterns, filters) for graph visualization.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './graph-svg-defs';

const meta = {
  title: 'Graph Visualization/GraphSVGDefs',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllDefinitions: Story = {
  name: 'All Definitions',
  render: () => html`
    <div style="width: 800px; height: 400px; background: #0a0a0f; border-radius: 8px">
      <svg width="800" height="400">
        <graph-svg-defs></graph-svg-defs>
        <text x="400" y="200" fill="#94A3B8" text-anchor="middle" font-size="14">
          SVG Defs loaded (used internally by graph components)
        </text>
      </svg>
    </div>
  `,
};

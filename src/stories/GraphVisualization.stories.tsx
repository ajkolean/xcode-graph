/**
 * GraphVisualization Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../components-lit/graph/graph-visualization';
import { mockGraphEdges } from './fixtures/mockEdges';
import { mockGraphNodes } from './fixtures/mockNodes';

const meta = {
  title: 'Panels & Views/GraphVisualization',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SimpleGraph: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-visualization
        .nodes=${mockGraphNodes.slice(0, 8)}
        .edges=${mockGraphEdges.slice(0, 10)}
        zoom="1.0"
        ?enable-animation=${false}
      ></graph-visualization>
    </div>
  `,
};

export const FullGraph: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-visualization
        .nodes=${mockGraphNodes}
        .edges=${mockGraphEdges}
        zoom="1.0"
        ?enable-animation=${false}
      ></graph-visualization>
    </div>
  `,
};

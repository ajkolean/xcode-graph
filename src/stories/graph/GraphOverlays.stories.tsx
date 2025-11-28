/**
 * GraphOverlays Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/graph/graph-overlays';

const meta = {
  title: 'Graph Visualization/GraphOverlays',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Background: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; position: relative">
      <graph-background></graph-background>
    </div>
  `,
};

export const Controls: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; background: #0a0a0f; position: relative">
      <graph-controls zoom="1.0" node-count="52" edge-count="89" ?enable-animation=${true}></graph-controls>
    </div>
  `,
};

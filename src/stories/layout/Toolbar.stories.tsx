/**
 * Toolbar Component Stories
 *
 * Graph toolbar with zoom controls and stats display.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/toolbar';

const meta = {
  title: 'Layout/Toolbar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar zoom="1.0" node-count="42" edge-count="128"></graph-toolbar>
    </div>
  `,
};

export const ZoomedIn: Story = {
  render: () => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar zoom="1.5" node-count="100" edge-count="250"></graph-toolbar>
    </div>
  `,
};

export const ZoomedOut: Story = {
  render: () => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar zoom="0.5" node-count="15" edge-count="30"></graph-toolbar>
    </div>
  `,
};

export const MaxZoom: Story = {
  render: () => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar zoom="2.0" node-count="200" edge-count="500"></graph-toolbar>
    </div>
  `,
};

export const MinZoom: Story = {
  render: () => html`
    <div style="background: #0a0a0f; padding: 16px; border-radius: 8px; width: 500px">
      <graph-toolbar zoom="0.25" node-count="5" edge-count="10"></graph-toolbar>
    </div>
  `,
};

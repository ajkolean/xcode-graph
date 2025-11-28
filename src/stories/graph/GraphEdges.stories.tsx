/**
 * GraphEdges Component Stories - Container for all edges
 */

import type { Meta } from '@storybook/web-components';
import { html } from 'lit';

const meta = {
  title: 'Graph Visualization/GraphEdges',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => html`
    <div style="padding: 32px; color: #94A3B8">
      GraphEdges is a container component. See GraphEdge for individual edge rendering.
    </div>
  `,
};

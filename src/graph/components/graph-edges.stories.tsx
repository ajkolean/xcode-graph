/**
 * GraphEdges Component Stories - Container for all edges
 */

import type { Meta } from '@storybook/web-components';
import { html } from 'lit';

const meta = {
  title: 'Graph Visualization/GraphEdges',
  component: 'graph-edges',
  parameters: { layout: 'centered' },
  tags: ['autodocs', 'showcase'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => html`
    <div style="padding: 32px; color: #94A3B8">
      <p><strong>GraphEdges</strong> is a complex container component for rendering all edges in the graph.</p>
      <p>It manages edge positioning, filtering, and interactions.</p>
      <p>See <strong>GraphEdge</strong> for individual edge rendering examples.</p>
    </div>
  `,
};

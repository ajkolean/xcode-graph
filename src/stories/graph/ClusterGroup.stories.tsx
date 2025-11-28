/**
 * ClusterGroup Component Stories - Container for clustered nodes
 */

import type { Meta } from '@storybook/web-components';
import { html } from 'lit';

const meta = {
  title: 'Graph Visualization/ClusterGroup',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => html`
    <div style="padding: 32px; color: #94A3B8">
      ClusterGroup is a complex orchestrator component. See GraphVisualization for full examples.
    </div>
  `,
};

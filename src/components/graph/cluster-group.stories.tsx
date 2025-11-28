/**
 * ClusterGroup Component Stories - Container for clustered nodes
 */

import type { Meta } from '@storybook/web-components';
import { html } from 'lit';

const meta = {
  title: 'Graph Visualization/ClusterGroup',
  component: 'graph-cluster-group',
  parameters: { layout: 'centered' },
  tags: ['autodocs', 'showcase'],
} satisfies Meta;

export default meta;

export const Note = {
  render: () => html`
    <div style="padding: 32px; color: #94A3B8">
      <p><strong>ClusterGroup</strong> is a complex orchestrator component that manages cluster layout and interactions.</p>
      <p>It handles node positioning, cluster boundaries, and event coordination.</p>
      <p>See <strong>GraphVisualization</strong> for full examples with interactive clusters.</p>
    </div>
  `,
};

/**
 * NodeDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../components-lit/ui/node-details-panel';
import { mockGraphEdges } from './fixtures/mockEdges';
import { allNodeTypes, mockGraphNodes } from './fixtures/mockNodes';

const meta = {
  title: 'Panels & Views/NodeDetailsPanel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-node-details-panel
        .node=${allNodeTypes[0]}
        .allNodes=${mockGraphNodes}
        .edges=${mockGraphEdges}
        zoom="1.0"
      ></graph-node-details-panel>
    </div>
  `,
};

export const AllNodeTypes: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px">
      ${allNodeTypes.slice(0, 4).map(
        (node) => html`
        <div style="width: 320px; height: 500px; background: #0f0f14; border-radius: 8px; overflow: hidden">
          <graph-node-details-panel
            .node=${node}
            .allNodes=${mockGraphNodes}
            .edges=${mockGraphEdges}
            zoom="1.0"
          ></graph-node-details-panel>
        </div>
      `,
      )}
    </div>
  `,
};

/**
 * GraphTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/graph-tab';
import { mockGraphNodes } from '../fixtures/mockNodes';
import { mockGraphEdges } from '../fixtures/mockEdges';

const meta = {
  title: 'Panels & Views/GraphTab',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-tab
        .displayNodes=${mockGraphNodes}
        .displayEdges=${mockGraphEdges}
        .filteredNodes=${mockGraphNodes}
        .filteredEdges=${mockGraphEdges}
        .allNodes=${mockGraphNodes}
        .allEdges=${mockGraphEdges}
      ></graph-tab>
    </div>
  `,
};

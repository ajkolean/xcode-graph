/**
 * RightSidebar Component Stories - Main sidebar orchestrator
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../components-lit/ui/right-sidebar';
import { mockGraphEdges } from './fixtures/mockEdges';
import { mockGraphNodes } from './fixtures/mockNodes';

const meta = {
  title: 'Panels & Views/RightSidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px">
      <graph-right-sidebar
        .allNodes=${mockGraphNodes}
        .allEdges=${mockGraphEdges}
        .filteredNodes=${mockGraphNodes}
        .filteredEdges=${mockGraphEdges}
      ></graph-right-sidebar>
    </div>
  `,
};

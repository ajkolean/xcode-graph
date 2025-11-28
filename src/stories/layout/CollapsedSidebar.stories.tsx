/**
 * CollapsedSidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/collapsed-sidebar';
import { mockGraphNodes } from '../fixtures/mockNodes';
import { mockGraphEdges } from '../fixtures/mockEdges';

const meta = {
  title: 'Layout/CollapsedSidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 56px; height: 600px; background: #0f0f14; border-radius: 8px">
      <graph-collapsed-sidebar
        .filteredNodes=${mockGraphNodes}
        .filteredEdges=${mockGraphEdges}
        node-types-filter-size="3"
        platforms-filter-size="2"
      ></graph-collapsed-sidebar>
    </div>
  `,
};

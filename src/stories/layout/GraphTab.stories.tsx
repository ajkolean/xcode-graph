/**
 * GraphTab Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/layout/graph-tab';
import { mockGraphEdges } from '../fixtures/mockEdges';
import { mockGraphNodes } from '../fixtures/mockNodes';

const graphSizePresets = {
  'Small (8 nodes)': {
    nodes: mockGraphNodes.slice(0, 8),
    edges: mockGraphEdges.slice(0, 10),
  },
  'Full Graph': {
    nodes: mockGraphNodes,
    edges: mockGraphEdges,
  },
};

const meta = {
  title: 'Panels & Views/GraphTab',
  component: 'graph-tab',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    graphSize: {
      control: 'select',
      options: Object.keys(graphSizePresets),
      mapping: graphSizePresets,
      description: 'Graph data size',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    graphSize: 'Full Graph',
  },
  render: (args) => html`
    <div style="width: 100%; height: 600px; background: #0a0a0f">
      <graph-tab
        .displayNodes=${args.graphSize.nodes}
        .displayEdges=${args.graphSize.edges}
        .filteredNodes=${args.graphSize.nodes}
        .filteredEdges=${args.graphSize.edges}
        .allNodes=${mockGraphNodes}
        .allEdges=${mockGraphEdges}
      ></graph-tab>
    </div>
  `,
};

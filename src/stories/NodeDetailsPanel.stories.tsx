/**
 * NodeDetailsPanel Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import '../components/ui/node-details-panel';
import { mockGraphEdges } from './fixtures/mockEdges';
import { allNodeTypes, mockGraphNodes } from './fixtures/mockNodes';

const nodeTypeMap = {
  App: allNodeTypes[0],
  Framework: allNodeTypes[1],
  Library: allNodeTypes[2],
  'Test Unit': allNodeTypes[3],
  'Test UI': allNodeTypes[4],
  CLI: allNodeTypes[5],
  Package: allNodeTypes[6],
};

const meta = {
  title: 'Panels & Views/NodeDetailsPanel',
  component: 'graph-node-details-panel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    nodeType: {
      control: 'select',
      options: Object.keys(nodeTypeMap),
      mapping: nodeTypeMap,
      description: 'Node type to display',
    },
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Zoom level',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodeType: 'App',
    zoom: 1.0,
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-node-details-panel
        .node=${args.nodeType}
        .allNodes=${mockGraphNodes}
        .edges=${mockGraphEdges}
        zoom=${args.zoom}
      ></graph-node-details-panel>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify node header is present', async () => {
      // The node name should be displayed in the header
      const nodeInfo = await canvas.findByShadowText('App');
      await expect(nodeInfo).toBeTruthy();
    });

    await step('Verify dependencies section exists', async () => {
      const depsSection = await canvas.findByShadowText('Dependencies');
      await expect(depsSection).toBeTruthy();
    });

    await step('Verify dependents section exists', async () => {
      const dependentsSection = await canvas.findByShadowText('Dependents');
      await expect(dependentsSection).toBeTruthy();
    });

    await step('Hover over a dependency item if present', async () => {
      try {
        const listItems = await canvas.findAllByShadowRole('listitem');
        if (listItems.length > 0) {
          await userEvent.hover(listItems[0]);
          await new Promise((resolve) => setTimeout(resolve, 100));
          await userEvent.unhover(listItems[0]);
        }
      } catch {
        // No list items, skip this step
      }
    });
  },
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

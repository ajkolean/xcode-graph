/**
 * CollapsedSidebar Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent } from 'storybook/test';
import '../../components/ui/collapsed-sidebar';
import { mockGraphEdges } from '../fixtures/mockEdges';
import { mockGraphNodes } from '../fixtures/mockNodes';

const meta = {
  title: 'Layout/CollapsedSidebar',
  component: 'graph-collapsed-sidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    nodeTypesFilterSize: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of node type filters active',
    },
    platformsFilterSize: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of platform filters active',
    },
    projectsFilterSize: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of project filters active',
    },
    packagesFilterSize: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of package filters active',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodeTypesFilterSize: 3,
    platformsFilterSize: 2,
    projectsFilterSize: 0,
    packagesFilterSize: 0,
  },
  render: (args) => html`
    <div style="width: 56px; height: 600px; background: #0f0f14; border-radius: 8px">
      <graph-collapsed-sidebar
        .filteredNodes=${mockGraphNodes}
        .filteredEdges=${mockGraphEdges}
        node-types-filter-size=${args.nodeTypesFilterSize}
        platforms-filter-size=${args.platformsFilterSize}
        projects-filter-size=${args.projectsFilterSize}
        packages-filter-size=${args.packagesFilterSize}
      ></graph-collapsed-sidebar>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Verify collapsed sidebar exists', async () => {
      const sidebar = canvasElement.querySelector('graph-collapsed-sidebar');
      await expect(sidebar).toBeTruthy();
    });

    await step('Verify filter icons are present', async () => {
      const sidebar = canvasElement.querySelector('graph-collapsed-sidebar');
      const buttons = sidebar?.shadowRoot?.querySelectorAll('button');
      await expect(buttons?.length).toBeGreaterThan(0);
    });

    await step('Hover over first filter icon', async () => {
      const sidebar = canvasElement.querySelector('graph-collapsed-sidebar');
      const firstButton = sidebar?.shadowRoot?.querySelector('button');
      if (firstButton) {
        await userEvent.hover(firstButton);
        await new Promise((resolve) => setTimeout(resolve, 200));
        await userEvent.unhover(firstButton);
      }
    });
  },
};

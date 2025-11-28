/**
 * FilterView Component Stories - Complete filter interface
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import './filter-view';
import type { FilterState } from '@shared/schemas';

// Sample data
const nodeTypeItems = [
  { key: 'app', count: 3, color: '#8B5CF6' },
  { key: 'framework', count: 12, color: '#06B6D4' },
  { key: 'staticLibrary', count: 8, color: '#10B981' },
  { key: 'package', count: 5, color: '#F59E0B' },
];

const platformItems = [
  { key: 'iOS', count: 15, color: '#3B82F6' },
  { key: 'macOS', count: 8, color: '#8B5CF6' },
  { key: 'watchOS', count: 3, color: '#EC4899' },
  { key: 'tvOS', count: 2, color: '#10B981' },
];

const projectItems = [
  { key: 'MainApp', count: 5, color: '#8B5CF6' },
  { key: 'CoreLib', count: 8, color: '#06B6D4' },
  { key: 'NetworkKit', count: 4, color: '#10B981' },
  { key: 'UIComponents', count: 6, color: '#F59E0B' },
];

const packageItems = [
  { key: 'Alamofire', count: 3, color: '#EF4444' },
  { key: 'SwiftyJSON', count: 2, color: '#F59E0B' },
  { key: 'SnapKit', count: 4, color: '#10B981' },
];

const emptyFilters: FilterState = {
  nodeTypes: new Set<string>(),
  platforms: new Set<string>(),
  origins: new Set<string>(),
  projects: new Set<string>(),
  packages: new Set<string>(),
};

const filterPresets = {
  'No Filters': {
    filters: emptyFilters,
    filteredNodesCount: 28,
    filteredEdgesCount: 42,
  },
  'iOS Only': {
    filters: {
      nodeTypes: new Set<string>(),
      platforms: new Set<string>(['iOS']),
      origins: new Set<string>(),
      projects: new Set<string>(),
      packages: new Set<string>(),
    },
    filteredNodesCount: 15,
    filteredEdgesCount: 22,
  },
  'Apps & Frameworks': {
    filters: {
      nodeTypes: new Set<string>(['app', 'framework']),
      platforms: new Set<string>(),
      origins: new Set<string>(),
      projects: new Set<string>(),
      packages: new Set<string>(),
    },
    filteredNodesCount: 15,
    filteredEdgesCount: 25,
  },
  'MainApp Project': {
    filters: {
      nodeTypes: new Set<string>(),
      platforms: new Set<string>(),
      origins: new Set<string>(),
      projects: new Set<string>(['MainApp']),
      packages: new Set<string>(),
    },
    filteredNodesCount: 5,
    filteredEdgesCount: 8,
  },
};

interface Args {
  filterPreset: {
    filters: FilterState;
    filteredNodesCount: number;
    filteredEdgesCount: number;
  };
  searchQuery: string;
  zoom: number;
}

const meta: Meta<Args> = {
  title: 'Features/Filters/FilterView',
  component: 'graph-filter-view',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    filterPreset: {
      control: 'select',
      options: Object.keys(filterPresets),
      mapping: filterPresets,
      description: 'Filter configuration preset',
    },
    searchQuery: {
      control: 'text',
      description: 'Search query text',
    },
    zoom: {
      control: { type: 'range', min: 0.25, max: 2.0, step: 0.25 },
      description: 'Zoom level',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    filterPreset: filterPresets['No Filters'],
    searchQuery: '',
    zoom: 1.0,
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count=${args.filterPreset.filteredNodesCount}
        total-nodes-count="28"
        filtered-edges-count=${args.filterPreset.filteredEdgesCount}
        total-edges-count="42"
        .filters=${args.filterPreset.filters}
        search-query=${args.searchQuery}
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom=${args.zoom}
      ></graph-filter-view>
    </div>
  `,
  play: async ({ canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify stats cards display', async () => {
      const nodesLabel = await canvas.findByShadowText('Nodes');
      await expect(nodesLabel).toBeTruthy();
      const depsLabel = await canvas.findByShadowText('Dependencies');
      await expect(depsLabel).toBeTruthy();
    });

    await step('Verify filter sections are present', async () => {
      const productTypes = await canvas.findByShadowText('Product Types');
      await expect(productTypes).toBeTruthy();
      const platforms = await canvas.findByShadowText('Platforms');
      await expect(platforms).toBeTruthy();
      const projects = await canvas.findByShadowText('Projects');
      await expect(projects).toBeTruthy();
      const packages = await canvas.findByShadowText('Packages');
      await expect(packages).toBeTruthy();
    });

    await step('Verify search bar placeholder', async () => {
      const searchInput = await canvas.findByShadowRole('textbox');
      await expect(searchInput).toHaveAttribute('placeholder', 'Filter nodes...');
    });

    await step('Type in search bar', async () => {
      const searchInput = await canvas.findByShadowRole('textbox');
      await userEvent.type(searchInput, 'Core');
      await waitFor(() => expect(searchInput).toHaveValue('Core'));
    });
  },
};

export const WithActiveFilters: Story = {
  args: {
    filterPreset: filterPresets['Apps & Frameworks'],
    searchQuery: '',
    zoom: 1.0,
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count=${args.filterPreset.filteredNodesCount}
        total-nodes-count="28"
        filtered-edges-count=${args.filterPreset.filteredEdgesCount}
        total-edges-count="42"
        .filters=${args.filterPreset.filters}
        search-query=${args.searchQuery}
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom=${args.zoom}
      ></graph-filter-view>
    </div>
  `,
  play: async ({ canvasElement, canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify filter view exists', async () => {
      const filterView = canvasElement.querySelector('graph-filter-view');
      await expect(filterView).toBeTruthy();
    });

    await step('Verify filtered stats display (15/28 nodes)', async () => {
      const stats = await canvas.findByShadowText('15/28');
      await expect(stats).toBeTruthy();
    });

    await step('Verify clear filters button component exists', async () => {
      const filterView = canvasElement.querySelector('graph-filter-view');
      const clearButton = filterView?.shadowRoot?.querySelector('graph-clear-filters-button');
      await expect(clearButton).toBeTruthy();
    });
  },
};

export const WithSearch: Story = {
  args: {
    filterPreset: filterPresets['No Filters'],
    searchQuery: 'Core',
    zoom: 1.0,
  },
  render: (args) => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count="5"
        total-nodes-count="28"
        filtered-edges-count="8"
        total-edges-count="42"
        .filters=${args.filterPreset.filters}
        search-query=${args.searchQuery}
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom=${args.zoom}
      ></graph-filter-view>
    </div>
  `,
  play: async ({ canvasElement, canvas, step }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await step('Verify filter view exists', async () => {
      const filterView = canvasElement.querySelector('graph-filter-view');
      await expect(filterView).toBeTruthy();
    });

    await step('Verify search bar component exists', async () => {
      const filterView = canvasElement.querySelector('graph-filter-view');
      const searchBar = filterView?.shadowRoot?.querySelector('graph-search-bar');
      await expect(searchBar).toBeTruthy();
    });

    await step('Verify filtered stats (5/28 nodes)', async () => {
      const stats = await canvas.findByShadowText('5/28');
      await expect(stats).toBeTruthy();
    });
  },
};

export const NoPackages: Story = {
  tags: ['showcase'],
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count="20"
        total-nodes-count="20"
        filtered-edges-count="35"
        total-edges-count="35"
        .filters=${emptyFilters}
        search-query=""
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${[]}
        zoom="1.0"
      ></graph-filter-view>
    </div>
  `,
};

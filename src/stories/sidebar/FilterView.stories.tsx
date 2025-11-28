/**
 * FilterView Component Stories - Complete filter interface
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/ui/filter-view';
import type { FilterState } from '../../types/app';

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
  nodeTypes: new Set(),
  platforms: new Set(),
  projects: new Set(),
  packages: new Set(),
};

const filterPresets = {
  'No Filters': {
    filters: emptyFilters,
    filteredNodesCount: 28,
    filteredEdgesCount: 42,
  },
  'iOS Only': {
    filters: {
      nodeTypes: new Set(),
      platforms: new Set(['iOS']),
      projects: new Set(),
      packages: new Set(),
    },
    filteredNodesCount: 15,
    filteredEdgesCount: 22,
  },
  'Apps & Frameworks': {
    filters: {
      nodeTypes: new Set(['app', 'framework']),
      platforms: new Set(),
      projects: new Set(),
      packages: new Set(),
    },
    filteredNodesCount: 15,
    filteredEdgesCount: 25,
  },
  'MainApp Project': {
    filters: {
      nodeTypes: new Set(),
      platforms: new Set(),
      projects: new Set(['MainApp']),
      packages: new Set(),
    },
    filteredNodesCount: 5,
    filteredEdgesCount: 8,
  },
};

const meta = {
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filterPreset: 'No Filters',
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
};

export const WithActiveFilters: Story = {
  args: {
    filterPreset: 'Apps & Frameworks',
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
};

export const WithSearch: Story = {
  args: {
    filterPreset: 'No Filters',
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

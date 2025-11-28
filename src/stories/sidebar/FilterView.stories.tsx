/**
 * FilterView Component Stories - Complete filter interface
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components-lit/ui/filter-view';
import type { FilterState } from '../../types/app';

const meta = {
  title: 'Features/Filters/FilterView',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

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

export const Default: Story = {
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count="28"
        total-nodes-count="28"
        filtered-edges-count="42"
        total-edges-count="42"
        .filters=${emptyFilters}
        search-query=""
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom="1.0"
      ></graph-filter-view>
    </div>
  `,
};

const activeFilters: FilterState = {
  nodeTypes: new Set(['app', 'framework']),
  platforms: new Set(['iOS']),
  projects: new Set(),
  packages: new Set(),
};

export const WithActiveFilters: Story = {
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count="10"
        total-nodes-count="28"
        filtered-edges-count="15"
        total-edges-count="42"
        .filters=${activeFilters}
        search-query=""
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom="1.0"
      ></graph-filter-view>
    </div>
  `,
};

export const WithSearch: Story = {
  render: () => html`
    <div style="width: 320px; height: 600px; background: #0f0f14; border-radius: 8px; overflow: hidden">
      <graph-filter-view
        filtered-nodes-count="5"
        total-nodes-count="28"
        filtered-edges-count="8"
        total-edges-count="42"
        .filters=${emptyFilters}
        search-query="Core"
        .nodeTypeItems=${nodeTypeItems}
        .platformItems=${platformItems}
        .projectItems=${projectItems}
        .packageItems=${packageItems}
        zoom="1.0"
      ></graph-filter-view>
    </div>
  `,
};

export const NoPackages: Story = {
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

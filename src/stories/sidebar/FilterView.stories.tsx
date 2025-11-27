/**
 * FilterView Component Stories - Complete filter interface
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LitFilterView } from '../../components-lit/wrappers/FilterView';
import type { FilterState } from '../../types/app';

const meta = {
  title: 'Features/Filters/FilterView',
  component: LitFilterView,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LitFilterView>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Default: Story = {
  render: () => {
    const [filters, setFilters] = useState<FilterState>({
      nodeTypes: new Set(),
      platforms: new Set(),
      projects: new Set(),
      packages: new Set(),
    });
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
        <LitFilterView
          filteredNodesCount={28}
          totalNodesCount={28}
          filteredEdgesCount={42}
          totalEdgesCount={42}
          filters={filters}
          searchQuery={searchQuery}
          nodeTypeItems={nodeTypeItems}
          platformItems={platformItems}
          projectItems={projectItems}
          packageItems={packageItems}
          zoom={1.0}
          onFiltersChange={(e) => setFilters(e.detail.filters)}
          onSearchChange={(e) => setSearchQuery(e.detail.query)}
          onClearFilters={() => {
            setFilters({
              nodeTypes: new Set(),
              platforms: new Set(),
              projects: new Set(),
              packages: new Set(),
            });
            setSearchQuery('');
          }}
        />
      </div>
    );
  },
};

export const WithActiveFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<FilterState>({
      nodeTypes: new Set(['app', 'framework']),
      platforms: new Set(['iOS']),
      projects: new Set(),
      packages: new Set(),
    });
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
        <LitFilterView
          filteredNodesCount={10}
          totalNodesCount={28}
          filteredEdgesCount={15}
          totalEdgesCount={42}
          filters={filters}
          searchQuery={searchQuery}
          nodeTypeItems={nodeTypeItems}
          platformItems={platformItems}
          projectItems={projectItems}
          packageItems={packageItems}
          zoom={1.0}
          onFiltersChange={(e) => setFilters(e.detail.filters)}
          onSearchChange={(e) => setSearchQuery(e.detail.query)}
          onClearFilters={() => {
            setFilters({
              nodeTypes: new Set(),
              platforms: new Set(),
              projects: new Set(),
              packages: new Set(),
            });
            setSearchQuery('');
          }}
        />
      </div>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [filters, setFilters] = useState<FilterState>({
      nodeTypes: new Set(),
      platforms: new Set(),
      projects: new Set(),
      packages: new Set(),
    });
    const [searchQuery, setSearchQuery] = useState('Core');

    return (
      <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
        <LitFilterView
          filteredNodesCount={5}
          totalNodesCount={28}
          filteredEdgesCount={8}
          totalEdgesCount={42}
          filters={filters}
          searchQuery={searchQuery}
          nodeTypeItems={nodeTypeItems}
          platformItems={platformItems}
          projectItems={projectItems}
          packageItems={packageItems}
          zoom={1.0}
          onFiltersChange={(e) => setFilters(e.detail.filters)}
          onSearchChange={(e) => setSearchQuery(e.detail.query)}
          onClearFilters={() => {
            setFilters({
              nodeTypes: new Set(),
              platforms: new Set(),
              projects: new Set(),
              packages: new Set(),
            });
            setSearchQuery('');
          }}
        />
      </div>
    );
  },
};

export const NoPackages: Story = {
  render: () => {
    const [filters, setFilters] = useState<FilterState>({
      nodeTypes: new Set(),
      platforms: new Set(),
      projects: new Set(),
      packages: new Set(),
    });
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <div style={{ width: '320px', height: '600px', background: '#0f0f14', borderRadius: '8px', overflow: 'hidden' }}>
        <LitFilterView
          filteredNodesCount={20}
          totalNodesCount={20}
          filteredEdgesCount={35}
          totalEdgesCount={35}
          filters={filters}
          searchQuery={searchQuery}
          nodeTypeItems={nodeTypeItems}
          platformItems={platformItems}
          projectItems={projectItems}
          packageItems={[]}
          zoom={1.0}
          onFiltersChange={(e) => setFilters(e.detail.filters)}
          onSearchChange={(e) => setSearchQuery(e.detail.query)}
          onClearFilters={() => {
            setFilters({
              nodeTypes: new Set(),
              platforms: new Set(),
              projects: new Set(),
              packages: new Set(),
            });
            setSearchQuery('');
          }}
        />
      </div>
    );
  },
};

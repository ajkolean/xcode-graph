/**
 * Filter view component - shows all filter sections
 * All styling uses design system CSS variables
 */

import { useEffect, useRef } from 'react';
import type { FilterState } from '../../types/app';
import { LitClearFiltersButton } from '../../components-lit/wrappers/ClearFiltersButton';
import { LitEmptyState } from '../../components-lit/wrappers/EmptyState';
import { FilterSection } from './FilterSection';
import { PackagesIcon, PlatformsIcon, ProductTypesIcon, ProjectsIcon } from './icons/FilterIcons';
import {
  PackagesIcon as LitPackagesIcon,
  PlatformsIcon as LitPlatformsIcon,
  ProductTypesIcon as LitProductTypesIcon,
  ProjectsIcon as LitProjectsIcon,
} from '../../components-lit/wrappers/FilterIcons';
import { LitSearchBarElement } from '../../components-lit/wrappers/SearchBar';
import { StatsCard } from './StatsCard';
import { LitStatsCard } from '../../components-lit/wrappers/StatsCard';
import { FilterSection as LitFilterSection } from '../../components-lit/wrappers/FilterSection';

interface FilterViewProps {
  // Counts
  filteredNodesCount: number;
  totalNodesCount: number;
  filteredEdgesCount: number;
  totalEdgesCount: number;

  // Filter state
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Filter data
  nodeTypeItems: Array<{ key: string; count: number; color: string }>;
  platformItems: Array<{ key: string; count: number; color: string }>;
  projectItems: Array<{ key: string; count: number; color: string }>;
  packageItems: Array<{ key: string; count: number; color: string }>;

  // UI state
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;

  // Actions
  isFiltersActive: boolean;
  onClearFilters: () => void;

  // Preview
  zoom: number;
  onPreviewChange: (preview: { type: string; value: string } | null) => void;
}

export function FilterView({
  filteredNodesCount,
  totalNodesCount,
  filteredEdgesCount,
  totalEdgesCount,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  nodeTypeItems,
  platformItems,
  projectItems,
  packageItems,
  expandedSections,
  onToggleSection,
  isFiltersActive,
  onClearFilters,
  zoom,
  onPreviewChange,
}: FilterViewProps) {
  const searchBarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = searchBarRef.current;
    if (!node) return;

    const handleSearchChange = (event: Event) => {
      const detail = (event as CustomEvent<{ query: string }>).detail;
      onSearchChange(detail?.query ?? '');
    };

    const handleSearchClear = () => {
      onSearchChange('');
    };

    node.addEventListener('search-change', handleSearchChange as EventListener);
    node.addEventListener('search-clear', handleSearchClear as EventListener);

    return () => {
      node.removeEventListener('search-change', handleSearchChange as EventListener);
      node.removeEventListener('search-clear', handleSearchClear as EventListener);
    };
  }, [onSearchChange]);

  // Filter toggle handlers
  const handleNodeTypeToggle = (type: string, checked: boolean) => {
    const newTypes = new Set(filters.nodeTypes);
    if (checked) {
      newTypes.add(type);
    } else {
      newTypes.delete(type);
    }
    onFiltersChange({ ...filters, nodeTypes: newTypes });
  };

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    const newPlatforms = new Set(filters.platforms);
    if (checked) {
      newPlatforms.add(platform);
    } else {
      newPlatforms.delete(platform);
    }
    onFiltersChange({ ...filters, platforms: newPlatforms });
  };

  const handleProjectToggle = (project: string, checked: boolean) => {
    const newProjects = new Set(filters.projects);
    if (checked) {
      newProjects.add(project);
    } else {
      newProjects.delete(project);
    }
    onFiltersChange({ ...filters, projects: newProjects });
  };

  const handlePackageToggle = (packageName: string, checked: boolean) => {
    const newPackages = new Set(filters.packages);
    if (checked) {
      newPackages.add(packageName);
    } else {
      newPackages.delete(packageName);
    }
    onFiltersChange({ ...filters, packages: newPackages });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Stats Cards */}
      <div className="p-4 flex gap-3">
        <LitStatsCard
          label="Nodes"
          value={`${filteredNodesCount}/${totalNodesCount}`}
          highlighted={isFiltersActive}
        />
        <LitStatsCard
          label="Dependencies"
          value={`${filteredEdgesCount}/${totalEdgesCount}`}
          highlighted={isFiltersActive}
        />
      </div>

      {/* Clear Filters Button */}
      <LitClearFiltersButton
        isActive={isFiltersActive || !!searchQuery}
        onClearFilters={() => {
          onClearFilters();
          onSearchChange('');
        }}
      />

      {/* Search Bar */}
      <LitSearchBarElement
        ref={searchBarRef}
        searchQuery={searchQuery}
        onSearchChange={(e) => onSearchChange(e.detail.query)}
        onSearchClear={() => onSearchChange('')}
      />

      {/* Filter Content */}
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 px-4 py-6">
          {/* Product Types */}
          <LitFilterSection
            id="productTypes"
            title="Product Types"
            icon={<LitProductTypesIcon />}
            isExpanded={expandedSections.productTypes}
            onSectionToggle={() => onToggleSection('productTypes')}
            items={nodeTypeItems}
            selectedItems={filters.nodeTypes}
            onItemToggle={(e) => handleNodeTypeToggle(e.detail.key, e.detail.checked)}
            filterType="nodeType"
            zoom={zoom}
            onPreviewChange={onPreviewChange}
          />

          {/* Section Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              margin: '24px -4px 0 -4px',
            }}
          />

          {/* Platforms */}
          <LitFilterSection
            id="platforms"
            title="Platforms"
            icon={<LitPlatformsIcon />}
            isExpanded={expandedSections.platforms}
            onSectionToggle={() => onToggleSection('platforms')}
            items={platformItems}
            selectedItems={filters.platforms}
            onItemToggle={(e) => handlePlatformToggle(e.detail.key, e.detail.checked)}
            filterType="platform"
            zoom={zoom}
            onPreviewChange={onPreviewChange}
          />

          {/* Section Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              margin: '24px -4px 0 -4px',
            }}
          />

          {/* Projects */}
          <LitFilterSection
            id="projects"
            title="Projects"
            icon={<LitProjectsIcon />}
            isExpanded={expandedSections.projects}
            onSectionToggle={() => onToggleSection('projects')}
            items={projectItems}
            selectedItems={filters.projects}
            onItemToggle={(e) => handleProjectToggle(e.detail.key, e.detail.checked)}
            filterType="project"
            zoom={zoom}
            onPreviewChange={onPreviewChange}
          />

          {/* Section Divider (only if packages exist) */}
          {packageItems.length > 0 && (
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                margin: '24px -4px 0 -4px',
              }}
            />
          )}

          {/* Packages */}
          {packageItems.length > 0 && (
            <LitFilterSection
              id="packages"
              title="Packages"
              icon={<LitPackagesIcon />}
              isExpanded={expandedSections.packages}
              onSectionToggle={() => onToggleSection('packages')}
              items={packageItems}
              selectedItems={filters.packages}
              onItemToggle={(e) => handlePackageToggle(e.detail.key, e.detail.checked)}
              filterType="package"
              zoom={zoom}
              onPreviewChange={onPreviewChange}
            />
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredNodesCount === 0 && (
        <LitEmptyState hasActiveFilters={isFiltersActive} onClearFilters={onClearFilters} />
      )}
    </div>
  );
}

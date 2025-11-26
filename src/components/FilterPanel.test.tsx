import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FilterState } from '../types/app';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
  const createDefaultFilters = (): FilterState => ({
    nodeTypes: new Set(['app', 'framework', 'library']),
    platforms: new Set(['iOS', 'macOS']),
    origins: new Set(['local', 'external']),
    projects: new Set(['TuistCore']),
    packages: new Set(),
  });

  describe('rendering', () => {
    it('should render the filter panel', () => {
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render node type section', () => {
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Target Type')).toBeInTheDocument();
      expect(screen.getByText('App Targets')).toBeInTheDocument();
      expect(screen.getByText('Frameworks')).toBeInTheDocument();
    });

    it('should render platform section', () => {
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Platform')).toBeInTheDocument();
      expect(screen.getByText('iOS')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
    });

    it('should render origin section', () => {
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Origin')).toBeInTheDocument();
      expect(screen.getByText('Local Projects')).toBeInTheDocument();
      // "External Packages" appears in both Origin section and Node Types section
      expect(screen.getAllByText('External Packages').length).toBeGreaterThanOrEqual(1);
    });

    it('should render reset button', () => {
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Reset All Filters')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <FilterPanel
          filters={createDefaultFilters()}
          onFiltersChange={vi.fn()}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should toggle node type when checkbox is clicked', () => {
      const onFiltersChange = vi.fn();
      const filters = createDefaultFilters();

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={vi.fn()}
        />
      );

      const appCheckbox = screen.getByLabelText('App Targets');
      fireEvent.click(appCheckbox);

      expect(onFiltersChange).toHaveBeenCalled();
      const newFilters = onFiltersChange.mock.calls[0][0];
      expect(newFilters.nodeTypes.has('app')).toBe(false);
    });

    it('should toggle platform when checkbox is clicked', () => {
      const onFiltersChange = vi.fn();
      const filters = createDefaultFilters();

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={vi.fn()}
        />
      );

      const iosCheckbox = screen.getByLabelText('iOS');
      fireEvent.click(iosCheckbox);

      expect(onFiltersChange).toHaveBeenCalled();
      const newFilters = onFiltersChange.mock.calls[0][0];
      expect(newFilters.platforms.has('iOS')).toBe(false);
    });

    it('should toggle origin when checkbox is clicked', () => {
      const onFiltersChange = vi.fn();
      const filters = createDefaultFilters();

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={vi.fn()}
        />
      );

      const localCheckbox = screen.getByLabelText('Local Projects');
      fireEvent.click(localCheckbox);

      expect(onFiltersChange).toHaveBeenCalled();
      const newFilters = onFiltersChange.mock.calls[0][0];
      expect(newFilters.origins.has('local')).toBe(false);
    });

    it('should reset all filters when reset button is clicked', () => {
      const onFiltersChange = vi.fn();
      const filters: FilterState = {
        nodeTypes: new Set(['app']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(),
        packages: new Set(),
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={vi.fn()}
        />
      );

      const resetButton = screen.getByText('Reset All Filters');
      fireEvent.click(resetButton);

      expect(onFiltersChange).toHaveBeenCalled();
      const newFilters = onFiltersChange.mock.calls[0][0];
      // Reset should include all node types
      expect(newFilters.nodeTypes.size).toBe(7);
      expect(newFilters.platforms.size).toBe(5);
      expect(newFilters.origins.size).toBe(2);
    });
  });

  describe('checkbox states', () => {
    it('should show checked state for active filters', () => {
      const filters: FilterState = {
        nodeTypes: new Set(['app', 'framework']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(),
        packages: new Set(),
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const appCheckbox = screen.getByLabelText('App Targets') as HTMLInputElement;
      const frameworkCheckbox = screen.getByLabelText('Frameworks') as HTMLInputElement;
      const libraryCheckbox = screen.getByLabelText('Static Libraries') as HTMLInputElement;

      expect(appCheckbox.checked).toBe(true);
      expect(frameworkCheckbox.checked).toBe(true);
      expect(libraryCheckbox.checked).toBe(false);
    });

    it('should add filter when unchecked checkbox is clicked', () => {
      const onFiltersChange = vi.fn();
      const filters: FilterState = {
        nodeTypes: new Set(['app']),
        platforms: new Set(['iOS']),
        origins: new Set(['local']),
        projects: new Set(),
        packages: new Set(),
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClose={vi.fn()}
        />
      );

      const frameworkCheckbox = screen.getByLabelText('Frameworks');
      fireEvent.click(frameworkCheckbox);

      expect(onFiltersChange).toHaveBeenCalled();
      const newFilters = onFiltersChange.mock.calls[0][0];
      expect(newFilters.nodeTypes.has('framework')).toBe(true);
    });
  });
});

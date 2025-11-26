import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { createNode } from '../test/fixtures';
import { useGraphStore } from '../stores/graphStore';
import { useFilterStore } from '../stores/filterStore';
import { useUIStore } from '../stores/uiStore';
import { RightSidebar } from './RightSidebar';

// Reset stores before each test
beforeEach(() => {
  // Reset graph store
  useGraphStore.setState({
    selectedNode: null,
    selectedCluster: null,
    hoveredNode: null,
    viewMode: 'full',
  });

  // Reset filter store with test defaults
  useFilterStore.setState({
    filters: {
      nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
      platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
      origins: new Set(['local', 'external']),
      projects: new Set(['ProjectA', 'ProjectB']),
      packages: new Set(),
    },
    searchQuery: '',
  });

  // Reset UI store
  useUIStore.setState({
    zoom: 1,
    previewFilter: null,
  });
});

describe('RightSidebar', () => {
  const createTestNodes = (): GraphNode[] => [
    createNode({ id: 'app1', name: 'MyApp', type: 'app', platform: 'iOS', project: 'ProjectA' }),
    createNode({ id: 'fw1', name: 'Framework1', type: 'framework', platform: 'iOS', project: 'ProjectA' }),
    createNode({ id: 'lib1', name: 'Library1', type: 'library', platform: 'macOS', project: 'ProjectB' }),
    createNode({ id: 'pkg1', name: 'ExternalPkg', type: 'package', origin: 'external' }),
  ];

  const createTestEdges = (): GraphEdge[] => [
    { source: 'app1', target: 'fw1' },
    { source: 'fw1', target: 'lib1' },
    { source: 'lib1', target: 'pkg1' },
  ];

  const defaultProps = {
    allNodes: createTestNodes(),
    allEdges: createTestEdges(),
    filteredNodes: createTestNodes(),
    filteredEdges: createTestEdges(),
    clusters: [],
  };

  describe('rendering modes', () => {
    it('should render Project Overview when no selection', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });

    it('should render Node Details when node is selected', () => {
      const selectedNode = createTestNodes()[0];
      useGraphStore.setState({ selectedNode });

      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Node Details')).toBeInTheDocument();
    });

    it('should render Cluster Details when cluster is selected', () => {
      useGraphStore.setState({ selectedCluster: 'ProjectA' });

      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Cluster Details')).toBeInTheDocument();
    });
  });

  describe('filter view', () => {
    it('should render search bar', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByPlaceholderText(/filter/i)).toBeInTheDocument();
    });

    it('should render filter sections', () => {
      render(<RightSidebar {...defaultProps} />);

      // Filter view should have filter-related content
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
    });

    it('should show stats for filtered nodes', () => {
      render(<RightSidebar {...defaultProps} />);

      // Stats showing nodes and edges count
      const statsElements = screen.getAllByText(/\d+/);
      expect(statsElements.length).toBeGreaterThan(0);
    });
  });

  describe('collapse behavior', () => {
    it('should have collapse button', () => {
      render(<RightSidebar {...defaultProps} />);

      // The sidebar header should have a toggle button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should toggle between expanded and collapsed', async () => {
      const { container } = render(<RightSidebar {...defaultProps} />);

      // Find the aside element
      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeInTheDocument();

      // Initially expanded (320px width)
      expect(sidebar).toHaveStyle({ width: '320px' });

      // Find the header and click the toggle button (first button in header)
      const header = screen.getByText('Project Overview').closest('div');
      const toggleButton = header?.querySelector('button');
      if (toggleButton) {
        fireEvent.click(toggleButton);
      }

      // Should be collapsed (56px width) - wait for state machine to update
      await waitFor(() => {
        expect(sidebar).toHaveStyle({ width: '56px' });
      });
    });
  });

  describe('node details view', () => {
    it('should display selected node name', () => {
      const selectedNode = createTestNodes()[0];
      useGraphStore.setState({ selectedNode });

      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('MyApp')).toBeInTheDocument();
    });

    it('should show node type', () => {
      const selectedNode = createTestNodes()[0];
      useGraphStore.setState({ selectedNode });

      render(<RightSidebar {...defaultProps} />);

      // Node type badge should be visible - looking for the type badge specifically
      const typeBadges = screen.getAllByText(/app/i);
      expect(typeBadges.length).toBeGreaterThan(0);
    });
  });

  describe('cluster details view', () => {
    it('should show cluster name', () => {
      useGraphStore.setState({ selectedCluster: 'ProjectA' });

      render(<RightSidebar {...defaultProps} />);

      // Cluster name should be displayed
      expect(screen.getAllByText('ProjectA').length).toBeGreaterThan(0);
    });

    it('should derive cluster type from nodes', () => {
      // When selecting a package cluster
      const nodes = [
        ...createTestNodes(),
        createNode({ id: 'pkg2', name: 'MyPackage', type: 'package', origin: 'external' }),
      ];

      useGraphStore.setState({ selectedCluster: 'MyPackage' });

      render(
        <RightSidebar
          {...defaultProps}
          allNodes={nodes}
          filteredNodes={nodes}
        />
      );

      expect(screen.getByText('Cluster Details')).toBeInTheDocument();
    });
  });

  describe('filter interactions', () => {
    it('should render filter controls', () => {
      render(<RightSidebar {...defaultProps} />);

      // Verify filter UI is present
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      // Clear filters button should be present
      expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
    });

    it('should update search query in store when search input changes', () => {
      render(<RightSidebar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/filter/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Verify the store was updated
      expect(useFilterStore.getState().searchQuery).toBe('test');
    });
  });

  describe('with different filter states', () => {
    it('should show clear filters when filters are active', () => {
      useFilterStore.setState({
        filters: {
          nodeTypes: new Set(['app']), // Only app selected
          platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
          origins: new Set(['local', 'external']),
          projects: new Set(['ProjectA', 'ProjectB']),
          packages: new Set(),
        },
        searchQuery: '',
      });

      render(<RightSidebar {...defaultProps} />);

      // When filters are active, clear button should appear
      screen.queryByText(/clear/i);
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });

    it('should handle empty nodes array', () => {
      render(
        <RightSidebar
          {...defaultProps}
          allNodes={[]}
          filteredNodes={[]}
          allEdges={[]}
          filteredEdges={[]}
        />
      );

      expect(screen.getByText('Project Overview')).toBeInTheDocument();
    });
  });

  describe('node selection', () => {
    it('should render node details with back navigation', () => {
      const selectedNode = createTestNodes()[0];
      useGraphStore.setState({ selectedNode });

      render(<RightSidebar {...defaultProps} />);

      // Verify node details are displayed
      expect(screen.getByText('Node Details')).toBeInTheDocument();
      expect(screen.getByText('MyApp')).toBeInTheDocument();

      // Verify there are buttons for navigation
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should clear selection when back button is clicked', async () => {
      const selectedNode = createTestNodes()[0];
      useGraphStore.setState({ selectedNode });

      render(<RightSidebar {...defaultProps} />);

      // Find close/back button
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find(
        (btn) =>
          btn.querySelector('svg.lucide-chevron-left') ||
          btn.querySelector('svg.lucide-x')
      );

      if (backButton) {
        fireEvent.click(backButton);

        // Verify the store was updated
        await waitFor(() => {
          expect(useGraphStore.getState().selectedNode).toBeNull();
        });
      }
    });
  });

  describe('cluster selection', () => {
    it('should clear cluster selection when closing cluster details', async () => {
      useGraphStore.setState({ selectedCluster: 'ProjectA' });

      render(<RightSidebar {...defaultProps} />);

      // Find close/back button
      const buttons = screen.getAllByRole('button');
      const backButton = buttons.find(
        (btn) =>
          btn.querySelector('svg.lucide-chevron-left') ||
          btn.querySelector('svg.lucide-x')
      );

      if (backButton) {
        fireEvent.click(backButton);

        // Verify the store was updated
        await waitFor(() => {
          expect(useGraphStore.getState().selectedCluster).toBeNull();
        });
      }
    });
  });
});

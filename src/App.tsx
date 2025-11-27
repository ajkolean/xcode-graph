/**
 * Main application component
 * Refactored to use modular hooks and components
 * All styling uses design system CSS variables
 * State managed via Zustand stores
 */

import { useEffect, useMemo } from 'react';
import { GraphTab } from './components/layout/GraphTab';
import { Header } from './components/layout/Header';
import { Header as LitHeader } from './components-lit/wrappers/Header';
import { PlaceholderTab } from './components/layout/PlaceholderTab';
import { PlaceholderTab as LitPlaceholderTab } from './components-lit/wrappers/PlaceholderTab';
import { Sidebar } from './components/layout/Sidebar';
import { Sidebar as LitSidebar } from './components-lit/wrappers/Sidebar';
import { mockGraphData } from './data/mockGraphData';
import { useGraphFilters } from './hooks/useGraphFilters';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTransitiveDependencies } from './hooks/useTransitiveDependencies';
import { useGraphStore } from './stores/graphStore';
import { useFilterStore } from './stores/filterStore';
import { useUIStore, type ActiveTab } from './stores/uiStore';

import { Benchmark } from './test/Benchmark';

// Get all unique projects and packages from data
const allProjects = new Set(
  mockGraphData.nodes.map((n) => n.project).filter((p): p is string => p !== undefined && p !== ''),
);

const allPackages = new Set(
  mockGraphData.nodes.filter((n) => n.type === 'package').map((n) => n.name),
);

const TAB_LABELS: Record<ActiveTab, string> = {
  overview: 'Overview',
  builds: 'Builds',
  'test-runs': 'Test Runs',
  'module-cache': 'Module Cache',
  'xcode-cache': 'Xcode Cache',
  previews: 'Previews',
  qa: 'QA',
  bundles: 'Bundles',
  graph: 'Graph',
};

export default function App() {
  // Graph store - only what App needs for computed values
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const viewMode = useGraphStore((s) => s.viewMode);
  const resetView = useGraphStore((s) => s.resetView);

  // Filter store - only what App needs for computed values
  const filters = useFilterStore((s) => s.filters);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const initializeFromData = useFilterStore((s) => s.initializeFromData);

  // UI store
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const resetZoom = useUIStore((s) => s.resetZoom);

  // Initialize filter store with data on mount
  useEffect(() => {
    initializeFromData(allProjects, allPackages);
  }, [initializeFromData]);

  // Custom hooks for logic extraction
  const { filteredNodes, filteredEdges } = useGraphFilters({
    nodes: mockGraphData.nodes,
    edges: mockGraphData.edges,
    filters,
    searchQuery,
  });

  const { transitiveDeps, transitiveDependents } = useTransitiveDependencies({
    viewMode,
    selectedNode,
    edges: mockGraphData.edges,
  });

  useKeyboardShortcuts({
    onCloseNode: resetView,
    onResetView: () => {
      resetView();
      resetZoom();
    },
  });

  // Display filtering based on view mode
  const displayNodes = useMemo(() => {
    if (viewMode === 'focused' && selectedNode) {
      return filteredNodes.filter((node) => transitiveDeps.nodes.has(node.id));
    } else if (viewMode === 'dependents' && selectedNode) {
      return filteredNodes.filter((node) => transitiveDependents.nodes.has(node.id));
    } else if (viewMode === 'both' && selectedNode) {
      // Show both dependencies AND dependents
      return filteredNodes.filter(
        (node) => transitiveDeps.nodes.has(node.id) || transitiveDependents.nodes.has(node.id),
      );
    }
    return filteredNodes;
  }, [viewMode, selectedNode, filteredNodes, transitiveDeps, transitiveDependents]);

  const displayEdges = useMemo(() => {
    if (viewMode === 'focused' && selectedNode) {
      return filteredEdges.filter((edge) =>
        transitiveDeps.edges.has(`${edge.source}->${edge.target}`),
      );
    } else if (viewMode === 'dependents' && selectedNode) {
      return filteredEdges.filter((edge) =>
        transitiveDependents.edges.has(`${edge.source}->${edge.target}`),
      );
    } else if (viewMode === 'both' && selectedNode) {
      // Show both dependency AND dependent edges
      return filteredEdges.filter(
        (edge) =>
          transitiveDeps.edges.has(`${edge.source}->${edge.target}`) ||
          transitiveDependents.edges.has(`${edge.source}->${edge.target}`),
      );
    }
    return filteredEdges;
  }, [viewMode, selectedNode, filteredEdges, transitiveDeps, transitiveDependents]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Top Header - spans full width */}
      <LitHeader />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative" style={{ zIndex: 20 }}>
        {/* Left Sidebar */}
        <LitSidebar activeTab={activeTab} onTabChange={(e) => setActiveTab(e.detail.tab)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Content */}
          {activeTab === 'graph' ? (
            <GraphTab
              displayNodes={displayNodes}
              displayEdges={displayEdges}
              filteredNodes={filteredNodes}
              filteredEdges={filteredEdges}
              allNodes={mockGraphData.nodes}
              allEdges={mockGraphData.edges}
              transitiveDeps={transitiveDeps}
              transitiveDependents={transitiveDependents}
            />
          ) : activeTab === 'qa' ? (
            <Benchmark />
          ) : (
            <LitPlaceholderTab title={TAB_LABELS[activeTab]} />
          )}
        </div>
      </div>
    </div>
  );
}

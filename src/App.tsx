/**
 * Main application component
 * Refactored to use modular hooks and components
 * All styling uses design system CSS variables
 */

import { useMemo, useState } from 'react';
import { GraphTab } from './components/layout/GraphTab';
import { Header } from './components/layout/Header';
import { PlaceholderTab } from './components/layout/PlaceholderTab';
import { type ActiveTab, Sidebar } from './components/layout/Sidebar';
import { type GraphNode, mockGraphData } from './data/mockGraphData';
import { useGraphFilters } from './hooks/useGraphFilters';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTransitiveDependencies } from './hooks/useTransitiveDependencies';
import type { FilterState, ViewMode } from './types/app';

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
  // State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('graph');
  const [enableAnimation, setEnableAnimation] = useState(false); // Space ballet animation
  const [previewFilter, setPreviewFilter] = useState<{
    type: 'nodeType' | 'platform' | 'origin' | 'project' | 'package' | 'cluster';
    value: string;
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: new Set(['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package']),
    platforms: new Set(['iOS', 'macOS', 'visionOS', 'tvOS', 'watchOS']),
    origins: new Set(['local', 'external']),
    projects: allProjects,
    packages: allPackages,
  });

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
    onCloseNode: () => {
      setSelectedNode(null);
      setSelectedCluster(null);
    },
    onResetView: () => {
      setViewMode('full');
      setZoom(1);
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

  // Handlers
  const handleNodeSelect = (node: GraphNode | null) => {
    setSelectedNode(node);
    setSelectedCluster(null); // Clear cluster when selecting a node
    if (node) {
      setViewMode('full');
    }
  };

  const handleClusterSelect = (clusterId: string | null) => {
    setSelectedCluster(clusterId);
    setSelectedNode(null); // Clear node when selecting a cluster
    if (clusterId) {
      setViewMode('full');
    }
  };

  const handleFocusNode = (node: GraphNode) => {
    setSelectedNode(node);
    // Toggle: focused -> both -> full
    if (viewMode === 'focused' && selectedNode?.id === node.id) {
      setViewMode('full');
    } else if (viewMode === 'both' && selectedNode?.id === node.id) {
      setViewMode('dependents'); // Keep dependents on
    } else if (viewMode === 'dependents') {
      setViewMode('both'); // Turn both on
    } else {
      setViewMode('focused');
    }
  };

  const handleShowDependents = (node: GraphNode) => {
    setSelectedNode(node);
    // Toggle: dependents -> both -> full
    if (viewMode === 'dependents' && selectedNode?.id === node.id) {
      setViewMode('full');
    } else if (viewMode === 'both' && selectedNode?.id === node.id) {
      setViewMode('focused'); // Keep dependencies on
    } else if (viewMode === 'focused') {
      setViewMode('both'); // Turn both on
    } else {
      setViewMode('dependents');
    }
  };

  const handleShowImpact = (node: GraphNode) => {
    setSelectedNode(node);
    setViewMode('impact');
  };

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
      <Header />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative" style={{ zIndex: 20 }}>
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
              selectedNode={selectedNode}
              selectedCluster={selectedCluster}
              hoveredNode={hoveredNode}
              searchQuery={searchQuery}
              viewMode={viewMode}
              zoom={zoom}
              filters={filters}
              onNodeSelect={handleNodeSelect}
              onClusterSelect={handleClusterSelect}
              onNodeHover={setHoveredNode}
              onFocusNode={handleFocusNode}
              onShowDependents={handleShowDependents}
              onShowImpact={handleShowImpact}
              onZoomIn={() => setZoom(Math.min(2, zoom + 0.1))}
              onZoomOut={() => setZoom(Math.max(0.2, zoom - 0.1))}
              onZoomReset={() => setZoom(1)}
              onFiltersChange={setFilters}
              onSearchChange={setSearchQuery}
              transitiveDeps={transitiveDeps}
              transitiveDependents={transitiveDependents}
              enableAnimation={enableAnimation}
              onToggleAnimation={setEnableAnimation}
              previewFilter={previewFilter}
              onPreviewFilterChange={setPreviewFilter}
            />
          ) : (
            <PlaceholderTab title={TAB_LABELS[activeTab]} />
          )}
        </div>
      </div>
    </div>
  );
}

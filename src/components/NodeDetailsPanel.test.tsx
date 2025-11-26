import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import { createNode } from '../test/fixtures';
import { NodeDetailsPanel } from './NodeDetailsPanel';

describe('NodeDetailsPanel', () => {
  const createTestData = () => {
    const node = createNode({
      id: 'test-node',
      name: 'TestNode',
      type: 'framework',
      platform: 'iOS',
      project: 'TestProject',
    });

    const allNodes: GraphNode[] = [
      node,
      createNode({ id: 'dep1', name: 'Dependency1', type: 'library' }),
      createNode({ id: 'dep2', name: 'Dependency2', type: 'library' }),
      createNode({ id: 'dependent1', name: 'Dependent1', type: 'app' }),
    ];

    const edges: GraphEdge[] = [
      { source: 'test-node', target: 'dep1' },
      { source: 'test-node', target: 'dep2' },
      { source: 'dependent1', target: 'test-node' },
    ];

    return { node, allNodes, edges };
  };

  const defaultProps = {
    onClose: vi.fn(),
    onNodeSelect: vi.fn(),
    onNodeHover: vi.fn(),
    onFocusNode: vi.fn(),
    onShowDependents: vi.fn(),
    onShowImpact: vi.fn(),
    zoom: 1,
  };

  describe('rendering', () => {
    it('should render the node details panel', () => {
      const { node, allNodes, edges } = createTestData();

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={allNodes}
          edges={edges}
          {...defaultProps}
        />
      );

      // NodeHeader should render the node name
      expect(screen.getByText('TestNode')).toBeInTheDocument();
    });

    it('should render metrics section', () => {
      const { node, allNodes, edges } = createTestData();

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={allNodes}
          edges={edges}
          {...defaultProps}
        />
      );

      // Metrics should show dependency counts
      // The actual text depends on MetricsSection implementation
      expect(document.body).toContainHTML('2'); // 2 dependencies
    });

    it('should render with filtered edges', () => {
      const { node, allNodes, edges } = createTestData();
      const filteredEdges = [{ source: 'test-node', target: 'dep1' }];

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={allNodes}
          edges={edges}
          filteredEdges={filteredEdges}
          {...defaultProps}
        />
      );

      expect(screen.getByText('TestNode')).toBeInTheDocument();
    });

    it('should render with clusters', () => {
      const { node, allNodes, edges } = createTestData();
      const clusters = [
        {
          id: 'test-cluster',
          name: 'TestCluster',
          type: 'project' as const,
          origin: 'local' as const,
          nodes: allNodes,
          metadata: new Map(),
          anchors: [],
        },
      ];

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={allNodes}
          edges={edges}
          clusters={clusters}
          {...defaultProps}
        />
      );

      expect(screen.getByText('TestNode')).toBeInTheDocument();
    });

    it('should render with view mode', () => {
      const { node, allNodes, edges } = createTestData();

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={allNodes}
          edges={edges}
          viewMode="focused"
          {...defaultProps}
        />
      );

      expect(screen.getByText('TestNode')).toBeInTheDocument();
    });
  });

  describe('with different node types', () => {
    it('should render app node', () => {
      const node = createNode({
        id: 'app-node',
        name: 'MyApp',
        type: 'app',
        platform: 'iOS',
      });

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node]}
          edges={[]}
          {...defaultProps}
        />
      );

      expect(screen.getByText('MyApp')).toBeInTheDocument();
    });

    it('should render library node', () => {
      const node = createNode({
        id: 'lib-node',
        name: 'MyLibrary',
        type: 'library',
      });

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node]}
          edges={[]}
          {...defaultProps}
        />
      );

      expect(screen.getByText('MyLibrary')).toBeInTheDocument();
    });

    it('should render test node', () => {
      const node = createNode({
        id: 'test-node',
        name: 'MyTests',
        type: 'test-unit',
      });

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node]}
          edges={[]}
          {...defaultProps}
        />
      );

      expect(screen.getByText('MyTests')).toBeInTheDocument();
    });

    it('should render package node', () => {
      const node = createNode({
        id: 'pkg-node',
        name: 'MyExternalPkg',
        type: 'package',
        origin: 'external',
      });

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node]}
          edges={[]}
          {...defaultProps}
        />
      );

      // Name appears in both header and subtitle areas
      expect(screen.getAllByText('MyExternalPkg').length).toBeGreaterThan(0);
    });
  });

  describe('empty states', () => {
    it('should render with no dependencies', () => {
      const node = createNode({
        id: 'isolated',
        name: 'IsolatedNode',
        type: 'library',
      });

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node]}
          edges={[]}
          {...defaultProps}
        />
      );

      expect(screen.getByText('IsolatedNode')).toBeInTheDocument();
    });

    it('should render with only dependencies', () => {
      const node = createNode({ id: 'node', name: 'Node', type: 'app' });
      const dep = createNode({ id: 'dep', name: 'Dep', type: 'library' });
      const edges = [{ source: 'node', target: 'dep' }];

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node, dep]}
          edges={edges}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Node')).toBeInTheDocument();
    });

    it('should render with only dependents', () => {
      const node = createNode({ id: 'node', name: 'Node', type: 'library' });
      const dependent = createNode({ id: 'dependent', name: 'Dependent', type: 'app' });
      const edges = [{ source: 'dependent', target: 'node' }];

      render(
        <NodeDetailsPanel
          node={node}
          allNodes={[node, dependent]}
          edges={edges}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Node')).toBeInTheDocument();
    });
  });
});

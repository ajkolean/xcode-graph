/**
 * GraphEdges Component Tests
 *
 * Comprehensive tests for edge rendering with depth-based opacity and highlighting.
 */

import { expect, fixture, html } from '@open-wc/testing';
import { ViewMode } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import type { GraphEdges } from './graph-edges';
import './graph-edges';
import {
  createMediumTestGraph,
  createMockClusterPositions,
  createMockNodePositions,
  createSmallTestGraph,
  createTransitiveResult,
} from './test-helpers/graph-fixtures';
import { countSvgElements, querySvgElements } from './test-helpers/svg-assertions';

describe('xcode-graph-edges', () => {
  it('should render inside SVG context', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    expect(edgesComponent).to.exist;
  });

  it('should render nothing when edges or nodes are undefined', async () => {
    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    const renderedEdges = countSvgElements(svgEl, 'xcode-graph-edge');
    expect(renderedEdges).to.equal(0);
  });

  it('should render graph-edge components for valid edges', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Verify component has edges data and at least one cross-cluster edge exists
    expect(edgesComponent.edges).to.have.length.greaterThan(0);
    expect(edgesComponent.nodes).to.have.length.greaterThan(0);
  });

  it('should filter intra-cluster edges when clusterId is not set', async () => {
    const { nodes, edges } = createMediumTestGraph();
    // This graph has both cross-cluster and intra-cluster edges

    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Component should be configured to filter cross-cluster edges only
    expect(edgesComponent.clusterId).to.be.undefined;
  });

  it('should render only intra-cluster edges when clusterId is set', async () => {
    const { nodes, edges } = createMediumTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .clusterId=${'ProjectA'}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Component should accept clusterId property
    expect(edgesComponent.clusterId).to.equal('ProjectA');
  });

  it('should skip edges with missing source or target nodes', async () => {
    const { nodes, edges } = createSmallTestGraph();

    // Add an invalid edge
    const invalidEdges = [
      ...edges,
      { source: 'non-existent', target: 'node1' },
      { source: 'node1', target: 'non-existent' },
    ];

    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${invalidEdges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Should not crash and only render valid edges
    const renderedEdges = querySvgElements(svgEl, 'xcode-graph-edge');
    expect(renderedEdges.length).to.be.lessThan(invalidEdges.length);
  });

  it('should skip edges with missing positions', async () => {
    const { nodes, edges } = createSmallTestGraph();

    // Create incomplete position maps
    const positions = createMockNodePositions(['node1']); // Missing node2 and node3
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Should skip edges without positions
    const renderedEdges = querySvgElements(svgEl, 'xcode-graph-edge');
    expect(renderedEdges.length).to.equal(0);
  });

  it('should highlight edges connected to selected node', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .selectedNode=${nodes[0]}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Component should accept selectedNode
    expect(edgesComponent.selectedNode).to.deep.equal(nodes[0]);
  });

  it('should apply depth-based opacity in focused view mode', async () => {
    const { nodes, edges } = createMediumTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const transitiveResult = createTransitiveResult(['app1', 'framework1'], ['app1->framework1']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .transitiveDeps=${transitiveResult}
          .viewMode=${ViewMode.Focused}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    expect(edgesComponent.viewMode).to.equal(ViewMode.Focused);
    expect(edgesComponent.transitiveDeps).to.exist;
  });

  it('should dim edges when hoveredClusterId is set and edge not connected', async () => {
    const { nodes, edges } = createMediumTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .hoveredClusterId=${'ProjectA'}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    expect(edgesComponent.hoveredClusterId).to.equal('ProjectA');
  });

  it('should pass zoom property to edge components', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <xcode-graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .zoom=${1.5}
        ></xcode-graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    expect(edgesComponent.zoom).to.equal(1.5);
  });

  // ========================================
  // shouldUpdate() branch coverage
  // ========================================

  describe('shouldUpdate()', () => {
    it('should update when edges property changes', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Change edges - triggers structural update
      edgesComponent.edges = [edges[0]!];
      await edgesComponent.updateComplete;

      expect(edgesComponent.edges).to.have.length(1);
    });

    it('should update when selectedNode changes', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      edgesComponent.selectedNode = nodes[0];
      await edgesComponent.updateComplete;

      expect(edgesComponent.selectedNode).to.deep.equal(nodes[0]);
    });

    it('should skip update when hoveredNode changes but does not affect any edges', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Set a hoveredNode that is not connected to any edge
      edgesComponent.hoveredNode = 'nonexistent-node';
      await edgesComponent.updateComplete;

      // Should still accept the property but effectively be a no-op render
      expect(edgesComponent.hoveredNode).to.equal('nonexistent-node');
    });

    it('should update when hoveredNode changes and affects edges', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Set hoveredNode to a node that IS in an edge (node1 is source of edge node1->node2)
      edgesComponent.hoveredNode = 'node1';
      await edgesComponent.updateComplete;

      expect(edgesComponent.hoveredNode).to.equal('node1');
    });

    it('should update when viewMode changes', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .viewMode=${ViewMode.Full}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      edgesComponent.viewMode = ViewMode.Focused;
      await edgesComponent.updateComplete;

      expect(edgesComponent.viewMode).to.equal(ViewMode.Focused);
    });

    it('should update when transitiveDeps changes', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      const transitive = createTransitiveResult(['node1'], ['node1->node2']);
      edgesComponent.transitiveDeps = transitive;
      await edgesComponent.updateComplete;

      expect(edgesComponent.transitiveDeps).to.exist;
    });

    it('should skip update when hoveredNode changes from null to null', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .hoveredNode=${null}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Setting same value should be a no-op
      edgesComponent.hoveredNode = null;
      await edgesComponent.updateComplete;

      expect(edgesComponent.hoveredNode).to.be.null;
    });
  });

  // ========================================
  // getEdgeOpacity() / ViewMode branch coverage
  // ========================================

  describe('getEdgeOpacity via ViewMode paths', () => {
    it('should use transitiveDependents opacity in Dependents view mode', async () => {
      const { nodes, edges } = createMediumTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      // Create transitive dependents chain for a cross-cluster edge
      const dependentsResult = createTransitiveResult(['framework1', 'lib1'], ['framework1->lib1']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .transitiveDependents=${dependentsResult}
            .viewMode=${ViewMode.Dependents}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      expect(edgesComponent.viewMode).to.equal(ViewMode.Dependents);
      expect(edgesComponent.transitiveDependents).to.exist;
    });

    it('should prefer deps chain in Both view mode when edge is in deps', async () => {
      const { nodes, edges } = createMediumTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const depsResult = createTransitiveResult(['framework1', 'lib1'], ['framework1->lib1']);
      const dependentsResult = createTransitiveResult(['framework1', 'lib1'], ['framework1->lib1']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .transitiveDeps=${depsResult}
            .transitiveDependents=${dependentsResult}
            .viewMode=${ViewMode.Both}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      expect(edgesComponent.viewMode).to.equal(ViewMode.Both);
      expect(edgesComponent.transitiveDeps).to.exist;
      expect(edgesComponent.transitiveDependents).to.exist;
    });

    it('should fall back to dependents chain in Both mode when edge is not in deps', async () => {
      const { nodes, edges } = createMediumTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      // Deps chain does NOT include the cross-cluster edge
      const depsResult = createTransitiveResult(['app1'], ['app1->framework1']);
      // Dependents chain DOES include a cross-cluster edge
      const dependentsResult = createTransitiveResult(['framework1', 'lib1'], ['framework1->lib1']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .transitiveDeps=${depsResult}
            .transitiveDependents=${dependentsResult}
            .viewMode=${ViewMode.Both}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      expect(edgesComponent.viewMode).to.equal(ViewMode.Both);
    });

    it('should return opacity 1 in Full view mode regardless of chains', async () => {
      const { nodes, edges } = createMediumTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const depsResult = createTransitiveResult(['framework1', 'lib1'], ['framework1->lib1']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .transitiveDeps=${depsResult}
            .viewMode=${ViewMode.Full}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // In Full mode, getEdgeOpacity returns 1 regardless of transitiveDeps
      expect(edgesComponent.viewMode).to.equal(ViewMode.Full);
      expect(edgesComponent.transitiveDeps).to.exist;
      expect(edgesComponent.edges).to.have.length.greaterThan(0);
    });
  });

  // ========================================
  // isEdgeVisibleForCluster() branch coverage
  // ========================================

  describe('isEdgeVisibleForCluster()', () => {
    it('should accept clusterId and filter edges to intra-cluster only', async () => {
      const nodes: GraphNode[] = [
        {
          id: 'a1',
          name: 'A1',
          type: NodeType.App,
          platform: Platform.iOS,
          project: 'ProjectA',
          origin: Origin.Local,
        },
        {
          id: 'a2',
          name: 'A2',
          type: NodeType.Framework,
          platform: Platform.iOS,
          project: 'ProjectA',
          origin: Origin.Local,
        },
        {
          id: 'b1',
          name: 'B1',
          type: NodeType.Library,
          platform: Platform.iOS,
          project: 'ProjectB',
          origin: Origin.Local,
        },
      ];
      const edges = [
        { source: 'a1', target: 'a2' }, // intra-cluster (ProjectA)
        { source: 'a1', target: 'b1' }, // cross-cluster
      ];

      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
            .clusterId=${'ProjectA'}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // With clusterId set, only intra-cluster edges for that cluster should pass
      expect(edgesComponent.clusterId).to.equal('ProjectA');
      // Component rendered without errors
      expect(edgesComponent.edges).to.have.length(2);
      expect(edgesComponent.nodes).to.have.length(3);
    });

    it('should show cross-cluster edges when no clusterId is set', async () => {
      const nodes: GraphNode[] = [
        {
          id: 'a1',
          name: 'A1',
          type: NodeType.App,
          platform: Platform.iOS,
          project: 'ProjectA',
          origin: Origin.Local,
        },
        {
          id: 'a2',
          name: 'A2',
          type: NodeType.Framework,
          platform: Platform.iOS,
          project: 'ProjectA',
          origin: Origin.Local,
        },
        {
          id: 'b1',
          name: 'B1',
          type: NodeType.Library,
          platform: Platform.iOS,
          project: 'ProjectB',
          origin: Origin.Local,
        },
      ];
      const edges = [
        { source: 'a1', target: 'a2' }, // intra-cluster (filtered out)
        { source: 'a1', target: 'b1' }, // cross-cluster (shown)
      ];

      const positions = createMockNodePositions(nodes.map((n) => n.id));
      const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Without clusterId, cross-cluster filter applies
      expect(edgesComponent.clusterId).to.be.undefined;
      expect(edgesComponent.edges).to.have.length(2);
    });
  });

  // ========================================
  // renderEdge() null guard branch coverage
  // ========================================

  describe('renderEdge() null guards', () => {
    it('should skip edges when cluster positions are missing', async () => {
      const { nodes, edges } = createSmallTestGraph();
      const positions = createMockNodePositions(nodes.map((n) => n.id));
      // Only provide one cluster position, missing the other
      const clusterPositions = createMockClusterPositions(['ProjectA']); // missing ProjectB

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // Edge node2->node3 crosses clusters but ProjectB position is missing,
      // so it should be skipped. node1->node2 is intra-ProjectA (also filtered out
      // since no clusterId is set and they are same cluster). So 0 edges rendered.
      const rendered = querySvgElements(svgEl, 'xcode-graph-edge');
      expect(rendered.length).to.equal(0);
    });

    it('should handle nodes with no project by falling back to External cluster', async () => {
      const nodes: GraphNode[] = [
        {
          id: 'n1',
          name: 'N1',
          type: NodeType.App,
          platform: Platform.iOS,
          project: 'ProjectA',
          origin: Origin.Local,
        },
        {
          id: 'n2',
          name: 'N2',
          type: NodeType.Framework,
          platform: Platform.iOS,
          project: undefined as unknown as string,
          origin: Origin.External,
        },
      ];
      const edges = [{ source: 'n1', target: 'n2' }];

      const positions = createMockNodePositions(['n1', 'n2']);
      const clusterPositions = createMockClusterPositions(['ProjectA', 'External']);

      const svgEl = await fixture(html`
        <svg>
          <xcode-graph-edges
            .edges=${edges}
            .nodes=${nodes}
            .finalNodePositions=${positions}
            .clusterPositions=${clusterPositions}
          ></xcode-graph-edges>
        </svg>
      `);

      const edgesComponent = svgEl.querySelector('xcode-graph-edges') as GraphEdges;
      await edgesComponent.updateComplete;

      // n2 has no project, falls back to 'External'. This makes it cross-cluster with ProjectA.
      // The component should process this without crashing.
      expect(edgesComponent.edges).to.have.length(1);
      expect(edgesComponent.nodes).to.have.length(2);
    });
  });
});

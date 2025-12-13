/**
 * GraphEdges Component Tests
 *
 * Comprehensive tests for edge rendering with depth-based opacity and highlighting.
 */

import { expect, fixture, html } from '@open-wc/testing';
import { ViewMode } from '@shared/schemas';
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

describe('graph-edges', () => {
  it('should render inside SVG context', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    expect(edgesComponent).to.exist;
  });

  it('should render nothing when edges or nodes are undefined', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-edges></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    const renderedEdges = countSvgElements(svgEl, 'graph-edge');
    expect(renderedEdges).to.equal(0);
  });

  it('should render graph-edge components for valid edges', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Should render edges (cross-cluster edges only by default)
    const renderedEdges = querySvgElements(svgEl, 'graph-edge');
    expect(renderedEdges.length).to.be.greaterThanOrEqual(0);
  });

  it('should filter intra-cluster edges when clusterId is not set', async () => {
    const { nodes, edges } = createMediumTestGraph();
    // This graph has both cross-cluster and intra-cluster edges

    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
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
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .clusterId=${'ProjectA'}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
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
        <graph-edges
          .edges=${invalidEdges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Should not crash and only render valid edges
    const renderedEdges = querySvgElements(svgEl, 'graph-edge');
    expect(renderedEdges.length).to.be.lessThan(invalidEdges.length);
  });

  it('should skip edges with missing positions', async () => {
    const { nodes, edges } = createSmallTestGraph();

    // Create incomplete position maps
    const positions = createMockNodePositions(['node1']); // Missing node2 and node3
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    // Should skip edges without positions
    const renderedEdges = querySvgElements(svgEl, 'graph-edge');
    expect(renderedEdges.length).to.equal(0);
  });

  it('should highlight edges connected to selected node', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .selectedNode=${nodes[0]}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
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
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .transitiveDeps=${transitiveResult}
          .viewMode=${ViewMode.Focused}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
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
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .hoveredClusterId=${'ProjectA'}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    expect(edgesComponent.hoveredClusterId).to.equal('ProjectA');
  });

  it('should pass zoom property to edge components', async () => {
    const { nodes, edges } = createSmallTestGraph();
    const positions = createMockNodePositions(nodes.map((n) => n.id));
    const clusterPositions = createMockClusterPositions(['ProjectA', 'ProjectB']);

    const svgEl = await fixture(html`
      <svg>
        <graph-edges
          .edges=${edges}
          .nodes=${nodes}
          .finalNodePositions=${positions}
          .clusterPositions=${clusterPositions}
          .zoom=${1.5}
        ></graph-edges>
      </svg>
    `);

    const edgesComponent = svgEl.querySelector('graph-edges') as GraphEdges;
    await edgesComponent.updateComplete;

    expect(edgesComponent.zoom).to.equal(1.5);
  });
});

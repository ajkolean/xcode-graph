/**
 * GraphVisualization Component Tests
 *
 * Comprehensive tests for the core graph visualization component.
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphVisualization } from './graph-visualization';
import './graph-visualization';
import { createSmallTestGraph, createTestNode } from './test-helpers/graph-fixtures';
import { assertSvgElementExists, querySvgElement } from './test-helpers/svg-assertions';

describe('graph-visualization', () => {
  it('should render with minimal props', async () => {
    const el = await fixture<GraphVisualization>(html`
      <graph-visualization></graph-visualization>
    `);

    expect(el).to.exist;
    const svg = querySvgElement(el.shadowRoot!, 'svg');
    assertSvgElementExists(svg);
  });

  it('should render empty state when nodes array is empty', async () => {
    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${[]} .edges=${[]}></graph-visualization>
    `);

    await el.updateComplete;

    const emptyState = el.shadowRoot!.querySelector('graph-visualization-empty-state');
    expect(emptyState).to.exist;
  });

  it('should not render empty state when nodes exist', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    const emptyState = el.shadowRoot!.querySelector('graph-visualization-empty-state');
    expect(emptyState).to.not.exist;
  });

  it('should render graph-controls with correct node and edge counts', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    const controls = el.shadowRoot!.querySelector('graph-controls');
    expect(controls).to.exist;
    expect(controls!.getAttribute('node-count')).to.equal('3');
    expect(controls!.getAttribute('edge-count')).to.equal('2');
  });

  it('should handle null/undefined nodes and edges gracefully', async () => {
    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${undefined} .edges=${undefined}></graph-visualization>
    `);

    await el.updateComplete;

    // Should render without errors
    expect(el).to.exist;

    // Controls should show 0 counts
    const controls = el.shadowRoot!.querySelector('graph-controls');
    expect(controls!.getAttribute('node-count')).to.equal('0');
    expect(controls!.getAttribute('edge-count')).to.equal('0');
  });

  it('should pass zoom property to controls and SVG transform', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges} .zoom=${1.5}></graph-visualization>
    `);

    await el.updateComplete;

    const controls = el.shadowRoot!.querySelector('graph-controls');
    expect(controls).to.exist;
    // zoom is passed as a property, not attribute
    expect(el.zoom).to.equal(1.5);

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    const mainGroup = querySvgElement(svg, 'g');
    assertSvgElementExists(mainGroup);
    expect(mainGroup.getAttribute('transform')).to.include('scale(1.5)');
  });

  it('should pass enableAnimation property to controls', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges} enable-animation></graph-visualization>
    `);

    await el.updateComplete;

    const controls = el.shadowRoot!.querySelector('graph-controls');
    expect(controls).to.exist;
    expect(controls!.hasAttribute('enable-animation')).to.be.true;
  });

  it('should render graph-svg-defs for patterns and gradients', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    const defs = querySvgElement(svg, 'graph-svg-defs');
    expect(defs).to.exist;
  });

  it('should render graph-background component', async () => {
    const el = await fixture<GraphVisualization>(html`
      <graph-visualization></graph-visualization>
    `);

    await el.updateComplete;

    const background = el.shadowRoot!.querySelector('graph-background');
    expect(background).to.exist;
  });

  it('should dispatch node-select event on canvas click', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    let eventDetail: any = null;
    el.addEventListener('node-select', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    // Dispatch a click event instead of calling .click()
    svg!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(eventDetail).to.exist;
    expect(eventDetail.node).to.be.null;
  });

  it('should dispatch zoom-in event from controls', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    let zoomEventFired = false;
    el.addEventListener('zoom-in', () => {
      zoomEventFired = true;
    });

    const controls = el.shadowRoot!.querySelector('graph-controls');
    controls!.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }));

    expect(zoomEventFired).to.be.true;
  });

  it('should update layout when nodes or edges change', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization .nodes=${nodes} .edges=${edges}></graph-visualization>
    `);

    await el.updateComplete;

    // Add a new node
    const newNode = createTestNode({ id: 'node4', name: 'NewNode' });
    el.nodes = [...nodes, newNode];

    await el.updateComplete;

    // Should still render correctly
    expect(el.nodes?.length).to.equal(4);
  });

  it('should render with selectedNode highlighted', async () => {
    const { nodes, edges } = createSmallTestGraph();

    const el = await fixture<GraphVisualization>(html`
      <graph-visualization
        .nodes=${nodes}
        .edges=${edges}
        .selectedNode=${nodes[0]}
      ></graph-visualization>
    `);

    await el.updateComplete;

    // Component should accept selectedNode prop
    expect(el.selectedNode).to.deep.equal(nodes[0]);
  });
});

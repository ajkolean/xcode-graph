/**
 * GraphVirtualRenderer Component Tests
 *
 * Tests for virtual rendering optimization (viewport culling).
 */

import { expect, fixture, html } from "@open-wc/testing";
import { describe, it } from "vitest";
import type { GraphVirtualRenderer } from "./virtual-renderer";
import "./virtual-renderer";
import {
  createLargeTestGraph,
  createMockNodePositions,
  createNodeInViewport,
  createNodeOutsideViewport,
  createViewportBounds,
} from "./test-helpers/graph-fixtures";
import { countSvgElements } from "./test-helpers/svg-assertions";

describe("graph-virtual-renderer", () => {
  it("should render with default properties", async () => {
    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer></graph-virtual-renderer>`,
    );

    expect(el).to.exist;
    expect(el.nodes).to.deep.equal([]);
    expect(el.viewportWidth).to.equal(1000);
    expect(el.viewportHeight).to.equal(800);
    expect(el.zoom).to.equal(1);
  });

  it("should accept viewport dimensions", async () => {
    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        viewportWidth="1920"
        viewportHeight="1080"
      ></graph-virtual-renderer>`,
    );

    expect(el.viewportWidth).to.equal(1920);
    expect(el.viewportHeight).to.equal(1080);
  });

  it("should accept pan and zoom properties", async () => {
    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        panX="100"
        panY="200"
        zoom="1.5"
      ></graph-virtual-renderer>`,
    );

    expect(el.panX).to.equal(100);
    expect(el.panY).to.equal(200);
    expect(el.zoom).to.equal(1.5);
  });

  it("should render nodes inside viewport", async () => {
    const viewport = createViewportBounds(1000, 800, 0, 0, 1);
    const { node: node1, position: pos1 } = createNodeInViewport(
      "node1",
      viewport,
    );
    const { node: node2, position: pos2 } = createNodeInViewport(
      "node2",
      viewport,
    );

    const nodes = [node1, node2];
    const positions = new Map([
      ["node1", pos1],
      ["node2", pos2],
    ]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        viewportWidth="1000"
        viewportHeight="800"
        panX="0"
        panY="0"
        zoom="1"
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    // Both nodes should be visible
    const stats = el.getVirtualRenderingStats();
    expect(stats.visibleNodes).to.equal(2);
  });

  it("should cull nodes outside viewport", async () => {
    const viewport = createViewportBounds(1000, 800, 0, 0, 1);
    const { node: node1, position: pos1 } = createNodeInViewport(
      "node1",
      viewport,
    );
    const { node: node2, position: pos2 } = createNodeOutsideViewport(
      "node2",
      viewport,
    );

    const nodes = [node1, node2];
    const positions = new Map([
      ["node1", pos1],
      ["node2", pos2],
    ]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        viewportWidth="1000"
        viewportHeight="800"
        panX="0"
        panY="0"
        zoom="1"
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    // Only node1 should be visible
    const stats = el.getVirtualRenderingStats();
    expect(stats.visibleNodes).to.equal(1);
    expect(stats.culledNodes).to.equal(1);
  });

  it("should recalculate visible nodes when viewport changes", async () => {
    const viewport = createViewportBounds(1000, 800, 0, 0, 1);
    const { node: node1, position: pos1 } = createNodeInViewport(
      "node1",
      viewport,
    );

    const nodes = [node1];
    const positions = new Map([["node1", pos1]]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        viewportWidth="1000"
        viewportHeight="800"
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    // Node should be visible
    let stats = el.getVirtualRenderingStats();
    expect(stats.visibleNodes).to.equal(1);

    // Pan far away
    el.panX = -5000;
    el.panY = -5000;
    await el.updateComplete;

    // Node should now be culled
    stats = el.getVirtualRenderingStats();
    expect(stats.visibleNodes).to.equal(0);
  });

  it("should recalculate visible nodes when zoom changes", async () => {
    const viewport = createViewportBounds(1000, 800, 0, 0, 1);
    const { node: node1, position: pos1 } = createNodeInViewport(
      "node1",
      viewport,
    );

    const nodes = [node1];
    const positions = new Map([["node1", pos1]]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        zoom="1"
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    // Change zoom
    el.zoom = 0.5;
    await el.updateComplete;

    // Should recalculate (node might still be visible due to buffer)
    const stats = el.getVirtualRenderingStats();
    expect(stats.totalNodes).to.equal(1);
  });

  it("should use buffer margin for smooth scrolling", async () => {
    const viewport = createViewportBounds(1000, 800, 0, 0, 1);
    const { node: node1, position: pos1 } = createNodeInViewport(
      "node1",
      viewport,
    );

    const nodes = [node1];
    const positions = new Map([["node1", pos1]]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        bufferMargin="200"
      ></graph-virtual-renderer>`,
    );

    expect(el.bufferMargin).to.equal(200);
  });

  it("should handle large graphs efficiently", async () => {
    const { nodes } = createLargeTestGraph(100);
    const positions = createMockNodePositions(nodes.map((n) => n.id));

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
        viewportWidth="1000"
        viewportHeight="800"
        panX="0"
        panY="0"
        zoom="1"
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    const stats = el.getVirtualRenderingStats();
    expect(stats.totalNodes).to.equal(100);
    // Should cull most nodes (only those in viewport visible)
    expect(stats.culledNodes).to.be.greaterThan(0);
  });

  it("should provide virtual rendering statistics", async () => {
    const { nodes } = createLargeTestGraph(50);
    const positions = createMockNodePositions(nodes.map((n) => n.id));

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    const stats = el.getVirtualRenderingStats();

    expect(stats).to.have.property("totalNodes");
    expect(stats).to.have.property("visibleNodes");
    expect(stats).to.have.property("culledNodes");
    expect(stats).to.have.property("cullingRatio");
    expect(stats).to.have.property("percentageCulled");
    expect(stats).to.have.property("renderCount");

    expect(stats.totalNodes).to.equal(50);
    expect(stats.culledNodes).to.equal(stats.totalNodes - stats.visibleNodes);
  });

  it("should calculate culling ratio correctly", async () => {
    const { nodes } = createLargeTestGraph(100);
    const positions = createMockNodePositions(nodes.map((n) => n.id));

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    const stats = el.getVirtualRenderingStats();
    const expectedRatio = stats.totalNodes / (stats.visibleNodes || 1);
    expect(stats.cullingRatio).to.equal(expectedRatio);
  });

  it("should calculate percentage culled correctly", async () => {
    const { nodes } = createLargeTestGraph(100);
    const positions = createMockNodePositions(nodes.map((n) => n.id));

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    const stats = el.getVirtualRenderingStats();
    const expectedPercentage =
      ((stats.totalNodes - stats.visibleNodes) / stats.totalNodes) * 100;
    expect(stats.percentageCulled).to.equal(expectedPercentage);
  });

  it("should increment render count on updates", async () => {
    const { nodes } = createLargeTestGraph(10);
    const positions = createMockNodePositions(nodes.map((n) => n.id));

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    const initialRenderCount = el.getVirtualRenderingStats().renderCount;

    // Trigger update
    el.zoom = 1.5;
    await el.updateComplete;

    const newRenderCount = el.getVirtualRenderingStats().renderCount;
    expect(newRenderCount).to.be.greaterThan(initialRenderCount);
  });

  it("should handle nodes without positions gracefully", async () => {
    const { nodes } = createLargeTestGraph(10);
    // Don't provide positions for some nodes
    const positions = createMockNodePositions(["node0", "node1", "node2"]);

    const el = await fixture<GraphVirtualRenderer>(
      html`<graph-virtual-renderer
        .nodes=${nodes}
        .nodePositions=${positions}
      ></graph-virtual-renderer>`,
    );

    await el.updateComplete;

    // Should not crash
    const stats = el.getVirtualRenderingStats();
    expect(stats.totalNodes).to.equal(10);
    // Only nodes with positions can be visible
    expect(stats.visibleNodes).to.be.lessThanOrEqual(3);
  });
});

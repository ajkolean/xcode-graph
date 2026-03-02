/**
 * GraphEdge Component Tests
 *
 * Tests for the SVG graph edge component covering path generation,
 * highlighting, dash patterns, animation, and opacity.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { GraphEdge } from './graph-edge';
import './graph-edge';

/**
 * Helper to create a GraphEdge element and append it to an SVG fixture.
 * Custom elements must be created with `new` (HTML namespace) then appended
 * to SVG, because elements created directly inside <svg> in JSDOM are in
 * the SVG namespace and do not get upgraded as custom elements.
 */
async function renderEdge(
  props: {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    color?: string;
    isHighlighted?: boolean;
    isDependent?: boolean;
    animated?: boolean;
    opacity?: number;
    zoom?: number;
  } = {},
) {
  const el = new GraphEdge();
  el.x1 = props.x1 ?? 0;
  el.y1 = props.y1 ?? 0;
  el.x2 = props.x2 ?? 100;
  el.y2 = props.y2 ?? 100;
  el.color = props.color ?? '#8B5CF6';
  el.isHighlighted = props.isHighlighted ?? false;
  el.isDependent = props.isDependent ?? false;
  el.animated = props.animated ?? false;
  el.opacity = props.opacity ?? 1;
  el.zoom = props.zoom ?? 1;

  const svgEl = await fixture(html`<svg></svg>`);
  svgEl.appendChild(el);
  await el.updateComplete;
  return { svgEl, el };
}

describe('xcode-graph-edge', () => {
  it('should render a straight line path for short distances (<=150)', async () => {
    const { el } = await renderEdge({ x1: 0, y1: 0, x2: 100, y2: 100 });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    const d = path?.getAttribute('d');
    expect(d).to.contain('M ');
    expect(d).to.contain('L ');
  });

  it('should render a bezier curve path for long distances (>150)', async () => {
    const { el } = await renderEdge({ x1: 0, y1: 0, x2: 300, y2: 300 });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    const d = path?.getAttribute('d');
    expect(d).to.contain('M ');
    expect(d).to.contain('C ');
  });

  it('should render a glow path when isHighlighted is true', async () => {
    const { el } = await renderEdge({ isHighlighted: true });
    const paths = el.querySelectorAll('g.graph-edge path');
    // Should have 2 paths: glow + main
    expect(paths.length).to.equal(2);
    const glowPath = paths[0] as Element;
    expect(glowPath.getAttribute('filter')).to.equal('url(#glow-strong)');
    expect(glowPath.getAttribute('stroke-width')).to.equal('3');
  });

  it('should render only one path when not highlighted', async () => {
    const { el } = await renderEdge({ isHighlighted: false });
    const paths = el.querySelectorAll('g.graph-edge path');
    expect(paths.length).to.equal(1);
  });

  it('should use dash pattern 8,4 for dependent edges', async () => {
    const { el } = await renderEdge({ isDependent: true });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    expect(path?.getAttribute('stroke-dasharray')).to.equal('8,4');
  });

  it('should use dash pattern 4,2 for regular edges', async () => {
    const { el } = await renderEdge({ isDependent: false });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    expect(path?.getAttribute('stroke-dasharray')).to.equal('4,2');
  });

  it('should apply flow-animation class when animated is true', async () => {
    const { el } = await renderEdge({ animated: true });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    expect(path?.classList.contains('flow-animation')).toBe(true);
  });

  it('should not apply flow-animation class when animated is false', async () => {
    const { el } = await renderEdge({ animated: false });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    expect(path?.classList.contains('flow-animation')).toBe(false);
  });

  it('should set stroke-width to 2 when highlighted', async () => {
    const { el } = await renderEdge({ isHighlighted: true });
    const mainPath = el.querySelector('g.graph-edge path:last-of-type');
    expect(mainPath).toBeDefined();
    expect(mainPath?.getAttribute('stroke-width')).to.equal('2');
  });

  it('should set stroke-width to 1 when not highlighted', async () => {
    const { el } = await renderEdge({ isHighlighted: false });
    const mainPath = el.querySelector('g.graph-edge path:last-of-type');
    expect(mainPath).toBeDefined();
    expect(mainPath?.getAttribute('stroke-width')).to.equal('1');
  });

  it('should apply opacity to the main path', async () => {
    const { el } = await renderEdge({ opacity: 0.5 });
    const path = el.querySelector('g.graph-edge path:last-of-type');
    expect(path).toBeDefined();
    const opacityVal = Number(path?.getAttribute('opacity'));
    expect(opacityVal).to.be.greaterThan(0);
    expect(opacityVal).to.be.lessThan(1);
  });

  it('should render with default values when no properties are set', async () => {
    const el = new GraphEdge();
    const svgEl = await fixture(html`<svg></svg>`);
    svgEl.appendChild(el);
    await el.updateComplete;
    const g = el.querySelector('g.graph-edge');
    expect(g).toBeDefined();
  });
});

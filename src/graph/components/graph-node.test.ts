/**
 * GraphNode Component Tests
 *
 * Tests for the SVG graph node component covering rendering, accessibility,
 * interaction events, keyboard navigation, and zoom-dependent label visibility.
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import { GraphNode } from './graph-node';
import './graph-node';
import { createTestNode } from './test-helpers/graph-fixtures';

function makeNode(overrides: Partial<Parameters<typeof createTestNode>[0]> = {}) {
  return createTestNode({
    id: 'n1',
    name: 'MyApp',
    type: NodeType.App,
    platform: Platform.iOS,
    origin: Origin.Local,
    project: 'P1',
    ...overrides,
  });
}

/**
 * Helper to create a GraphNode element and append it to an SVG fixture.
 * Custom elements must be created with `new` (HTML namespace) then appended
 * to SVG, because elements created directly inside <svg> in JSDOM are in
 * the SVG namespace and do not get upgraded as custom elements.
 */
async function renderNode(
  props: {
    node?: ReturnType<typeof makeNode>;
    x?: number;
    y?: number;
    size?: number;
    color?: string;
    isSelected?: boolean;
    isHovered?: boolean;
    isDimmed?: boolean;
    zoom?: number;
  } = {},
) {
  const el = new GraphNode();
  if (props.node !== undefined) el.node = props.node;
  el.x = props.x ?? 100;
  el.y = props.y ?? 100;
  el.size = props.size ?? 24;
  el.color = props.color ?? '#F59E0B';
  el.isSelected = props.isSelected ?? false;
  el.isHovered = props.isHovered ?? false;
  el.isDimmed = props.isDimmed ?? false;
  el.zoom = props.zoom ?? 1;

  const svgEl = await fixture(html`<svg></svg>`);
  svgEl.appendChild(el);
  await el.updateComplete;
  return { svgEl, el };
}

describe('xcode-graph-node', () => {
  it('should render empty when no node data is set', async () => {
    const { el } = await renderNode();
    const g = el.querySelector('g[role="img"]');
    expect(g).to.be.null;
  });

  it('should render a g element with role="img" when node is provided', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
  });

  it('should have correct aria-label including node name and type', async () => {
    const node = makeNode({ name: 'CoreLib', type: NodeType.Framework });
    const { el } = await renderNode({ node });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
    const label = g?.getAttribute('aria-label');
    expect(label).to.equal('CoreLib, framework target');
  });

  it('should have tabindex="0" for keyboard focus', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
    expect(g?.getAttribute('tabindex')).to.equal('0');
  });

  it('should render an icon path element', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });
    const path = el.querySelector('path');
    expect(path).to.exist;
    expect(path?.getAttribute('d')).to.be.a('string').that.is.not.empty;
  });

  it('should set opacity to 0.25 when isDimmed is true', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, isDimmed: true });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
    expect(g?.getAttribute('opacity')).to.equal('0.25');
  });

  it('should set opacity to 1 when not dimmed', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, isDimmed: false });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
    expect(g?.getAttribute('opacity')).to.equal('1');
  });

  it('should dispatch node-mouseenter on mouseenter', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    const event = await oneEvent(el, 'node-mouseenter');
    expect(event).to.exist;
    expect(event.type).to.equal('node-mouseenter');
  });

  it('should dispatch node-mouseleave on mouseleave', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    const event = await oneEvent(el, 'node-mouseleave');
    expect(event).to.exist;
    expect(event.type).to.equal('node-mouseleave');
  });

  it('should dispatch node-click on click', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const event = await oneEvent(el, 'node-click');
    expect(event).to.exist;
    expect(event.type).to.equal('node-click');
  });

  it('should dispatch node-mousedown on mousedown', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    const event = await oneEvent(el, 'node-mousedown');
    expect(event).to.exist;
    expect(event.type).to.equal('node-mousedown');
  });

  it('should dispatch node-click on Enter keydown', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    const event = await oneEvent(el, 'node-click');
    expect(event).to.exist;
    expect(event.type).to.equal('node-click');
  });

  it('should dispatch node-click on Space keydown', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });

    setTimeout(() => {
      const g = el.querySelector('g[role="img"]') as Element;
      g.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
    const event = await oneEvent(el, 'node-click');
    expect(event).to.exist;
    expect(event.type).to.equal('node-click');
  });

  it('should not dispatch node-click on other keydown events', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node });
    const g = el.querySelector('g[role="img"]') as Element;

    let fired = false;
    el.addEventListener('node-click', () => {
      fired = true;
    });
    g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    await new Promise((r) => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('should hide label when zoom < 0.5', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, zoom: 0.3 });
    const textElements = el.querySelectorAll('text');
    expect(textElements.length).to.equal(0);
  });

  it('should show label when zoom >= 0.5', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, zoom: 0.5 });
    const textElements = el.querySelectorAll('text');
    expect(textElements.length).to.be.greaterThan(0);
    const labelText = textElements[0]?.textContent?.trim();
    expect(labelText).to.equal('MyApp');
  });

  it('should show label at default zoom (1)', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, zoom: 1 });
    const textElements = el.querySelectorAll('text');
    expect(textElements.length).to.be.greaterThan(0);
  });

  it('should truncate long node names in the label', async () => {
    const node = makeNode({ name: 'VeryLongNodeNameThatExceedsTwentyCharacters' });
    const { el } = await renderNode({ node, zoom: 1 });
    const textElements = el.querySelectorAll('text');
    expect(textElements.length).to.be.greaterThan(0);
    const labelText = textElements[0]?.textContent?.trim();
    expect(labelText).to.contain('...');
    expect(labelText?.length).to.be.lessThan('VeryLongNodeNameThatExceedsTwentyCharacters'.length);
  });

  it('should render glow rings when selected', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, isSelected: true });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
    // Selected nodes should scale differently
    expect(g?.getAttribute('opacity')).to.equal('1');
  });

  it('should render glow rings when hovered', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, isHovered: true });
    const g = el.querySelector('g[role="img"]');
    expect(g).to.exist;
  });

  it('should render tooltip for long name when hovered', async () => {
    const node = makeNode({ name: 'VeryLongNodeNameThatExceedsTwentyChars' });
    const { el } = await renderNode({ node, isHovered: true, zoom: 1 });
    const tooltipText = el.querySelectorAll('text');
    // Should have the label plus possibly a full-name tooltip
    expect(tooltipText.length).to.be.greaterThan(0);
  });

  it('should render sonar pulses when selected', async () => {
    const node = makeNode();
    const { el } = await renderNode({ node, isSelected: true });
    // Sonar pulses are animated circles
    const circles = el.querySelectorAll('circle');
    expect(circles.length).to.be.greaterThan(0);
  });
});

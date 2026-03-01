/**
 * GraphCluster Component Tests
 *
 * Tests for the SVG graph cluster component covering rendering, hover glow,
 * origin text, accessibility, click events, and mouse events.
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { Origin } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import { GraphCluster } from './graph-cluster';
import './graph-cluster';

/**
 * Helper to create a GraphCluster element and append it to an SVG fixture.
 * Custom elements must be created with `new` (HTML namespace) then appended
 * to SVG, because elements created directly inside <svg> in JSDOM are in
 * the SVG namespace and do not get upgraded as custom elements.
 */
async function renderCluster(
  props: {
    clusterId?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    nodeCount?: number;
    origin?: Origin;
    isHovered?: boolean;
  } = {},
) {
  const el = new GraphCluster();
  el.clusterId = props.clusterId ?? 'MyProject';
  el.x = props.x ?? 200;
  el.y = props.y ?? 200;
  el.width = props.width ?? 300;
  el.height = props.height ?? 200;
  el.color = props.color ?? '#8B5CF6';
  el.nodeCount = props.nodeCount ?? 5;
  el.origin = props.origin ?? Origin.Local;
  el.isHovered = props.isHovered ?? false;

  const svgEl = await fixture(html`<svg></svg>`);
  svgEl.appendChild(el);
  await el.updateComplete;
  return { svgEl, el };
}

describe('xcode-graph-cluster', () => {
  it('should render the cluster label', async () => {
    const { el } = await renderCluster({ clusterId: 'CoreProject' });
    const texts = el.querySelectorAll('text');
    const labelText = Array.from(texts).find((t) => t.textContent?.trim() === 'CoreProject');
    expect(labelText).to.exist;
  });

  it('should render the target count and origin text', async () => {
    const { el } = await renderCluster({ nodeCount: 7, origin: Origin.Local });
    const texts = el.querySelectorAll('text');
    const infoText = Array.from(texts).find(
      (t) => t.textContent?.trim().includes('LOCAL') && t.textContent?.trim().includes('7 targets'),
    );
    expect(infoText).to.exist;
  });

  it('should show EXTERNAL for external origin', async () => {
    const { el } = await renderCluster({ origin: Origin.External });
    const texts = el.querySelectorAll('text');
    const infoText = Array.from(texts).find((t) => t.textContent?.trim().includes('EXTERNAL'));
    expect(infoText).to.exist;
  });

  it('should show LOCAL for local origin', async () => {
    const { el } = await renderCluster({ origin: Origin.Local });
    const texts = el.querySelectorAll('text');
    const infoText = Array.from(texts).find((t) => t.textContent?.trim().includes('LOCAL'));
    expect(infoText).to.exist;
  });

  it('should render a glow rect when isHovered is true', async () => {
    const { el } = await renderCluster({ isHovered: true });
    const glowRect = el.querySelector('rect[filter="url(#glow-strong)"]');
    expect(glowRect).to.exist;
  });

  it('should not render a glow rect when isHovered is false', async () => {
    const { el } = await renderCluster({ isHovered: false });
    const glowRect = el.querySelector('rect[filter="url(#glow-strong)"]');
    expect(glowRect).to.be.null;
  });

  it('should have correct aria-label', async () => {
    const { el } = await renderCluster({
      clusterId: 'TestCluster',
      nodeCount: 3,
      origin: Origin.Local,
    });
    const g = el.querySelector('g[role="group"]');
    expect(g).to.exist;
    const label = g?.getAttribute('aria-label');
    expect(label).to.include('TestCluster');
    expect(label).to.include('3 targets');
    expect(label).to.include('local');
  });

  it('should include external in aria-label for external origin', async () => {
    const { el } = await renderCluster({
      clusterId: 'Pkg',
      origin: Origin.External,
    });
    const g = el.querySelector('g[role="group"]');
    expect(g).to.exist;
    const label = g?.getAttribute('aria-label');
    expect(label).to.include('external');
  });

  it('should have tabindex=0 for keyboard focus', async () => {
    const { el } = await renderCluster();
    const g = el.querySelector('g[role="group"]');
    expect(g).to.exist;
    expect(g?.getAttribute('tabindex')).to.equal('0');
  });

  it('should dispatch cluster-click on click', async () => {
    const { el } = await renderCluster();

    setTimeout(() => {
      const g = el.querySelector('g[role="group"]') as Element;
      g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const event = await oneEvent(el, 'cluster-click');
    expect(event).to.exist;
    expect(event.type).to.equal('cluster-click');
  });

  it('should dispatch cluster-mouseenter on mouseenter', async () => {
    const { el } = await renderCluster();

    setTimeout(() => {
      const g = el.querySelector('g[role="group"]') as Element;
      g.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    const event = await oneEvent(el, 'cluster-mouseenter');
    expect(event).to.exist;
    expect(event.type).to.equal('cluster-mouseenter');
  });

  it('should dispatch cluster-mouseleave on mouseleave', async () => {
    const { el } = await renderCluster();

    setTimeout(() => {
      const g = el.querySelector('g[role="group"]') as Element;
      g.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    const event = await oneEvent(el, 'cluster-mouseleave');
    expect(event).to.exist;
    expect(event.type).to.equal('cluster-mouseleave');
  });

  it('should dispatch cluster-click on Enter keydown', async () => {
    const { el } = await renderCluster();

    setTimeout(() => {
      const g = el.querySelector('g[role="group"]') as Element;
      g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    const event = await oneEvent(el, 'cluster-click');
    expect(event).to.exist;
  });

  it('should dispatch cluster-click on Space keydown', async () => {
    const { el } = await renderCluster();

    setTimeout(() => {
      const g = el.querySelector('g[role="group"]') as Element;
      g.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
    const event = await oneEvent(el, 'cluster-click');
    expect(event).to.exist;
  });

  it('should not dispatch cluster-click on other keydown events', async () => {
    const { el } = await renderCluster();
    const g = el.querySelector('g[role="group"]') as Element;

    let fired = false;
    el.addEventListener('cluster-click', () => {
      fired = true;
    });
    g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    await new Promise((r) => setTimeout(r, 50));
    expect(fired).to.be.false;
  });

  it('should use higher opacity for border when hovered', async () => {
    const { el } = await renderCluster({ isHovered: true });
    // The border rect has stroke-dasharray="6,6"
    const borderRect = el.querySelector('rect[stroke-dasharray="6,6"]');
    expect(borderRect).to.exist;
    const opacity = Number(borderRect?.getAttribute('opacity'));
    expect(opacity).to.equal(0.85);
  });

  it('should use lower opacity for border when not hovered', async () => {
    const { el } = await renderCluster({ isHovered: false });
    const borderRect = el.querySelector('rect[stroke-dasharray="6,6"]');
    expect(borderRect).to.exist;
    const opacity = Number(borderRect?.getAttribute('opacity'));
    expect(opacity).to.equal(0.5);
  });

  it('should render gradient definitions', async () => {
    const { el } = await renderCluster({ clusterId: 'Proj' });
    const radialGrad = el.querySelector('radialGradient[id="cluster-bg-Proj"]');
    const linearGrad = el.querySelector('linearGradient[id="cluster-inner-shadow-Proj"]');
    expect(radialGrad).to.exist;
    expect(linearGrad).to.exist;
  });
});

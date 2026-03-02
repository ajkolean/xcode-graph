/**
 * GraphOverlays Components Tests
 *
 * Tests for GraphBackground, GraphControls, GraphEmptyState, and GraphInstructions.
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type {
  GraphBackground,
  GraphControls,
  GraphEmptyStateOverlay,
  GraphInstructions,
} from './graph-overlays';
import './graph-overlays';
import { querySvgElement } from '@graph/test-helpers/svg-assertions';

describe('xcode-graph-background', () => {
  it('should render SVG with grid pattern', async () => {
    const el = await fixture<GraphBackground>(
      html`<xcode-graph-background></xcode-graph-background>`,
    );

    const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
    expect(svg).toBeDefined();
  });

  it('should define grid pattern in defs', async () => {
    const el = await fixture<GraphBackground>(
      html`<xcode-graph-background></xcode-graph-background>`,
    );

    const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
    expect(svg).toBeDefined();
    if (!svg) return;

    const defs = querySvgElement(svg, 'defs');
    expect(defs).toBeDefined();
    if (!defs) return;

    const pattern = querySvgElement(defs, 'pattern#grid');
    expect(pattern).toBeDefined();
  });

  it('should have rect with grid pattern fill', async () => {
    const el = await fixture<GraphBackground>(
      html`<xcode-graph-background></xcode-graph-background>`,
    );

    const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
    expect(svg).toBeDefined();
    if (!svg) return;

    const rect = querySvgElement(svg, 'rect');
    expect(rect).toBeDefined();
    expect(rect?.getAttribute('fill')).to.equal('url(#grid)');
  });
});

describe('xcode-graph-controls', () => {
  it('should render with default zoom', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1"></xcode-graph-controls>`,
    );

    expect(el).toBeDefined();
    expect(el.zoom).to.equal(1);
  });

  it('should display zoom percentage correctly', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1.5"></xcode-graph-controls>`,
    );

    await el.updateComplete;

    const container = el.shadowRoot?.querySelector('.container');
    expect(container?.textContent).to.include('150%');
  });

  it('should render zoom buttons', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1"></xcode-graph-controls>`,
    );

    const zoomInBtn = el.shadowRoot?.querySelector('button[title="Zoom in"]');
    const zoomOutBtn = el.shadowRoot?.querySelector('button[title="Zoom out"]');
    const resetBtn = el.shadowRoot?.querySelector('button[title="Fit to view"]');

    expect(zoomInBtn).toBeDefined();
    expect(zoomOutBtn).toBeDefined();
    expect(resetBtn).toBeDefined();
  });

  it('should dispatch zoom-step event when zoom in button clicked', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`,
    );

    const zoomInBtn = el.shadowRoot?.querySelector('button[title="Zoom in"]') as HTMLButtonElement;
    setTimeout(() => zoomInBtn.click());
    const event = await oneEvent(el, 'zoom-step');

    expect(event).toBeDefined();
  });

  it('should dispatch zoom-step event when zoom out button clicked', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`,
    );

    const zoomOutBtn = el.shadowRoot?.querySelector(
      'button[title="Zoom out"]',
    ) as HTMLButtonElement;
    setTimeout(() => zoomOutBtn.click());
    const event = await oneEvent(el, 'zoom-step');

    expect(event).toBeDefined();
  });

  it('should dispatch zoom-reset event when reset button clicked', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1"></xcode-graph-controls>`,
    );

    const resetBtn = el.shadowRoot?.querySelector(
      'button[title="Fit to view"]',
    ) as HTMLButtonElement;
    setTimeout(() => resetBtn.click());
    const event = await oneEvent(el, 'zoom-reset');

    expect(event).toBeDefined();
  });

  it('should stop wheel event propagation on the container', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`,
    );

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    let parentReceived = false;
    el.addEventListener('wheel', () => {
      parentReceived = true;
    });

    const wheelEvent = new WheelEvent('wheel', { bubbles: true, composed: true });
    container.dispatchEvent(wheelEvent);

    expect(parentReceived).toBe(false);
  });

  it('should stop mousedown event propagation on the container', async () => {
    const el = await fixture<GraphControls>(
      html`<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`,
    );

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    let parentReceived = false;
    el.addEventListener('mousedown', () => {
      parentReceived = true;
    });

    const mouseEvent = new MouseEvent('mousedown', { bubbles: true, composed: true });
    container.dispatchEvent(mouseEvent);

    expect(parentReceived).toBe(false);
  });
});

describe('xcode-graph-visualization-empty-state', () => {
  it('should render empty state message', async () => {
    const el = await fixture<GraphEmptyStateOverlay>(
      html`<xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>`,
    );

    expect(el).toBeDefined();
    const message = el.shadowRoot?.querySelector('.message');
    expect(message).toBeDefined();
    expect(message?.textContent).to.include('No nodes to display');
  });

  it('should render hint text', async () => {
    const el = await fixture<GraphEmptyStateOverlay>(
      html`<xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>`,
    );

    const hint = el.shadowRoot?.querySelector('.hint');
    expect(hint).toBeDefined();
    expect(hint?.textContent).to.include('Try adjusting your filters');
  });
});

describe('xcode-graph-instructions', () => {
  it('should render instructions text', async () => {
    const el = await fixture<GraphInstructions>(
      html`<xcode-graph-instructions></xcode-graph-instructions>`,
    );

    expect(el).toBeDefined();
    const container = el.shadowRoot?.querySelector('.container');
    expect(container).toBeDefined();
    expect(container?.textContent).to.include('Drag nodes to reposition');
    expect(container?.textContent).to.include('Click to inspect');
    expect(container?.textContent).to.include('Scroll to zoom');
  });
});

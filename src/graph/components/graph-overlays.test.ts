/**
 * GraphOverlays Components Tests
 *
 * Tests for GraphBackground, GraphControls, GraphEmptyState, and GraphInstructions.
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type {
  GraphBackground,
  GraphControls,
  GraphEmptyStateOverlay,
  GraphInstructions,
} from './graph-overlays';
import './graph-overlays';
import { querySvgElement } from './test-helpers/svg-assertions';

describe('graph-background', () => {
  it('should render SVG with grid pattern', async () => {
    const el = await fixture<GraphBackground>(html`<graph-background></graph-background>`);

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    expect(svg).to.exist;
  });

  it('should define grid pattern in defs', async () => {
    const el = await fixture<GraphBackground>(html`<graph-background></graph-background>`);

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    const defs = querySvgElement(svg!, 'defs');
    expect(defs).to.exist;

    const pattern = querySvgElement(defs!, 'pattern#grid');
    expect(pattern).to.exist;
  });

  it('should have rect with grid pattern fill', async () => {
    const el = await fixture<GraphBackground>(html`<graph-background></graph-background>`);

    const svg = querySvgElement(el.shadowRoot!, 'svg');
    const rect = querySvgElement(svg!, 'rect');
    expect(rect).to.exist;
    expect(rect!.getAttribute('fill')).to.equal('url(#grid)');
  });
});

describe('graph-controls', () => {
  it('should render with default zoom', async () => {
    const el = await fixture<GraphControls>(html`<graph-controls zoom="1"></graph-controls>`);

    expect(el).to.exist;
    expect(el.zoom).to.equal(1);
  });

  it('should display zoom percentage correctly', async () => {
    const el = await fixture<GraphControls>(html`<graph-controls zoom="1.5"></graph-controls>`);

    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.container');
    expect(container!.textContent).to.include('150%');
  });

  it('should render zoom buttons', async () => {
    const el = await fixture<GraphControls>(html`<graph-controls zoom="1"></graph-controls>`);

    const zoomInBtn = el.shadowRoot!.querySelector('button[title="Zoom in"]');
    const zoomOutBtn = el.shadowRoot!.querySelector('button[title="Zoom out"]');
    const resetBtn = el.shadowRoot!.querySelector('button[title="Fit to view"]');

    expect(zoomInBtn).to.exist;
    expect(zoomOutBtn).to.exist;
    expect(resetBtn).to.exist;
  });

  it('should dispatch zoom-step event when zoom in button clicked', async () => {
    const el = await fixture<GraphControls>(
      html`<graph-controls zoom="1" base-zoom="1"></graph-controls>`,
    );

    let eventFired = false;
    el.addEventListener('zoom-step', () => {
      eventFired = true;
    });

    const zoomInBtn = el.shadowRoot!.querySelector('button[title="Zoom in"]') as HTMLButtonElement;
    zoomInBtn.click();

    expect(eventFired).to.be.true;
  });

  it('should dispatch zoom-step event when zoom out button clicked', async () => {
    const el = await fixture<GraphControls>(
      html`<graph-controls zoom="1" base-zoom="1"></graph-controls>`,
    );

    let eventFired = false;
    el.addEventListener('zoom-step', () => {
      eventFired = true;
    });

    const zoomOutBtn = el.shadowRoot!.querySelector(
      'button[title="Zoom out"]',
    ) as HTMLButtonElement;
    zoomOutBtn.click();

    expect(eventFired).to.be.true;
  });

  it('should dispatch zoom-reset event when reset button clicked', async () => {
    const el = await fixture<GraphControls>(html`<graph-controls zoom="1"></graph-controls>`);

    let eventFired = false;
    el.addEventListener('zoom-reset', () => {
      eventFired = true;
    });

    const resetBtn = el.shadowRoot!.querySelector(
      'button[title="Fit to view"]',
    ) as HTMLButtonElement;
    resetBtn.click();

    expect(eventFired).to.be.true;
  });
});

describe('graph-visualization-empty-state', () => {
  it('should render empty state message', async () => {
    const el = await fixture<GraphEmptyStateOverlay>(
      html`<graph-visualization-empty-state></graph-visualization-empty-state>`,
    );

    expect(el).to.exist;
    const message = el.shadowRoot!.querySelector('.message');
    expect(message).to.exist;
    expect(message!.textContent).to.include('No nodes to display');
  });

  it('should render hint text', async () => {
    const el = await fixture<GraphEmptyStateOverlay>(
      html`<graph-visualization-empty-state></graph-visualization-empty-state>`,
    );

    const hint = el.shadowRoot!.querySelector('.hint');
    expect(hint).to.exist;
    expect(hint!.textContent).to.include('Try adjusting your filters');
  });
});

describe('graph-instructions', () => {
  it('should render instructions text', async () => {
    const el = await fixture<GraphInstructions>(html`<graph-instructions></graph-instructions>`);

    expect(el).to.exist;
    const container = el.shadowRoot!.querySelector('.container');
    expect(container).to.exist;
    expect(container!.textContent).to.include('Drag nodes to reposition');
    expect(container!.textContent).to.include('Click to inspect');
    expect(container!.textContent).to.include('Scroll to zoom');
  });
});

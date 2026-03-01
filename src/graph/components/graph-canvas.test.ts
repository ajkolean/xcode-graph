import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { ViewMode } from '@shared/schemas';
import { describe, it } from 'vitest';
import type { GraphCanvas } from './graph-canvas';
import './graph-canvas';

describe('xcode-graph-canvas', () => {
  it('should set up a canvas element on render', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas');
    expect(canvas).to.exist;
  });

  it('should initialize constructor with default values', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);

    expect(el.nodes).to.deep.equal([]);
    expect(el.edges).to.deep.equal([]);
    expect(el.selectedNode).to.be.null;
    expect(el.selectedCluster).to.be.null;
    expect(el.hoveredNode).to.be.null;
    expect(el.searchQuery).to.equal('');
    expect(el.viewMode).to.equal(ViewMode.Full);
    expect(el.zoom).to.equal(1);
    expect(el.enableAnimation).to.equal(false);
    expect(el.showDirectDeps).to.equal(false);
    expect(el.showTransitiveDeps).to.equal(false);
    expect(el.showDirectDependents).to.equal(false);
    expect(el.showTransitiveDependents).to.equal(false);
  });

  it('should have canvas with tabindex for keyboard accessibility', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas');
    expect(canvas?.getAttribute('tabindex')).to.equal('-1');
  });

  it('should dispatch zoom-in event on "+" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-in');
    expect(event).to.exist;
  });

  it('should dispatch zoom-out event on "-" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-out');
    expect(event).to.exist;
  });

  it('should dispatch zoom-reset event on "0" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })),
    );
    const event = await oneEvent(el, 'zoom-reset');
    expect(event).to.exist;
  });

  it('should dispatch node-select with null on "Escape" keydown', async () => {
    const el = await fixture<GraphCanvas>(html`<xcode-graph-canvas></xcode-graph-canvas>`);
    await el.updateComplete;

    const canvas = el.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    setTimeout(() =>
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    const event = await oneEvent(el, 'node-select');
    expect(event).to.exist;
    expect((event as CustomEvent).detail.node).to.be.null;
  });
});

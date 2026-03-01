/**
 * GraphOverlays Components Tests
 *
 * Tests for GraphBackground, GraphControls, GraphEmptyState, and GraphInstructions.
 */
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './graph-overlays';
import { querySvgElement } from './test-helpers/svg-assertions';
describe('xcode-graph-background', () => {
    it('should render SVG with grid pattern', async () => {
        const el = await fixture(html `<xcode-graph-background></xcode-graph-background>`);
        const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
        expect(svg).to.exist;
    });
    it('should define grid pattern in defs', async () => {
        const el = await fixture(html `<xcode-graph-background></xcode-graph-background>`);
        const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
        expect(svg).to.exist;
        if (!svg)
            return;
        const defs = querySvgElement(svg, 'defs');
        expect(defs).to.exist;
        if (!defs)
            return;
        const pattern = querySvgElement(defs, 'pattern#grid');
        expect(pattern).to.exist;
    });
    it('should have rect with grid pattern fill', async () => {
        const el = await fixture(html `<xcode-graph-background></xcode-graph-background>`);
        const svg = el.shadowRoot ? querySvgElement(el.shadowRoot, 'svg') : null;
        expect(svg).to.exist;
        if (!svg)
            return;
        const rect = querySvgElement(svg, 'rect');
        expect(rect).to.exist;
        expect(rect?.getAttribute('fill')).to.equal('url(#grid)');
    });
});
describe('xcode-graph-controls', () => {
    it('should render with default zoom', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1"></xcode-graph-controls>`);
        expect(el).to.exist;
        expect(el.zoom).to.equal(1);
    });
    it('should display zoom percentage correctly', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1.5"></xcode-graph-controls>`);
        await el.updateComplete;
        const container = el.shadowRoot?.querySelector('.container');
        expect(container?.textContent).to.include('150%');
    });
    it('should render zoom buttons', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1"></xcode-graph-controls>`);
        const zoomInBtn = el.shadowRoot?.querySelector('button[title="Zoom in"]');
        const zoomOutBtn = el.shadowRoot?.querySelector('button[title="Zoom out"]');
        const resetBtn = el.shadowRoot?.querySelector('button[title="Fit to view"]');
        expect(zoomInBtn).to.exist;
        expect(zoomOutBtn).to.exist;
        expect(resetBtn).to.exist;
    });
    it('should dispatch zoom-step event when zoom in button clicked', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`);
        const zoomInBtn = el.shadowRoot?.querySelector('button[title="Zoom in"]');
        setTimeout(() => zoomInBtn.click());
        const event = await oneEvent(el, 'zoom-step');
        expect(event).to.exist;
    });
    it('should dispatch zoom-step event when zoom out button clicked', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1" base-zoom="1"></xcode-graph-controls>`);
        const zoomOutBtn = el.shadowRoot?.querySelector('button[title="Zoom out"]');
        setTimeout(() => zoomOutBtn.click());
        const event = await oneEvent(el, 'zoom-step');
        expect(event).to.exist;
    });
    it('should dispatch zoom-reset event when reset button clicked', async () => {
        const el = await fixture(html `<xcode-graph-controls zoom="1"></xcode-graph-controls>`);
        const resetBtn = el.shadowRoot?.querySelector('button[title="Fit to view"]');
        setTimeout(() => resetBtn.click());
        const event = await oneEvent(el, 'zoom-reset');
        expect(event).to.exist;
    });
});
describe('xcode-graph-visualization-empty-state', () => {
    it('should render empty state message', async () => {
        const el = await fixture(html `<xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>`);
        expect(el).to.exist;
        const message = el.shadowRoot?.querySelector('.message');
        expect(message).to.exist;
        expect(message?.textContent).to.include('No nodes to display');
    });
    it('should render hint text', async () => {
        const el = await fixture(html `<xcode-graph-visualization-empty-state></xcode-graph-visualization-empty-state>`);
        const hint = el.shadowRoot?.querySelector('.hint');
        expect(hint).to.exist;
        expect(hint?.textContent).to.include('Try adjusting your filters');
    });
});
describe('xcode-graph-instructions', () => {
    it('should render instructions text', async () => {
        const el = await fixture(html `<xcode-graph-instructions></xcode-graph-instructions>`);
        expect(el).to.exist;
        const container = el.shadowRoot?.querySelector('.container');
        expect(container).to.exist;
        expect(container?.textContent).to.include('Drag nodes to reposition');
        expect(container?.textContent).to.include('Click to inspect');
        expect(container?.textContent).to.include('Scroll to zoom');
    });
});
//# sourceMappingURL=graph-overlays.test.js.map
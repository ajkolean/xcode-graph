/**
 * GraphSVGDefs Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSVGDefs } from './graph-svg-defs';
import './graph-svg-defs';

describe('graph-svg-defs', () => {
  it('should render', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-svg-defs');
  });

  it('should render defs element', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    // Component renders to Light DOM (no Shadow DOM for SVG)
    const defs = el.querySelector('defs');
    expect(defs).to.exist;
  });

  it('should define glow filter', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    const filter = el.querySelector('#glow');
    expect(filter).to.exist;
  });

  it('should define glow-strong filter', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    const filter = el.querySelector('#glow-strong');
    expect(filter).to.exist;
  });

  it('should define arrowhead marker', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    const marker = el.querySelector('#arrowhead');
    expect(marker).to.exist;
    expect(marker?.getAttribute('markerWidth')).to.equal('10');
  });

  it('should define arrowhead-highlight marker', async () => {
    const el = await fixture<GraphSVGDefs>(html`
      <graph-svg-defs></graph-svg-defs>
    `);

    const marker = el.querySelector('#arrowhead-highlight');
    expect(marker).to.exist;
    expect(marker?.getAttribute('markerWidth')).to.equal('10');
  });
});

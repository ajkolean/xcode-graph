/**
 * PanelSection Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphPanelSection } from './panel-section';
import './panel-section';

describe('xcode-graph-panel-section', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphPanelSection>(html`
      <xcode-graph-panel-section>Content</xcode-graph-panel-section>
    `);

    expect(el).to.exist;
    expect(el.bordered).to.be.false;
    expect(el.padding).to.equal('md');
    expect(el.shrink).to.be.true;
  });

  it('should render slotted content', async () => {
    const el = await fixture<GraphPanelSection>(html`
      <xcode-graph-panel-section>
        <div class="test-content">Test Content</div>
      </xcode-graph-panel-section>
    `);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).to.exist;
  });

  it('should support bordered attribute', async () => {
    const el = await fixture<GraphPanelSection>(html`
      <xcode-graph-panel-section bordered></xcode-graph-panel-section>
    `);

    expect(el.bordered).to.be.true;
    expect(el.hasAttribute('bordered')).to.be.true;
  });

  it('should support padding attribute', async () => {
    const el = await fixture<GraphPanelSection>(html`
      <xcode-graph-panel-section padding="lg"></xcode-graph-panel-section>
    `);

    expect(el.padding).to.equal('lg');
    expect(el.getAttribute('padding')).to.equal('lg');
  });

  it('should support shrink attribute', async () => {
    const el = await fixture<GraphPanelSection>(html`
      <xcode-graph-panel-section shrink></xcode-graph-panel-section>
    `);

    expect(el.shrink).to.be.true;
    expect(el.hasAttribute('shrink')).to.be.true;
  });

});

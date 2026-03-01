/**
 * CollapsibleSection Accessibility Tests
 *
 * Uses vitest-axe to verify the collapsible section meets accessibility standards.
 */

import { expect as chaiExpect, fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphCollapsibleSection } from './collapsible-section';
import './collapsible-section';

describe('xcode-graph-collapsible-section a11y', () => {
  it('should have no accessibility violations when collapsed', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Filters">
        <div>Filter content here</div>
      </xcode-graph-collapsible-section>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when expanded', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Filters" is-expanded>
        <div>Filter content here</div>
      </xcode-graph-collapsible-section>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have aria-expanded="false" when collapsed', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test"></xcode-graph-collapsible-section>
    `);

    const button = el.shadowRoot?.querySelector('.header-button');
    chaiExpect(button).to.exist;
    chaiExpect(button?.getAttribute('aria-expanded')).to.equal('false');
  });

  it('should have aria-expanded="true" when expanded', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test" is-expanded></xcode-graph-collapsible-section>
    `);

    const button = el.shadowRoot?.querySelector('.header-button');
    chaiExpect(button).to.exist;
    chaiExpect(button?.getAttribute('aria-expanded')).to.equal('true');
  });

  it('should toggle aria-expanded on click', async () => {
    const el = await fixture<GraphCollapsibleSection>(html`
      <xcode-graph-collapsible-section title="Test"></xcode-graph-collapsible-section>
    `);

    const button = el.shadowRoot?.querySelector('.header-button') as HTMLButtonElement;
    chaiExpect(button?.getAttribute('aria-expanded')).to.equal('false');

    // Listen for toggle event and update the property (simulating parent behavior)
    el.addEventListener('toggle', () => {
      el.isExpanded = !el.isExpanded;
    });

    button.click();
    await el.updateComplete;

    chaiExpect(button?.getAttribute('aria-expanded')).to.equal('true');
  });
});

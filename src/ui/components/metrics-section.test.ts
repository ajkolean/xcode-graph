/**
 * MetricsSection Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphMetricsSection } from './metrics-section';
import './metrics-section';

describe('xcode-graph-metrics-section', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-metrics-section');
  });

  it('should render header with Metrics title', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent?.trim()).to.equal('Metrics');
  });

  it('should start expanded by default', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    const grid = el.shadowRoot?.querySelector('.grid');
    expect(grid).to.exist;
  });

  it('should collapse on header click', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    header.click();
    await el.updateComplete;

    const grid = el.shadowRoot?.querySelector('.grid');
    expect(grid).to.not.exist;
  });

  it('should set aria-expanded attribute', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    expect(header.getAttribute('aria-expanded')).to.equal('true');

    header.click();
    await el.updateComplete;
    expect(header.getAttribute('aria-expanded')).to.equal('false');
  });

  it('should render four stats cards when expanded', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section
        dependencies-count="5"
        dependents-count="3"
        total-dependencies-count="10"
        total-dependents-count="8"
        transitive-dependencies-count="15"
        transitive-dependents-count="12"
      ></xcode-graph-metrics-section>
    `);

    const cards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    expect(cards?.length).to.equal(4);
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch toggle-direct-deps event', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section
        dependencies-count="5"
        total-dependencies-count="10"
      ></xcode-graph-metrics-section>
    `);

    const cards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    const depsCard = cards?.[0];
    setTimeout(() => depsCard?.dispatchEvent(new CustomEvent('card-toggle', { bubbles: true })));
    const event = await oneEvent(el, 'toggle-direct-deps');

    expect(event).to.exist;
  });

  it('should dispatch toggle-direct-dependents event', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section
        dependents-count="3"
        total-dependents-count="8"
      ></xcode-graph-metrics-section>
    `);

    const cards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    const dependentsCard = cards?.[1];
    setTimeout(() =>
      dependentsCard?.dispatchEvent(new CustomEvent('card-toggle', { bubbles: true })),
    );
    const event = await oneEvent(el, 'toggle-direct-dependents');

    expect(event).to.exist;
  });

  // ========================================
  // Property Tests
  // ========================================

  it('should reflect attribute properties', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section
        dependencies-count="5"
        dependents-count="3"
        total-dependencies-count="10"
        total-dependents-count="8"
      ></xcode-graph-metrics-section>
    `);

    expect(el.dependenciesCount).to.equal(5);
    expect(el.dependentsCount).to.equal(3);
    expect(el.totalDependenciesCount).to.equal(10);
    expect(el.totalDependentsCount).to.equal(8);
  });

  it('should render no stats cards when counts are zero and collapsed', async () => {
    const el = await fixture<GraphMetricsSection>(html`
      <xcode-graph-metrics-section></xcode-graph-metrics-section>
    `);

    // Collapse the section
    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    header.click();
    await el.updateComplete;

    const cards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    expect(cards?.length ?? 0).to.equal(0);
  });
});

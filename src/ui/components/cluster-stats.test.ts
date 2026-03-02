/**
 * ClusterStats Lit Component Tests
 *
 * Tests for collapsible metrics section, event dispatch,
 * target breakdown rendering, and platform badges.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphClusterStats } from './cluster-stats';
import './cluster-stats';

describe('xcode-graph-cluster-stats', () => {
  it('should render with header showing Metrics title', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
      ></xcode-graph-cluster-stats>
    `);

    const header = el.shadowRoot?.querySelector('.header');
    expect(header).not.toBeNull();
    const title = el.shadowRoot?.querySelector('.header-title');
    expect(title?.textContent).to.equal('Metrics');
  });

  it('should start expanded by default and show content', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
      ></xcode-graph-cluster-stats>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    expect(header?.getAttribute('aria-expanded')).to.equal('true');
    const content = el.shadowRoot?.querySelector('.content');
    expect(content).not.toBeNull();
  });

  it('should toggle expansion on header click', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
      ></xcode-graph-cluster-stats>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    expect(header?.getAttribute('aria-expanded')).to.equal('true');

    // Click to collapse
    header.click();
    await el.updateComplete;

    expect(header?.getAttribute('aria-expanded')).to.equal('false');
    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeNull();

    // Click to expand again
    header.click();
    await el.updateComplete;

    expect(header?.getAttribute('aria-expanded')).to.equal('true');
    const contentAfter = el.shadowRoot?.querySelector('.content');
    expect(contentAfter).not.toBeNull();
  });

  it('should dispatch toggle-direct-deps when dependencies card is toggled', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
      ></xcode-graph-cluster-stats>
    `);

    let firedEvent: string | null = null;
    el.addEventListener('toggle-direct-deps', () => {
      firedEvent = 'toggle-direct-deps';
    });

    // Find the dependencies stats card and trigger card-toggle
    const statsCards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    const depsCard = statsCards?.[0] as HTMLElement;
    depsCard?.dispatchEvent(new CustomEvent('card-toggle', { bubbles: true, composed: true }));

    expect(firedEvent).to.equal('toggle-direct-deps');
  });

  it('should dispatch toggle-direct-dependents when dependents card is toggled', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
      ></xcode-graph-cluster-stats>
    `);

    let firedEvent: string | null = null;
    el.addEventListener('toggle-direct-dependents', () => {
      firedEvent = 'toggle-direct-dependents';
    });

    // Find the dependents stats card (second one) and trigger card-toggle
    const statsCards = el.shadowRoot?.querySelectorAll('xcode-graph-stats-card');
    const dependentsCard = statsCards?.[1] as HTMLElement;
    dependentsCard?.dispatchEvent(
      new CustomEvent('card-toggle', { bubbles: true, composed: true }),
    );

    expect(firedEvent).to.equal('toggle-direct-dependents');
  });

  it('should render target breakdown sorted by count descending, filtering zeros', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .targetBreakdown=${{ framework: 5, library: 2, test: 0, app: 8 }}
      ></xcode-graph-cluster-stats>
    `);

    const typeBadges = el.shadowRoot?.querySelectorAll('.type-badge');
    expect(typeBadges).toBeDefined();
    // Should have 3 entries (test=0 is filtered out)
    expect(typeBadges?.length).to.equal(3);

    // Should be sorted by count descending: app(8), framework(5), library(2)
    const counts = Array.from(typeBadges ?? []).map((badge) =>
      badge.querySelector('.type-count')?.textContent?.trim(),
    );
    expect(counts).to.deep.equal(['8', '5', '2']);
  });

  it('should not render target breakdown when empty', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .targetBreakdown=${{}}
      ></xcode-graph-cluster-stats>
    `);

    const sectionTitles = el.shadowRoot?.querySelectorAll('.section-title');
    const targetSection = Array.from(sectionTitles ?? []).find(
      (s) => s.textContent === 'Target Breakdown',
    );
    expect(targetSection).toBeUndefined();
  });

  it('should not render target breakdown when all counts are zero', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .targetBreakdown=${{ framework: 0, library: 0 }}
      ></xcode-graph-cluster-stats>
    `);

    const typeBadges = el.shadowRoot?.querySelectorAll('.type-badge');
    expect(typeBadges?.length ?? 0).to.equal(0);
  });

  it('should render platform badges when platforms are provided', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .platforms=${new Set(['iOS', 'macOS'])}
      ></xcode-graph-cluster-stats>
    `);

    const platformBadges = el.shadowRoot?.querySelectorAll('.platform-badge');
    expect(platformBadges?.length).to.equal(2);

    const names = Array.from(platformBadges ?? []).map((badge) =>
      badge.querySelector('.platform-name')?.textContent?.trim(),
    );
    expect(names).to.include('iOS');
    expect(names).to.include('macOS');
  });

  it('should not render platform section when platforms set is empty', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .platforms=${new Set<string>()}
      ></xcode-graph-cluster-stats>
    `);

    const platformBadges = el.shadowRoot?.querySelectorAll('.platform-badge');
    expect(platformBadges?.length ?? 0).to.equal(0);
  });

  it('should respect expanded=false initial property', async () => {
    const el = await fixture<GraphClusterStats>(html`
      <xcode-graph-cluster-stats
        filtered-dependencies="3"
        total-dependencies="5"
        filtered-dependents="2"
        total-dependents="4"
        .expanded=${false}
      ></xcode-graph-cluster-stats>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    expect(header?.getAttribute('aria-expanded')).to.equal('false');
    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeNull();
  });
});

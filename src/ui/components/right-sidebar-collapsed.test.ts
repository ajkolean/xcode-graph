/**
 * CollapsedSidebar Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphCollapsedSidebar } from './right-sidebar-collapsed';
import './right-sidebar-collapsed';

describe('xcode-graph-collapsed-sidebar', () => {
  it('should show product types badge when filterSize < typeCounts', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="2"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="5"
        .typeCounts=${new Map([
          ['app', 3],
          ['framework', 2],
          ['library', 1],
        ])}
        .platformCounts=${new Map([['iOS', 1]])}
        .projectCounts=${new Map([['P1', 1]])}
        .packageCounts=${new Map([['Pkg1', 1]])}
      ></xcode-graph-collapsed-sidebar>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.badge');
    expect(badges?.length).to.equal(1);
    expect(badges?.[0]?.textContent).to.equal('2');
  });

  it('should show platforms badge when filterSize < platformCounts', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="1"
        projects-filter-size="5"
        packages-filter-size="5"
        .typeCounts=${new Map([['app', 1]])}
        .platformCounts=${new Map([
          ['iOS', 3],
          ['macOS', 2],
          ['tvOS', 1],
        ])}
        .projectCounts=${new Map([['P1', 1]])}
        .packageCounts=${new Map([['Pkg1', 1]])}
      ></xcode-graph-collapsed-sidebar>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.badge');
    expect(badges?.length).to.equal(1);
    expect(badges?.[0]?.textContent).to.equal('1');
  });

  it('should show projects badge when filterSize < projectCounts', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="1"
        packages-filter-size="5"
        .typeCounts=${new Map([['app', 1]])}
        .platformCounts=${new Map([['iOS', 1]])}
        .projectCounts=${new Map([
          ['P1', 1],
          ['P2', 2],
          ['P3', 3],
        ])}
        .packageCounts=${new Map([['Pkg1', 1]])}
      ></xcode-graph-collapsed-sidebar>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.badge');
    expect(badges?.length).to.equal(1);
    expect(badges?.[0]?.textContent).to.equal('1');
  });

  it('should show packages badge when filterSize < packageCounts', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="2"
        .typeCounts=${new Map([['app', 1]])}
        .platformCounts=${new Map([['iOS', 1]])}
        .projectCounts=${new Map([['P1', 1]])}
        .packageCounts=${new Map([
          ['Pkg1', 1],
          ['Pkg2', 2],
          ['Pkg3', 3],
        ])}
      ></xcode-graph-collapsed-sidebar>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.badge');
    expect(badges?.length).to.equal(1);
    expect(badges?.[0]?.textContent).to.equal('2');
  });

  it('should show no badges when all filter sizes >= counts', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="5"
        .typeCounts=${new Map([['app', 1]])}
        .platformCounts=${new Map([['iOS', 1]])}
        .projectCounts=${new Map([['P1', 1]])}
        .packageCounts=${new Map([['Pkg1', 1]])}
      ></xcode-graph-collapsed-sidebar>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.badge');
    expect(badges?.length).to.equal(0);
  });

  it('should dispatch expand-to-section event with productTypes section', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="5"
      ></xcode-graph-collapsed-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.icon-button');
    const productTypesButton = buttons?.[0] as HTMLButtonElement;

    setTimeout(() => productTypesButton.click());
    const event = await oneEvent(el, 'expand-to-section');

    expect(event).to.exist;
    expect((event as CustomEvent).detail.section).to.equal('productTypes');
  });

  it('should dispatch expand-to-section event with platforms section', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="5"
      ></xcode-graph-collapsed-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.icon-button');
    const platformsButton = buttons?.[1] as HTMLButtonElement;

    setTimeout(() => platformsButton.click());
    const event = await oneEvent(el, 'expand-to-section');

    expect(event).to.exist;
    expect((event as CustomEvent).detail.section).to.equal('platforms');
  });

  it('should display 0 for nodes and edges when filteredNodes and filteredEdges are undefined', async () => {
    const el = await fixture<GraphCollapsedSidebar>(html`
      <xcode-graph-collapsed-sidebar
        node-types-filter-size="5"
        platforms-filter-size="5"
        projects-filter-size="5"
        packages-filter-size="5"
      ></xcode-graph-collapsed-sidebar>
    `);

    const statValues = el.shadowRoot?.querySelectorAll('.stat-value');
    expect(statValues?.[0]?.textContent).to.equal('0');
    expect(statValues?.[1]?.textContent).to.equal('0');
  });
});

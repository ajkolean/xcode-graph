/**
 * Sidebar Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { ActiveTab } from '@shared/schemas/app.types';
import { describe, expect, it } from 'vitest';
import type { GraphSidebar } from './sidebar';
import './sidebar';

describe('xcode-graph-sidebar', () => {
  it('should render all 9 navigation items', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="graph"></xcode-graph-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    expect(buttons?.length).to.equal(9);
  });

  it('should mark active tab with active class', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="graph"></xcode-graph-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    const graphButton = Array.from(buttons || []).find((btn) => btn.textContent?.includes('Graph'));

    expect(graphButton?.classList.contains('active')).toBe(true);
  });

  it('should dispatch tab-change event on click', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="overview"></xcode-graph-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    const graphButton = Array.from(buttons || []).find((btn) =>
      btn.textContent?.includes('Graph'),
    ) as HTMLButtonElement;

    setTimeout(() => graphButton?.click());
    const event = (await oneEvent(el, 'tab-change')) as CustomEvent<{ tab: string }>;

    expect(event).toBeDefined();
    expect(event.detail.tab).to.equal('graph');
  });

  it('should update active state when activeTab changes', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="overview"></xcode-graph-sidebar>
    `);

    let activeButton = el.shadowRoot?.querySelector('.nav-button.active');
    expect(activeButton?.textContent).to.include('Overview');

    el.activeTab = ActiveTab.Graph;
    await el.updateComplete;

    activeButton = el.shadowRoot?.querySelector('.nav-button.active');
    expect(activeButton?.textContent).to.include('Graph');
  });

  it('should start collapsed when collapsed attribute is set', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="graph" collapsed></xcode-graph-sidebar>
    `);

    expect(el.collapsed).toBe(true);
  });

  it('should toggle collapsed state on collapse button click', async () => {
    const el = await fixture<GraphSidebar>(html`
      <xcode-graph-sidebar active-tab="graph"></xcode-graph-sidebar>
    `);

    const collapseButton = el.shadowRoot?.querySelector('.collapse-button') as HTMLButtonElement;
    expect(collapseButton).toBeDefined();

    collapseButton?.click();
    await el.updateComplete;

    expect(el.collapsed).toBe(true);
  });
});

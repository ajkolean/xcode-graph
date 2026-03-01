/**
 * Sidebar Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { ActiveTab } from '@shared/schemas/app.types';
import { describe, it } from 'vitest';
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

    expect(graphButton?.classList.contains('active')).to.be.true;
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

    expect(event).to.exist;
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
});

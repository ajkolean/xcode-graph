/**
 * Sidebar Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { ActiveTab } from '@shared/schemas/app.types';
import { describe, it } from 'vitest';
import type { GraphSidebar } from './sidebar';
import './sidebar';

describe('graph-sidebar', () => {
  it('should render all 9 navigation items', async () => {
    const el = await fixture<GraphSidebar>(html`
      <graph-sidebar active-tab="graph"></graph-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    expect(buttons?.length).to.equal(9);
  });

  it('should mark active tab with active class', async () => {
    const el = await fixture<GraphSidebar>(html`
      <graph-sidebar active-tab="graph"></graph-sidebar>
    `);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    const graphButton = Array.from(buttons || []).find((btn) => btn.textContent?.includes('Graph'));

    expect(graphButton?.classList.contains('active')).to.be.true;
  });

  it('should dispatch tab-change event on click', async () => {
    const el = await fixture<GraphSidebar>(html`
      <graph-sidebar active-tab="overview"></graph-sidebar>
    `);

    let eventDetail: { tab: string } | undefined;
    el.addEventListener('tab-change', ((e: CustomEvent<{ tab: string }>) => {
      eventDetail = e.detail;
    }) as EventListener);

    const buttons = el.shadowRoot?.querySelectorAll('.nav-button');
    const graphButton = Array.from(buttons || []).find((btn) =>
      btn.textContent?.includes('Graph'),
    ) as HTMLButtonElement;

    graphButton?.click();
    await el.updateComplete;

    expect(eventDetail).to.exist;
    expect(eventDetail?.tab).to.equal('graph');
  });

  it('should update active state when activeTab changes', async () => {
    const el = await fixture<GraphSidebar>(html`
      <graph-sidebar active-tab="overview"></graph-sidebar>
    `);

    let activeButton = el.shadowRoot?.querySelector('.nav-button.active');
    expect(activeButton?.textContent).to.include('Overview');

    el.activeTab = ActiveTab.Graph;
    await el.updateComplete;

    activeButton = el.shadowRoot?.querySelector('.nav-button.active');
    expect(activeButton?.textContent).to.include('Graph');
  });
});

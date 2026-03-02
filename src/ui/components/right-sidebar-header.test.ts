/**
 * RightSidebarHeader Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphRightSidebarHeader } from './right-sidebar-header';
import './right-sidebar-header';

describe('xcode-graph-right-sidebar-header', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    expect(el).toBeDefined();
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-right-sidebar-header');
  });

  it('should render title text', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent?.trim()).to.equal('Filters');
  });

  // ========================================
  // Collapsed State Tests
  // ========================================

  it('should hide title when collapsed', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters" is-collapsed></xcode-graph-right-sidebar-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title).toBeNull();
  });

  it('should show title when not collapsed', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title).toBeDefined();
  });

  // ========================================
  // Active Filters Indicator Tests
  // ========================================

  it('should show active filters dot when has-active-filters is true', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters" has-active-filters></xcode-graph-right-sidebar-header>
    `);

    const dot = el.shadowRoot?.querySelector('.filters-active-dot');
    expect(dot).toBeDefined();
  });

  it('should not show active filters dot when has-active-filters is false', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const dot = el.shadowRoot?.querySelector('.filters-active-dot');
    expect(dot).toBeNull();
  });

  it('should not show active filters dot when collapsed even if filters active', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header
        title="Filters"
        is-collapsed
        has-active-filters
      ></xcode-graph-right-sidebar-header>
    `);

    const dot = el.shadowRoot?.querySelector('.filters-active-dot');
    expect(dot).toBeNull();
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch toggle-collapse event on icon button click', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const iconButton = el.shadowRoot?.querySelector('xcode-graph-icon-button') as HTMLElement;
    setTimeout(() => iconButton.click());
    const event = await oneEvent(el, 'toggle-collapse');

    expect(event).toBeDefined();
  });

  // ========================================
  // Collapse Icon Tests
  // ========================================

  it('should render collapse icon', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const collapseIcon = el.shadowRoot?.querySelector('xcode-graph-sidebar-collapse-icon');
    expect(collapseIcon).toBeDefined();
  });

  it('should pass collapsed state to collapse icon', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters" is-collapsed></xcode-graph-right-sidebar-header>
    `);

    const collapseIcon = el.shadowRoot?.querySelector('xcode-graph-sidebar-collapse-icon');
    expect(collapseIcon?.hasAttribute('is-collapsed')).toBe(true);
  });

  it('should set appropriate title on icon button', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters"></xcode-graph-right-sidebar-header>
    `);

    const iconButton = el.shadowRoot?.querySelector('xcode-graph-icon-button');
    expect(iconButton?.getAttribute('title')).to.equal('Collapse sidebar');
  });

  it('should set expand title when collapsed', async () => {
    const el = await fixture<GraphRightSidebarHeader>(html`
      <xcode-graph-right-sidebar-header title="Filters" is-collapsed></xcode-graph-right-sidebar-header>
    `);

    const iconButton = el.shadowRoot?.querySelector('xcode-graph-icon-button');
    expect(iconButton?.getAttribute('title')).to.equal('Expand sidebar');
  });
});

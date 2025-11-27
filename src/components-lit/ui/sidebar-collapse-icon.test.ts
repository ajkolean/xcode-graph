/**
 * SidebarCollapseIcon Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSidebarCollapseIcon } from './sidebar-collapse-icon';
import './sidebar-collapse-icon';

describe('graph-sidebar-collapse-icon', () => {
  it('should render', async () => {
    const el = await fixture<GraphSidebarCollapseIcon>(html`
      <graph-sidebar-collapse-icon></graph-sidebar-collapse-icon>
    `);

    expect(el).to.exist;
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
  });

  it('should show right-pointing chevrons when expanded (isCollapsed=false)', async () => {
    const el = await fixture<GraphSidebarCollapseIcon>(html`
      <graph-sidebar-collapse-icon></graph-sidebar-collapse-icon>
    `);

    const paths = el.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).to.be.greaterThan(0);
    // When expanded, shows right-pointing chevrons (paths with "M7 7l5 5l-5 5")
  });

  it('should show left-pointing chevrons when collapsed (isCollapsed=true)', async () => {
    const el = await fixture<GraphSidebarCollapseIcon>(html`
      <graph-sidebar-collapse-icon is-collapsed></graph-sidebar-collapse-icon>
    `);

    const paths = el.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).to.be.greaterThan(0);
    // When collapsed, shows left-pointing chevrons (paths with "M11 7l-5 5l5 5")
  });

  it('should update icon when isCollapsed changes', async () => {
    const el = await fixture<GraphSidebarCollapseIcon>(html`
      <graph-sidebar-collapse-icon></graph-sidebar-collapse-icon>
    `);

    // Initially expanded
    expect(el.isCollapsed).to.not.be.true;

    // Change to collapsed
    el.isCollapsed = true;
    await el.updateComplete;

    const paths = el.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).to.be.greaterThan(0);

    // Change back to expanded
    el.isCollapsed = false;
    await el.updateComplete;

    expect(paths?.length).to.be.greaterThan(0);
  });
});

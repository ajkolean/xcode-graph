/**
 * SidebarCollapseIcon Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSidebarCollapseIcon } from './sidebar-collapse-icon';
import './sidebar-collapse-icon';

describe('xcode-graph-sidebar-collapse-icon', () => {
  it('should render different chevron paths for collapsed and expanded states', async () => {
    const expanded = await fixture<GraphSidebarCollapseIcon>(html`
      <xcode-graph-sidebar-collapse-icon></xcode-graph-sidebar-collapse-icon>
    `);

    const collapsed = await fixture<GraphSidebarCollapseIcon>(html`
      <xcode-graph-sidebar-collapse-icon is-collapsed></xcode-graph-sidebar-collapse-icon>
    `);

    const expandedSvg = expanded.shadowRoot?.querySelector('svg');
    const collapsedSvg = collapsed.shadowRoot?.querySelector('svg');

    expect(expandedSvg).to.exist;
    expect(collapsedSvg).to.exist;

    const expandedPaths = expandedSvg?.querySelectorAll('path');
    const collapsedPaths = collapsedSvg?.querySelectorAll('path');

    // Both states render 3 paths (1 empty stroke-none + 2 chevron paths)
    expect(expandedPaths?.length).to.equal(3);
    expect(collapsedPaths?.length).to.equal(3);

    // The chevron path data should differ between states
    const expandedD = expandedPaths?.[1]?.getAttribute('d');
    const collapsedD = collapsedPaths?.[1]?.getAttribute('d');
    expect(expandedD).to.not.equal(collapsedD);
  });
});

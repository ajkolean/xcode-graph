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
});

/**
 * RightSidebar Accessibility Tests
 *
 * Uses vitest-axe to verify the right sidebar meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphRightSidebar } from './right-sidebar';
import './right-sidebar';

describe('xcode-graph-right-sidebar a11y', () => {
  it('should have no accessibility violations with empty data', async () => {
    const el = await fixture<GraphRightSidebar>(html`
      <xcode-graph-right-sidebar
        .allNodes=${[]}
        .allEdges=${[]}
        .filteredNodes=${[]}
        .filteredEdges=${[]}
      ></xcode-graph-right-sidebar>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });
});

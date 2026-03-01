/**
 * Badge Accessibility Tests
 *
 * Uses vitest-axe to verify the badge meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphBadge } from './badge';
import './badge';

describe('xcode-graph-badge a11y', () => {
  it('should have no accessibility violations with default variant', async () => {
    const el = await fixture<GraphBadge>(html`
      <xcode-graph-badge label="Target" color="#10B981"></xcode-graph-badge>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with accent variant', async () => {
    const el = await fixture<GraphBadge>(html`
      <xcode-graph-badge label="SDK" color="#F59E0B" variant="accent"></xcode-graph-badge>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });
});

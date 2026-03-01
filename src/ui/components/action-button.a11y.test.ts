/**
 * ActionButton Accessibility Tests
 *
 * Uses vitest-axe to verify the action button meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphActionButton } from './action-button';
import './action-button';

describe('xcode-graph-action-button a11y', () => {
  it('should have no accessibility violations with label text', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button>Show Dependencies</xcode-graph-action-button>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with icon and label', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button variant="primary">
        <svg slot="icon" viewBox="0 0 24 24"><path d="M12 12"></path></svg>
        Show Chain
      </xcode-graph-action-button>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button disabled>Disabled Action</xcode-graph-action-button>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });
});

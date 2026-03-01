/**
 * IconButton Accessibility Tests
 *
 * Uses vitest-axe to verify the icon button meets accessibility standards.
 */

import { expect as chaiExpect, fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphIconButton } from './icon-button';
import './icon-button';

describe('xcode-graph-icon-button a11y', () => {
  it('should have no accessibility violations with title', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button title="Close">
        <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
      </xcode-graph-icon-button>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button title="Close" disabled>
        <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg>
      </xcode-graph-icon-button>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have aria-label matching title', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button title="Settings">
        <svg viewBox="0 0 24 24"><path d="M12 12"></path></svg>
      </xcode-graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    chaiExpect(button).to.exist;
    chaiExpect(button?.getAttribute('aria-label')).to.equal('Settings');
  });
});

/**
 * AlertBanner Accessibility Tests
 *
 * Uses vitest-axe to verify the alert banner meets accessibility standards.
 */

import { expect as chaiExpect, fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphAlertBanner } from './alert-banner';
import './alert-banner';

describe('xcode-graph-alert-banner a11y', () => {
  it('should have no accessibility violations with message', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner
        variant="warning"
        title="Warning"
        message="Circular dependencies detected"
      ></xcode-graph-alert-banner>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when dismissible', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner
        variant="info"
        title="Info"
        message="Graph analysis complete"
        dismissible
      ></xcode-graph-alert-banner>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have role="alert" on the banner', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner
        variant="error"
        title="Error"
        message="Failed to load"
      ></xcode-graph-alert-banner>
    `);

    const banner = el.shadowRoot?.querySelector('.banner');
    expect(banner).toBeDefined();
    chaiExpect(banner?.getAttribute('role')).to.equal('alert');
  });

  it('should have aria-label on dismiss button', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner
        variant="warning"
        title="Warning"
        message="Test message"
        dismissible
      ></xcode-graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn');
    expect(closeBtn).toBeDefined();
    chaiExpect(closeBtn?.getAttribute('aria-label')).to.equal('Dismiss');
  });

  it('should have no accessibility violations with all variants', async () => {
    for (const variant of ['warning', 'error', 'info', 'success'] as const) {
      const el = await fixture<GraphAlertBanner>(html`
        <xcode-graph-alert-banner
          variant=${variant}
          title="${variant} Alert"
          message="Test message for ${variant}"
        ></xcode-graph-alert-banner>
      `);

      const results = await axe(el);
      expect(results).toHaveNoViolations();
    }
  });
});

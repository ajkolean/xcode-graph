/**
 * PanelHeader Accessibility Tests
 *
 * Uses vitest-axe to verify the panel header meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphPanelHeader } from './panel-header';
import './panel-header';

describe('xcode-graph-panel-header a11y', () => {
  it('should have no accessibility violations with title', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header
        title="MyTarget"
        subtitle="Framework"
        color="#10B981"
      ></xcode-graph-panel-header>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with badges', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header
        title="MyPackage"
        subtitle="Package"
        color="#8B5CF6"
      >
        <svg slot="icon" viewBox="0 0 24 24"><path d="M12 12"></path></svg>
      </xcode-graph-panel-header>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have aria-label on back button', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test" color="#000"></xcode-graph-panel-header>
    `);

    const backButton = el.shadowRoot?.querySelector('.back-button');
    expect(backButton).toBeDefined();
    chaiExpect(backButton?.getAttribute('aria-label')).to.equal('Back to overview');
  });
});

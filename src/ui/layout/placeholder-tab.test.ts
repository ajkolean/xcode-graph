/**
 * PlaceholderTab Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphPlaceholderTab } from './placeholder-tab';
import './placeholder-tab';

describe('xcode-graph-placeholder-tab', () => {
  it('should render title', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <xcode-graph-placeholder-tab title="Test Tab"></xcode-graph-placeholder-tab>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Test Tab');
  });

  it('should render subtitle', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <xcode-graph-placeholder-tab title="Builds"></xcode-graph-placeholder-tab>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle?.textContent).to.equal('This section is coming soon');
  });

  it('should update when title changes', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <xcode-graph-placeholder-tab title="Initial"></xcode-graph-placeholder-tab>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Initial');

    el.title = 'Updated';
    await el.updateComplete;

    expect(title?.textContent).to.equal('Updated');
  });
});

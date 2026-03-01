/**
 * PlaceholderTab Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphPlaceholderTab } from './placeholder-tab';
import './placeholder-tab';

describe('graph-placeholder-tab', () => {
  it('should render title', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <graph-placeholder-tab title="Test Tab"></graph-placeholder-tab>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Test Tab');
  });

  it('should render subtitle', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <graph-placeholder-tab title="Builds"></graph-placeholder-tab>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle?.textContent).to.equal('This section is coming soon');
  });

  it('should update when title changes', async () => {
    const el = await fixture<GraphPlaceholderTab>(html`
      <graph-placeholder-tab title="Initial"></graph-placeholder-tab>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Initial');

    el.title = 'Updated';
    await el.updateComplete;

    expect(title?.textContent).to.equal('Updated');
  });
});

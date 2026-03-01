/**
 * Header Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphHeader } from './header';
import './header';

describe('xcode-graph-header', () => {
  it('should render', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    expect(el).to.exist;
    const header = el.shadowRoot?.querySelector('header');
    expect(header).to.exist;
  });

  it('should render logo', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const logo = el.shadowRoot?.querySelector('.logo');
    expect(logo).to.exist;
  });

  it('should render breadcrumbs', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const breadcrumbs = el.shadowRoot?.querySelectorAll('.breadcrumb-button');
    expect(breadcrumbs?.length).to.equal(2);
  });

  it('should render docs button', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const docsButton = el.shadowRoot?.querySelector('.action-button[title="Documentation"]');
    expect(docsButton).to.exist;
  });

  it('should render user avatar', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const avatar = el.shadowRoot?.querySelector('.user-avatar');
    expect(avatar).to.exist;
    expect(avatar?.textContent).to.equal('A');
  });
});

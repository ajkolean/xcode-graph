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

    expect(el).toBeDefined();
    const header = el.shadowRoot?.querySelector('header');
    expect(header).toBeDefined();
  });

  it('should render logo', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const logo = el.shadowRoot?.querySelector('.logo');
    expect(logo).toBeDefined();
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
    expect(docsButton).toBeDefined();
  });

  it('should render user avatar', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const avatar = el.shadowRoot?.querySelector('.user-avatar');
    expect(avatar).toBeDefined();
    expect(avatar?.textContent).to.equal('A');
  });

  it('should render default breadcrumb text when no title prop', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const breadcrumbs = el.shadowRoot?.querySelectorAll('.breadcrumb-button');
    expect(breadcrumbs?.length).to.be.greaterThan(0);
    // First breadcrumb should have default org text
    const firstText = breadcrumbs?.[0]?.textContent?.trim();
    expect(firstText).to.include('tuist');
  });

  it('should render org avatar with initial inside first breadcrumb', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const avatar = el.shadowRoot?.querySelector('.breadcrumb-button .avatar');
    expect(avatar).toBeDefined();
    expect(avatar?.textContent).to.equal('T');
  });

  it('should render logo with SVG icon', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const logo = el.shadowRoot?.querySelector('.logo');
    const svg = logo?.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.querySelector('path')).toBeDefined();
  });

  it('should render status dot with Connected title', async () => {
    const el = await fixture<GraphHeader>(html`
      <xcode-graph-header></xcode-graph-header>
    `);

    const statusDot = el.shadowRoot?.querySelector('.status-dot');
    expect(statusDot).toBeDefined();
    expect(statusDot?.getAttribute('title')).to.equal('Connected');
  });
});

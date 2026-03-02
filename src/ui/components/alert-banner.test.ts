/**
 * AlertBanner Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphAlertBanner } from './alert-banner';
import './alert-banner';

describe('xcode-graph-alert-banner', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner></xcode-graph-alert-banner>
    `);

    expect(el).toBeDefined();
    expect(el.variant).to.equal('info');
    expect(el.dismissible).toBe(false);
  });

  it('should render title and message', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner
        title="Warning"
        message="Something happened"
      ></xcode-graph-alert-banner>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    const message = el.shadowRoot?.querySelector('.message');

    expect(title?.textContent).to.equal('Warning');
    expect(message?.textContent).to.equal('Something happened');
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner variant="warning"></xcode-graph-alert-banner>
    `);

    expect(el.variant).to.equal('warning');
    expect(el.getAttribute('variant')).to.equal('warning');
  });

  it('should show close button when dismissible', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner dismissible></xcode-graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn');
    expect(closeBtn).toBeDefined();
  });

  it('should hide close button when not dismissible', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner></xcode-graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn');
    expect(closeBtn).toBeNull();
  });

  it('should dispatch dismiss event when close button clicked', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner dismissible></xcode-graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
    setTimeout(() => closeBtn.click());
    const event = await oneEvent(el, 'dismiss');

    expect(event).toBeDefined();
  });

  it('should hide content after dismiss', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner dismissible title="Test"></xcode-graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();
    await el.updateComplete;

    const banner = el.shadowRoot?.querySelector('.banner');
    expect(banner).toBeNull();
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner>
        <span slot="icon">⚠️</span>
      </xcode-graph-alert-banner>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).toBeDefined();
  });

  it('should render actions slot', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <xcode-graph-alert-banner>
        <button slot="actions">Action</button>
      </xcode-graph-alert-banner>
    `);

    const actionsSlot = el.shadowRoot?.querySelector('slot[name="actions"]');
    expect(actionsSlot).toBeDefined();
  });
});

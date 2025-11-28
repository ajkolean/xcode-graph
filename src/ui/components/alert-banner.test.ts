/**
 * AlertBanner Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphAlertBanner } from './alert-banner';
import './alert-banner';

describe('graph-alert-banner', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner></graph-alert-banner>
    `);

    expect(el).to.exist;
    expect(el.variant).to.equal('info');
    expect(el.dismissible).to.be.false;
  });

  it('should render title and message', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner
        title="Warning"
        message="Something happened"
      ></graph-alert-banner>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    const message = el.shadowRoot?.querySelector('.message');

    expect(title?.textContent).to.equal('Warning');
    expect(message?.textContent).to.equal('Something happened');
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner variant="warning"></graph-alert-banner>
    `);

    expect(el.variant).to.equal('warning');
    expect(el.getAttribute('variant')).to.equal('warning');
  });

  it('should show close button when dismissible', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner dismissible></graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn');
    expect(closeBtn).to.exist;
  });

  it('should hide close button when not dismissible', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner></graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn');
    expect(closeBtn).to.not.exist;
  });

  it('should dispatch dismiss event when close button clicked', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner dismissible></graph-alert-banner>
    `);

    let eventFired = false;
    el.addEventListener('dismiss', () => {
      eventFired = true;
    });

    const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();

    expect(eventFired).to.be.true;
  });

  it('should hide content after dismiss', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner dismissible title="Test"></graph-alert-banner>
    `);

    const closeBtn = el.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();
    await el.updateComplete;

    const banner = el.shadowRoot?.querySelector('.banner');
    expect(banner).to.not.exist;
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner>
        <span slot="icon">⚠️</span>
      </graph-alert-banner>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).to.exist;
  });

  it('should render actions slot', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner>
        <button slot="actions">Action</button>
      </graph-alert-banner>
    `);

    const actionsSlot = el.shadowRoot?.querySelector('slot[name="actions"]');
    expect(actionsSlot).to.exist;
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphAlertBanner>(html`
      <graph-alert-banner></graph-alert-banner>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-alert-banner');
    expect(el.shadowRoot).to.exist;
  });
});

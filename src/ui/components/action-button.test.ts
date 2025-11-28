/**
 * ActionButton Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphActionButton } from './action-button';
import './action-button';

describe('graph-action-button', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button>Click Me</graph-action-button>
    `);

    expect(el).to.exist;
    expect(el.variant).to.equal('neutral');
    expect(el.active).to.be.false;
    expect(el.fullWidth).to.be.false;
    expect(el.disabled).to.be.false;
  });

  it('should render slotted content', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button>Click Me</graph-action-button>
    `);

    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).to.exist;
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button variant="primary">Primary</graph-action-button>
    `);

    expect(el.variant).to.equal('primary');
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('should support active state', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button active>Active</graph-action-button>
    `);

    expect(el.active).to.be.true;
    expect(el.hasAttribute('active')).to.be.true;
  });

  it('should support full-width attribute', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button full-width>Full Width</graph-action-button>
    `);

    expect(el.fullWidth).to.be.true;
    expect(el.hasAttribute('full-width')).to.be.true;
  });

  it('should support disabled state', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button disabled>Disabled</graph-action-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).to.be.true;
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button>
        <span slot="icon">🎯</span>
        With Icon
      </graph-action-button>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).to.exist;
  });

  it('should fire click event when clicked', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button>Click Me</graph-action-button>
    `);

    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(eventFired).to.be.true;
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphActionButton>(html`
      <graph-action-button></graph-action-button>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-action-button');
    expect(el.shadowRoot).to.exist;
  });
});

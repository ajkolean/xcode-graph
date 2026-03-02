/**
 * ActionButton Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphActionButton } from './action-button';
import './action-button';

describe('xcode-graph-action-button', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button>Click Me</xcode-graph-action-button>
    `);

    expect(el).toBeDefined();
    expect(el.variant).to.equal('neutral');
    expect(el.active).toBe(false);
    expect(el.fullWidth).toBe(false);
    expect(el.disabled).toBe(false);
  });

  it('should render slotted content', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button>Click Me</xcode-graph-action-button>
    `);

    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button variant="primary">Primary</xcode-graph-action-button>
    `);

    expect(el.variant).to.equal('primary');
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('should support active state', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button active>Active</xcode-graph-action-button>
    `);

    expect(el.active).toBe(true);
    expect(el.hasAttribute('active')).toBe(true);
  });

  it('should support full-width attribute', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button full-width>Full Width</xcode-graph-action-button>
    `);

    expect(el.fullWidth).toBe(true);
    expect(el.hasAttribute('full-width')).toBe(true);
  });

  it('should support disabled state', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button disabled>Disabled</xcode-graph-action-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  it('should render icon slot', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button>
        <span slot="icon">🎯</span>
        With Icon
      </xcode-graph-action-button>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).toBeDefined();
  });

  it('should fire click event when clicked', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button>Click Me</xcode-graph-action-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    setTimeout(() => button?.click());
    const event = await oneEvent(el, 'click');

    expect(event).toBeDefined();
  });

  it('should not fire click event when disabled', async () => {
    const el = await fixture<GraphActionButton>(html`
      <xcode-graph-action-button disabled>Disabled</xcode-graph-action-button>
    `);

    let clicked = false;
    el.addEventListener('click', () => {
      clicked = true;
    });

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    expect(clicked).toBe(false);
  });
});

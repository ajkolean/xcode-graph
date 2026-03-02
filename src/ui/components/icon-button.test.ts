/**
 * IconButton Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphIconButton } from './icon-button';
import './icon-button';

describe('xcode-graph-icon-button', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button>
        <svg><path d="M0 0"></path></svg>
      </xcode-graph-icon-button>
    `);

    expect(el).toBeDefined();
    expect(el.variant).to.equal('ghost');
    expect(el.color).to.equal('neutral');
    expect(el.size).to.equal('md');
    expect(el.disabled).toBe(false);
  });

  it('should render slotted icon', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button>
        <svg data-testid="icon"><path d="M0 0"></path></svg>
      </xcode-graph-icon-button>
    `);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  it('should apply title attribute', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button title="Close"></xcode-graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('title')).to.equal('Close');
  });

  it('should apply disabled state', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button disabled></xcode-graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button variant="subtle"></xcode-graph-icon-button>
    `);

    expect(el.variant).to.equal('subtle');
    expect(el.getAttribute('variant')).to.equal('subtle');
  });

  it('should support color property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button color="destructive"></xcode-graph-icon-button>
    `);

    expect(el.color).to.equal('destructive');
    expect(el.getAttribute('color')).to.equal('destructive');
  });

  it('should support size property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button size="sm"></xcode-graph-icon-button>
    `);

    expect(el.size).to.equal('sm');
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('should fire click event when clicked', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button></xcode-graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    setTimeout(() => button?.click());
    const event = await oneEvent(el, 'click');

    expect(event).toBeDefined();
  });

  it('should not fire click event when disabled', async () => {
    const el = await fixture<GraphIconButton>(html`
      <xcode-graph-icon-button disabled></xcode-graph-icon-button>
    `);

    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(eventFired).toBe(false);
  });
});

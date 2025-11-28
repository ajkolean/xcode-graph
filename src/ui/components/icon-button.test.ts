/**
 * IconButton Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphIconButton } from './icon-button';
import './icon-button';

describe('graph-icon-button', () => {
  it('should render with default properties', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button>
        <svg><path d="M0 0"></path></svg>
      </graph-icon-button>
    `);

    expect(el).to.exist;
    expect(el.variant).to.equal('ghost');
    expect(el.color).to.equal('neutral');
    expect(el.size).to.equal('md');
    expect(el.disabled).to.be.false;
  });

  it('should render slotted icon', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button>
        <svg data-testid="icon"><path d="M0 0"></path></svg>
      </graph-icon-button>
    `);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).to.exist;
  });

  it('should apply title attribute', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button title="Close"></graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('title')).to.equal('Close');
  });

  it('should apply disabled state', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button disabled></graph-icon-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).to.be.true;
  });

  it('should support variant property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button variant="subtle"></graph-icon-button>
    `);

    expect(el.variant).to.equal('subtle');
    expect(el.getAttribute('variant')).to.equal('subtle');
  });

  it('should support color property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button color="destructive"></graph-icon-button>
    `);

    expect(el.color).to.equal('destructive');
    expect(el.getAttribute('color')).to.equal('destructive');
  });

  it('should support size property', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button size="sm"></graph-icon-button>
    `);

    expect(el.size).to.equal('sm');
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('should fire click event when clicked', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button></graph-icon-button>
    `);

    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(eventFired).to.be.true;
  });

  it('should not fire click event when disabled', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button disabled></graph-icon-button>
    `);

    let eventFired = false;
    el.addEventListener('click', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(eventFired).to.be.false;
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphIconButton>(html`
      <graph-icon-button></graph-icon-button>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-icon-button');
    expect(el.shadowRoot).to.exist;
  });
});

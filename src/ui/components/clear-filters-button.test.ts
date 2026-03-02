/**
 * ClearFiltersButton Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClearFiltersButton } from './clear-filters-button';
import './clear-filters-button';

describe('xcode-graph-clear-filters-button', () => {
  it('should render button in shadow DOM', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button).toBeDefined();
    expect(button?.textContent?.trim()).to.equal('Clear all filters');
  });

  it('should be disabled when not active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should be enabled when active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should update disabled state when isActive changes', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    // Activate
    el.isActive = true;
    await el.updateComplete;
    expect(button.disabled).toBe(false);

    // Deactivate
    el.isActive = false;
    await el.updateComplete;
    expect(button.disabled).toBe(true);
  });

  it('should dispatch clear-filters event when clicked and active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'clear-filters');

    expect(event).toBeDefined();
  });

  it('should not dispatch event when clicked and disabled', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    let eventFired = false;
    el.addEventListener('clear-filters', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    expect(eventFired).toBe(false);
  });
});

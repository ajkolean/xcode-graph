/**
 * ClearFiltersButton Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClearFiltersButton } from './clear-filters-button';
import './clear-filters-button';

describe('xcode-graph-clear-filters-button', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-clear-filters-button');
  });

  it('should render button in shadow DOM', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button');
    expect(button).to.exist;
    expect(button?.textContent?.trim()).to.equal('Clear all filters');
  });

  // ========================================
  // Property Tests
  // ========================================

  it('should be disabled when not active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.true;
  });

  it('should be enabled when active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.false;
  });

  it('should update disabled state when isActive changes', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.true;

    // Activate
    el.isActive = true;
    await el.updateComplete;
    expect(button.disabled).to.be.false;

    // Deactivate
    el.isActive = false;
    await el.updateComplete;
    expect(button.disabled).to.be.true;
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch clear-filters event when clicked and active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button is-active></xcode-graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'clear-filters');

    expect(event).to.exist;
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

    expect(eventFired).to.be.false;
  });

  it('should be hidden when no filters are active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <xcode-graph-clear-filters-button></xcode-graph-clear-filters-button>
    `);

    // Without is-active attribute, the host has max-height: 0 and opacity: 0
    expect(el.isActive).to.not.be.true;
    expect(el.hasAttribute('is-active')).to.be.false;
  });
});

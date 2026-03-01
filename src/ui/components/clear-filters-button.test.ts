/**
 * ClearFiltersButton Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphClearFiltersButton } from './clear-filters-button';
import './clear-filters-button';

describe('graph-clear-filters-button', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <graph-clear-filters-button></graph-clear-filters-button>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-clear-filters-button');
  });

  it('should render button in shadow DOM', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <graph-clear-filters-button></graph-clear-filters-button>
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
      <graph-clear-filters-button></graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.true;
  });

  it('should be enabled when active', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <graph-clear-filters-button is-active></graph-clear-filters-button>
    `);

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).to.be.false;
  });

  it('should update disabled state when isActive changes', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <graph-clear-filters-button></graph-clear-filters-button>
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
      <graph-clear-filters-button is-active></graph-clear-filters-button>
    `);

    let eventFired = false;
    el.addEventListener('clear-filters', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    expect(eventFired).to.be.true;
  });

  it('should not dispatch event when clicked and disabled', async () => {
    const el = await fixture<GraphClearFiltersButton>(html`
      <graph-clear-filters-button></graph-clear-filters-button>
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
});

/**
 * EmptyState Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphEmptyState } from './empty-state';
import './empty-state';

describe('graph-empty-state', () => {
  it('should render', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state></graph-empty-state>
    `);

    expect(el).to.exist;
  });

  it('should show title and description', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state></graph-empty-state>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    const description = el.shadowRoot?.querySelector('.description');

    expect(title?.textContent).to.equal('No nodes match filters');
    expect(description?.textContent).to.equal('Try adjusting your filter settings');
  });

  it('should not show clear button when hasActiveFilters is false', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state></graph-empty-state>
    `);

    const button = el.shadowRoot?.querySelector('.clear-button');
    expect(button).to.not.exist;
  });

  it('should show clear button when hasActiveFilters is true', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state has-active-filters></graph-empty-state>
    `);

    const button = el.shadowRoot?.querySelector('.clear-button');
    expect(button).to.exist;
    expect(button?.textContent?.trim()).to.equal('Clear all filters');
  });

  it('should dispatch clear-filters event when button clicked', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state has-active-filters></graph-empty-state>
    `);

    let eventFired = false;
    el.addEventListener('clear-filters', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('.clear-button') as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    expect(eventFired).to.be.true;
  });

  it('should toggle button visibility when hasActiveFilters changes', async () => {
    const el = await fixture<GraphEmptyState>(html`
      <graph-empty-state></graph-empty-state>
    `);

    let button = el.shadowRoot?.querySelector('.clear-button');
    expect(button).to.not.exist;

    el.hasActiveFilters = true;
    await el.updateComplete;

    button = el.shadowRoot?.querySelector('.clear-button');
    expect(button).to.exist;

    el.hasActiveFilters = false;
    await el.updateComplete;

    button = el.shadowRoot?.querySelector('.clear-button');
    expect(button).to.not.exist;
  });
});

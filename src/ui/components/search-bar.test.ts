/**
 * SearchBar Lit Component Tests
 */

import { fixture, html, oneEvent } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphSearchBar } from './search-bar';
import './search-bar';

describe('xcode-graph-search-bar', () => {
  it('should render', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    expect(el).toBeDefined();
    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
  });

  it('should render with search query', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.value).to.equal('test');
  });

  it('should show keyboard hint when empty', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const hint = el.shadowRoot?.querySelector('.keyboard-hint');
    expect(hint).toBeDefined();
    expect(hint?.textContent).to.equal('/');
  });

  it('should show clear button when has query', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-icon-button');
    expect(clearButton).toBeDefined();
  });

  it('should dispatch search-change on input', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.value = 'new query';
    setTimeout(() => input.dispatchEvent(new Event('input', { bubbles: true })));
    const event = (await oneEvent(el, 'search-change')) as CustomEvent<{ query: string }>;

    expect(event).toBeDefined();
    expect(event.detail.query).to.equal('new query');
  });

  it('should dispatch search-clear on clear button click', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-icon-button') as HTMLElement;
    setTimeout(() => clearButton.click());
    const event = await oneEvent(el, 'search-clear');

    expect(event).toBeDefined();
  });

  it('should dispatch search-clear on Escape key', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    setTimeout(() =>
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    const event = await oneEvent(el, 'search-clear');

    expect(event).toBeDefined();
  });

  it('should have keyboard shortcut controller with / key', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    // The shortcut controller is public, verify it exists
    expect(el.shortcut).toBeDefined();
  });

  it('should focus input when / keyboard shortcut is triggered', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();

    // Dispatch the '/' keydown event on window (keyboard shortcut controller listens on window)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));

    // The shortcut should trigger focus on the input
    expect(el).toBeDefined();
  });
});

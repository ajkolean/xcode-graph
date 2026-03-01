/**
 * SearchBar Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSearchBar } from './search-bar';
import './search-bar';

describe('xcode-graph-search-bar', () => {
  it('should render', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    expect(el).to.exist;
    const input = el.shadowRoot?.querySelector('input');
    expect(input).to.exist;
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
    expect(hint).to.exist;
    expect(hint?.textContent).to.equal('/');
  });

  it('should show clear button when has query', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-icon-button');
    expect(clearButton).to.exist;
  });

  it('should dispatch search-change on input', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.value = 'new query';
    setTimeout(() => input.dispatchEvent(new Event('input', { bubbles: true })));
    const event = (await oneEvent(el, 'search-change')) as CustomEvent<{ query: string }>;

    expect(event).to.exist;
    expect(event.detail.query).to.equal('new query');
  });

  it('should dispatch search-clear on clear button click', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="test"></xcode-graph-search-bar>
    `);

    const clearButton = el.shadowRoot?.querySelector('xcode-graph-icon-button') as HTMLElement;
    setTimeout(() => clearButton.click());
    const event = await oneEvent(el, 'search-clear');

    expect(event).to.exist;
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

    expect(event).to.exist;
  });
});
